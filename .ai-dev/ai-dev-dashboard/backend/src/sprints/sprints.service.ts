import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSprintDto {
    @ApiProperty({ example: 'Sprint 13 — Auth Feature' })
    title: string;
    @ApiProperty({ example: '2026-03-15' })
    startDate: string;
    @ApiProperty({ example: '2026-03-29' })
    endDate: string;
    @ApiPropertyOptional({ example: 40 })
    capacityPoints?: number;
}

export class AssignStoriesDto {
    @ApiProperty({ type: [String], example: ['001.003', '001.004'] })
    storyIds: string[];
}

export class DailyProgressDto {
    @ApiProperty({ example: '2026-03-16' })
    date: string;
    @ApiProperty({ example: 5 })
    pointsCompleted: number;
    @ApiPropertyOptional({ example: 'Completed user login story' })
    notes?: string;
}

export interface Sprint {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    capacityPoints: number;
    stories: string[];
    dailyProgress: { date: string; pointsCompleted: number; notes?: string }[];
    status: string;
    path: string;
}

@Injectable()
export class SprintsService {
    private readonly logger = new Logger(SprintsService.name);
    private readonly sprintsPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        const docsPath = configService.get<string>('DOCS_PATH') || join(process.cwd(), '../../../docs');
        this.sprintsPath = join(docsPath, 'sprints');
    }

    async getSprints(): Promise<Sprint[]> {
        if (!existsSync(this.sprintsPath)) return [];
        return readdirSync(this.sprintsPath)
            .filter((f) => f.endsWith('.md') && f.startsWith('sprint-'))
            .map((f) => this.readSprint(join(this.sprintsPath, f)))
            .filter(Boolean) as Sprint[];
    }

    async getSprintById(id: string): Promise<Sprint> {
        const sprints = await this.getSprints();
        const sprint = sprints.find((s) => s.id === id);
        if (!sprint) throw new NotFoundException(`Sprint ${id} not found`);
        return sprint;
    }

    async getActiveSprint(): Promise<Sprint | null> {
        const sprints = await this.getSprints();
        return sprints.find((s) => s.status === 'active') || null;
    }

    async createSprint(dto: CreateSprintDto): Promise<Sprint> {
        if (!existsSync(this.sprintsPath)) mkdirSync(this.sprintsPath, { recursive: true });
        const nextId = this.getNextId();
        const fileName = `sprint-${nextId}.md`;
        const filePath = join(this.sprintsPath, fileName);

        const frontmatter = {
            id: nextId,
            title: dto.title,
            start_date: dto.startDate,
            end_date: dto.endDate,
            capacity_points: dto.capacityPoints || 0,
            stories: [],
            daily_progress: [],
            status: 'active',
            created_at: new Date().toISOString(),
        };

        this.markdownService.writeMarkdown(filePath, frontmatter, `# ${dto.title}\n`);
        this.logger.log(`Created sprint: ${fileName}`);
        return this.readSprint(filePath)!;
    }

    async assignStories(id: string, dto: AssignStoriesDto): Promise<Sprint> {
        const sprint = await this.getSprintById(id);
        const { frontmatter, content } = this.markdownService.parseMarkdown(sprint.path);
        frontmatter.stories = [...new Set([...(frontmatter.stories || []), ...dto.storyIds])];
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(sprint.path, frontmatter, content);
        return this.readSprint(sprint.path)!;
    }

    async recordDailyProgress(id: string, dto: DailyProgressDto): Promise<Sprint> {
        const sprint = await this.getSprintById(id);
        const { frontmatter, content } = this.markdownService.parseMarkdown(sprint.path);
        frontmatter.daily_progress = frontmatter.daily_progress || [];
        frontmatter.daily_progress.push({
            date: dto.date,
            points_completed: dto.pointsCompleted,
            notes: dto.notes || '',
        });
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(sprint.path, frontmatter, content);
        return this.readSprint(sprint.path)!;
    }

    calculateVelocity(sprint: Sprint): number {
        return sprint.dailyProgress.reduce((sum, d) => sum + d.pointsCompleted, 0);
    }

    calculateBurndown(sprint: Sprint): { date: string; remaining: number }[] {
        let remaining = sprint.capacityPoints;
        return sprint.dailyProgress.map((d) => {
            remaining -= d.pointsCompleted;
            return { date: d.date, remaining: Math.max(0, remaining) };
        });
    }

    private readSprint(filePath: string): Sprint | null {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || '',
                title: frontmatter.title || '',
                startDate: frontmatter.start_date || '',
                endDate: frontmatter.end_date || '',
                capacityPoints: frontmatter.capacity_points || 0,
                stories: frontmatter.stories || [],
                dailyProgress: (frontmatter.daily_progress || []).map((d: any) => ({
                    date: d.date,
                    pointsCompleted: d.points_completed || 0,
                    notes: d.notes,
                })),
                status: frontmatter.status || 'active',
                path: filePath,
            };
        } catch {
            return null;
        }
    }

    private getNextId(): string {
        if (!existsSync(this.sprintsPath)) return '001';
        const files = readdirSync(this.sprintsPath).filter((f) => f.startsWith('sprint-')).sort();
        if (files.length === 0) return '001';
        const lastNum = parseInt(files[files.length - 1].replace('sprint-', '').replace('.md', ''), 10);
        return String(lastNum + 1).padStart(3, '0');
    }
}

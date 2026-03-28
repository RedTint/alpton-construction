import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBurstDto {
    @ApiProperty({ example: 'Authentication deep-dive' })
    focusArea: string;
    @ApiPropertyOptional({ type: [String], example: ['001.003'] })
    storyIds?: string[];
}

export class StartSessionDto {
    @ApiPropertyOptional({ example: 'high', enum: ['high', 'medium', 'low'] })
    energyLevel?: string;
}

export class UpdateSessionDto {
    @ApiPropertyOptional({ example: 'flow', enum: ['flow', 'focused', 'distracted', 'blocked'] })
    flowState?: string;
    @ApiPropertyOptional({ example: 'Completed auth module' })
    notes?: string;
    @ApiPropertyOptional({ example: true })
    ended?: boolean;
}

export interface BurstSession {
    id: string;
    startedAt: string;
    endedAt?: string;
    flowState: string;
    energyLevel: string;
    notes: string;
}

export interface Burst {
    id: string;
    focusArea: string;
    stories: string[];
    sessions: BurstSession[];
    status: string;
    path: string;
}

@Injectable()
export class BurstsService {
    private readonly logger = new Logger(BurstsService.name);
    private readonly burstsPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        const docsPath = configService.get<string>('DOCS_PATH') || join(process.cwd(), '../../../docs');
        this.burstsPath = join(docsPath, 'bursts');
    }

    async getBursts(): Promise<Burst[]> {
        if (!existsSync(this.burstsPath)) return [];
        return readdirSync(this.burstsPath)
            .filter((f) => f.endsWith('.md') && f.startsWith('burst-'))
            .map((f) => this.readBurst(join(this.burstsPath, f)))
            .filter(Boolean) as Burst[];
    }

    async getBurstById(id: string): Promise<Burst> {
        const bursts = await this.getBursts();
        const burst = bursts.find((b) => b.id === id);
        if (!burst) throw new NotFoundException(`Burst ${id} not found`);
        return burst;
    }

    async getActiveBurst(): Promise<Burst | null> {
        const bursts = await this.getBursts();
        return bursts.find((b) => b.status === 'active') || null;
    }

    async createBurst(dto: CreateBurstDto): Promise<Burst> {
        if (!existsSync(this.burstsPath)) mkdirSync(this.burstsPath, { recursive: true });
        const nextId = this.getNextId();
        const fileName = `burst-${nextId}.md`;
        const filePath = join(this.burstsPath, fileName);

        const frontmatter = {
            id: nextId,
            focus_area: dto.focusArea,
            stories: dto.storyIds || [],
            sessions: [],
            status: 'active',
            created_at: new Date().toISOString(),
        };

        this.markdownService.writeMarkdown(filePath, frontmatter, `# Burst: ${dto.focusArea}\n`);
        return this.readBurst(filePath)!;
    }

    async startSession(burstId: string, dto: StartSessionDto): Promise<Burst> {
        const burst = await this.getBurstById(burstId);
        const { frontmatter, content } = this.markdownService.parseMarkdown(burst.path);
        const sessionId = String((frontmatter.sessions || []).length + 1).padStart(3, '0');
        frontmatter.sessions = frontmatter.sessions || [];
        frontmatter.sessions.push({
            id: sessionId,
            started_at: new Date().toISOString(),
            flow_state: 'focused',
            energy_level: dto.energyLevel || 'medium',
            notes: '',
        });
        this.markdownService.writeMarkdown(burst.path, frontmatter, content);
        return this.readBurst(burst.path)!;
    }

    async updateSession(burstId: string, sessionId: string, dto: UpdateSessionDto): Promise<Burst> {
        const burst = await this.getBurstById(burstId);
        const { frontmatter, content } = this.markdownService.parseMarkdown(burst.path);
        const session = (frontmatter.sessions || []).find((s: any) => s.id === sessionId);
        if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
        if (dto.flowState) session.flow_state = dto.flowState;
        if (dto.notes) session.notes = dto.notes;
        if (dto.ended) session.ended_at = new Date().toISOString();
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(burst.path, frontmatter, content);
        return this.readBurst(burst.path)!;
    }

    private readBurst(filePath: string): Burst | null {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || '',
                focusArea: frontmatter.focus_area || '',
                stories: frontmatter.stories || [],
                sessions: (frontmatter.sessions || []).map((s: any) => ({
                    id: s.id, startedAt: s.started_at, endedAt: s.ended_at,
                    flowState: s.flow_state || 'focused', energyLevel: s.energy_level || 'medium', notes: s.notes || '',
                })),
                status: frontmatter.status || 'active',
                path: filePath,
            };
        } catch { return null; }
    }

    private getNextId(): string {
        if (!existsSync(this.burstsPath)) return '001';
        const files = readdirSync(this.burstsPath).filter((f) => f.startsWith('burst-')).sort();
        if (files.length === 0) return '001';
        const lastNum = parseInt(files[files.length - 1].replace('burst-', '').replace('.md', ''), 10);
        return String(lastNum + 1).padStart(3, '0');
    }
}

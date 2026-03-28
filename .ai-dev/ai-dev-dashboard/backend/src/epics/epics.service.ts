import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    rmSync,
} from 'fs';
import { join } from 'path';
import { CreateEpicDto, UpdateEpicDto } from './dto/epic.dto';

export interface Epic {
    id: string;
    name: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    storyCount: number;
    path: string;
}

@Injectable()
export class EpicsService {
    private readonly logger = new Logger(EpicsService.name);
    private readonly docsPath: string;
    private readonly epicsPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        this.docsPath =
            configService.get<string>('DOCS_PATH') ||
            join(process.cwd(), '../../../docs');
        this.epicsPath = join(this.docsPath, 'epics');
    }

    async getEpics(): Promise<Epic[]> {
        if (!existsSync(this.epicsPath)) {
            return [];
        }
        const dirs = readdirSync(this.epicsPath).filter((d) =>
            statSync(join(this.epicsPath, d)).isDirectory(),
        );
        return dirs.map((dir) => this.readEpic(dir)).filter(Boolean) as Epic[];
    }

    async getEpicById(id: string): Promise<Epic> {
        const dirs = existsSync(this.epicsPath)
            ? readdirSync(this.epicsPath).filter((d) =>
                d.startsWith(`${id}-`) && statSync(join(this.epicsPath, d)).isDirectory()
            )
            : [];
        if (dirs.length === 0) {
            throw new NotFoundException(`Epic ${id} not found`);
        }
        const epic = this.readEpic(dirs[0]);
        if (!epic) throw new NotFoundException(`Epic ${id} not found`);
        return epic;
    }

    async createEpic(dto: CreateEpicDto): Promise<Epic> {
        if (!existsSync(this.epicsPath)) {
            mkdirSync(this.epicsPath, { recursive: true });
        }
        const nextId = this.getNextId();
        const dirName = `${nextId}-epic-${dto.name}`;
        const epicDir = join(this.epicsPath, dirName);

        mkdirSync(epicDir, { recursive: true });
        for (const status of ['pending', 'in-progress', 'qa', 'done', 'blocked']) {
            mkdirSync(join(epicDir, status), { recursive: true });
        }

        const frontmatter = {
            id: nextId,
            title: dto.title,
            description: dto.description || '',
            priority: dto.priority || 'medium',
            status: 'active',
            created_at: new Date().toISOString(),
        };
        this.markdownService.writeMarkdown(
            join(epicDir, 'epic.md'),
            frontmatter,
            `# ${dto.title}\n\n${dto.description || ''}\n`,
        );

        this.logger.log(`Created epic: ${dirName}`);
        return this.readEpic(dirName)!;
    }

    async updateEpic(id: string, dto: UpdateEpicDto): Promise<Epic> {
        const epic = await this.getEpicById(id);
        // Support both epic.md and README.md
        const epicMdPath = existsSync(join(epic.path, 'epic.md'))
            ? join(epic.path, 'epic.md')
            : join(epic.path, 'README.md');
        const { frontmatter, content } =
            this.markdownService.parseMarkdown(epicMdPath);

        if (dto.title) frontmatter.title = dto.title;
        if (dto.description) frontmatter.description = dto.description;
        if (dto.priority) frontmatter.priority = dto.priority;
        if (dto.status) frontmatter.status = dto.status;
        frontmatter.updated_at = new Date().toISOString();

        this.markdownService.writeMarkdown(epicMdPath, frontmatter, content);
        this.logger.log(`Updated epic: ${id}`);
        return this.readEpic(join(epic.path).split('/').pop()!)!;
    }

    async deleteEpic(id: string): Promise<void> {
        const epic = await this.getEpicById(id);
        rmSync(epic.path, { recursive: true, force: true });
        this.logger.log(`Deleted epic: ${id}`);
    }

    private readEpic(dirName: string): Epic | null {
        const epicDir = join(this.epicsPath, dirName);
        
        // Extract basic info from dirname
        const name = dirName.replace(/^\d+-(epic-)?/, '');
        const extractedId = dirName.split('-')[0];
        const storyCount = this.countStories(epicDir);

        // Support both epic.md (service-created) and README.md (migrate-created)
        const epicMdPath = existsSync(join(epicDir, 'epic.md'))
            ? join(epicDir, 'epic.md')
            : existsSync(join(epicDir, 'README.md'))
                ? join(epicDir, 'README.md')
                : null;

        if (!epicMdPath) {
            // Return basic epic if metadata file is missing
            return {
                id: extractedId,
                name,
                title: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                description: '',
                priority: 'medium',
                status: 'active',
                storyCount,
                path: epicDir,
            };
        }

        try {
            const { frontmatter, content } = this.markdownService.parseMarkdown(epicMdPath);

            const id = frontmatter.id || frontmatter.epic_id || extractedId;

            // Parse title: from frontmatter, or from markdown "# Epic {id} - {title}" heading
            let title = frontmatter.title || '';
            if (!title && content) {
                const headingMatch = content.match(/^# (?:Epic \d+ - )?(.+)$/m);
                if (headingMatch) title = headingMatch[1].trim();
            }
            if (!title) title = name;

            // Parse priority from frontmatter or markdown "**Priority:** High"
            let priority = frontmatter.priority || 'medium';
            if (priority === 'medium' && content) {
                const prioMatch = content.match(/\*\*Priority:\*\*\s*(\w+)/i);
                if (prioMatch) priority = prioMatch[1].toLowerCase();
            }

            // Parse status from frontmatter or markdown "**Status:** Completed"
            let status = frontmatter.status || 'active';
            if (status === 'active' && content) {
                const statusMatch = content.match(/\*\*Status:\*\*\s*([^\n*]+)/i);
                if (statusMatch) {
                    const raw = statusMatch[1].trim().toLowerCase();
                    if (raw.includes('completed') || raw.includes('100%')) status = 'completed';
                    else if (raw.includes('in progress')) status = 'in-progress';
                    else status = raw.replace(/[✅🚧⏳⏸️]/g, '').trim() || 'active';
                }
            }

            // Parse description from frontmatter or markdown "## Description\n\n{text}"
            let description = frontmatter.description || '';
            if (!description && content) {
                const descMatch = content.match(/## Description\n+([^#]+)/m);
                if (descMatch) description = descMatch[1].trim().split('\n')[0];
            }

            return {
                id,
                name,
                title,
                description,
                priority,
                status,
                storyCount,
                path: epicDir,
            };
        } catch {
            this.logger.warn(`Failed to read epic: ${dirName}`);
            return null;
        }
    }

    private countStories(epicDir: string): number {
        let count = 0;
        for (const status of ['pending', 'in-progress', 'qa', 'done', 'blocked']) {
            const statusDir = join(epicDir, status);
            if (existsSync(statusDir)) {
                count += readdirSync(statusDir).filter((f) =>
                    f.endsWith('.md'),
                ).length;
            }
        }
        return count;
    }

    private getNextId(): string {
        if (!existsSync(this.epicsPath)) return '001';
        const dirs = readdirSync(this.epicsPath)
            .filter((d) => statSync(join(this.epicsPath, d)).isDirectory())
            .sort();
        if (dirs.length === 0) return '001';
        const lastId = parseInt(dirs[dirs.length - 1].split('-')[0], 10);
        return String(lastId + 1).padStart(3, '0');
    }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import {
    existsSync,
    mkdirSync,
    readdirSync,
    renameSync,
    rmSync,
} from 'fs';
import { join } from 'path';
import { CreateStoryDto, UpdateStoryStatusDto } from './dto/story.dto';

export interface Story {
    id: string;
    epicId: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    effort: number;
    path: string;
}

const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked'];

@Injectable()
export class StoriesService {
    private readonly logger = new Logger(StoriesService.name);
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

    async getStories(): Promise<Story[]> {
        const stories: Story[] = [];
        if (!existsSync(this.epicsPath)) return stories;

        const epicDirs = readdirSync(this.epicsPath).filter((d) => {
            try { return require('fs').statSync(join(this.epicsPath, d)).isDirectory(); } catch { return false; }
        });

        for (const epicDir of epicDirs) {
            const epicId = epicDir.split('-')[0];
            for (const status of STATUS_DIRS) {
                const statusDir = join(this.epicsPath, epicDir, status);
                if (!existsSync(statusDir)) continue;
                const files = readdirSync(statusDir).filter((f) => f.endsWith('.md'));
                for (const file of files) {
                    const story = this.readStory(join(statusDir, file), epicId, status);
                    if (story) stories.push(story);
                }
            }
        }
        return stories;
    }

    async getStoryById(id: string): Promise<Story> {
        const stories = await this.getStories();
        const story = stories.find((s) => s.id === id);
        if (!story) throw new NotFoundException(`Story ${id} not found`);
        return story;
    }

    async getStoriesByEpic(epicId: string): Promise<Story[]> {
        const stories = await this.getStories();
        return stories.filter((s) => s.epicId === epicId);
    }

    async createStory(dto: CreateStoryDto): Promise<Story> {
        const epicDir = this.findEpicDir(dto.epicId);
        const pendingDir = join(epicDir, 'pending');
        if (!existsSync(pendingDir)) {
            mkdirSync(pendingDir, { recursive: true });
        }

        const nextStoryNum = this.getNextStoryNum(epicDir);
        const fileName = `${dto.epicId}.${nextStoryNum}-${this.kebabCase(dto.title)}.md`;
        const filePath = join(pendingDir, fileName);

        const frontmatter = {
            id: `${dto.epicId}.${nextStoryNum}`,
            title: dto.title,
            description: dto.description || '',
            priority: dto.priority || 'medium',
            effort: dto.effort || 0,
            status: 'pending',
            created_at: new Date().toISOString(),
        };

        this.markdownService.writeMarkdown(
            filePath,
            frontmatter,
            `# ${dto.title}\n\n${dto.description || ''}\n`,
        );

        this.logger.log(`Created story: ${fileName}`);
        return this.readStory(filePath, dto.epicId, 'pending')!;
    }

    async moveStory(id: string, dto: UpdateStoryStatusDto): Promise<Story> {
        const story = await this.getStoryById(id);
        if (!STATUS_DIRS.includes(dto.status)) {
            throw new Error(`Invalid status: ${dto.status}. Valid: ${STATUS_DIRS.join(', ')}`);
        }
        if (story.status === dto.status) return story;

        const fileName = story.path.split('/').pop()!;
        const epicDir = join(story.path, '..', '..');
        const newStatusDir = join(epicDir, dto.status);
        if (!existsSync(newStatusDir)) mkdirSync(newStatusDir, { recursive: true });

        const newPath = join(newStatusDir, fileName);
        renameSync(story.path, newPath);

        // Update frontmatter
        const { frontmatter, content } = this.markdownService.parseMarkdown(newPath);
        frontmatter.status = dto.status;
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(newPath, frontmatter, content);

        this.logger.log(`Moved story ${id} to ${dto.status}`);
        return this.readStory(newPath, story.epicId, dto.status)!;
    }

    private readStory(filePath: string, epicId: string, status: string): Story | null {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                // Support both service-created (id) and migrate-created (story_id) keys
                id: frontmatter.id || frontmatter.story_id || filePath.split('/').pop()?.replace('.md', '') || '',
                epicId: frontmatter.epic_id || epicId,
                title: frontmatter.title || frontmatter.story_name || '',
                description: frontmatter.description || '',
                status: frontmatter.story_status || status,
                priority: frontmatter.priority || 'medium',
                effort: frontmatter.effort || frontmatter.story_points || 0,
                path: filePath,
            };
        } catch {
            return null;
        }
    }

    private findEpicDir(epicId: string): string {
        if (!existsSync(this.epicsPath)) {
            throw new NotFoundException(`Epics directory not found`);
        }
        // Match both {id}-epic-{name} and {id}-{name} conventions
        const dirs = readdirSync(this.epicsPath).filter((d) =>
            d.startsWith(`${epicId}-`) && require('fs').statSync(join(this.epicsPath, d)).isDirectory()
        );
        if (dirs.length === 0) throw new NotFoundException(`Epic ${epicId} not found`);
        return join(this.epicsPath, dirs[0]);
    }

    private getNextStoryNum(epicDir: string): string {
        let max = 0;
        for (const status of STATUS_DIRS) {
            const statusDir = join(epicDir, status);
            if (!existsSync(statusDir)) continue;
            const files = readdirSync(statusDir).filter((f: string) => f.endsWith('.md'));
            for (const f of files) {
                // Match both dot separator (001.003-name) and dash separator (001-003-name)
                const match = f.match(/^\d+[.-](\d{3})-/);
                if (match) max = Math.max(max, parseInt(match[1], 10));
            }
        }
        return String(max + 1).padStart(3, '0');
    }

    private kebabCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
}

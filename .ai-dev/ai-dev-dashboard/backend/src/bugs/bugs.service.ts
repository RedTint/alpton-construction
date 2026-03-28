import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'fs';
import { join } from 'path';
import { CreateBugDto, UpdateBugStatusDto } from './dto/bug.dto';

export interface Bug {
    id: string;
    name: string;
    title: string;
    description: string;
    severity: string;
    impact: string;
    rca: string;
    status: string;
    path: string;
}

const BUG_STATUS_DIRS = ['pending', 'in-progress', 'qa', 'fixed', 'wontfix'];

@Injectable()
export class BugsService {
    private readonly logger = new Logger(BugsService.name);
    private readonly bugsPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        const docsPath = configService.get<string>('DOCS_PATH') || join(process.cwd(), '../../../docs');
        this.bugsPath = join(docsPath, 'bugs');
    }

    async getBugs(): Promise<Bug[]> {
        const bugs: Bug[] = [];
        if (!existsSync(this.bugsPath)) return bugs;

        const bugDirs = readdirSync(this.bugsPath).filter((d) => {
            try { return statSync(join(this.bugsPath, d)).isDirectory(); } catch { return false; }
        });

        for (const bugDir of bugDirs) {
            for (const status of BUG_STATUS_DIRS) {
                const statusDir = join(this.bugsPath, bugDir, status);
                if (!existsSync(statusDir)) continue;
                const files = readdirSync(statusDir).filter((f) => f.endsWith('.md'));
                for (const file of files) {
                    const bug = this.readBug(join(statusDir, file), status);
                    if (bug) bugs.push(bug);
                }
            }
        }
        return bugs;
    }

    async getBugById(id: string): Promise<Bug> {
        const bugs = await this.getBugs();
        const bug = bugs.find((b) => b.id === id);
        if (!bug) throw new NotFoundException(`Bug ${id} not found`);
        return bug;
    }

    async createBug(dto: CreateBugDto): Promise<Bug> {
        if (!existsSync(this.bugsPath)) mkdirSync(this.bugsPath, { recursive: true });

        const nextId = this.getNextId();
        const dirName = `${nextId}-bug-${dto.name}`;
        const bugDir = join(this.bugsPath, dirName);

        mkdirSync(bugDir, { recursive: true });
        for (const status of BUG_STATUS_DIRS) {
            mkdirSync(join(bugDir, status), { recursive: true });
        }

        const fileName = `${nextId}.001-${dto.name}.md`;
        const filePath = join(bugDir, 'pending', fileName);

        const frontmatter = {
            id: `${nextId}.001`,
            title: dto.title,
            description: dto.description || '',
            severity: dto.severity,
            impact: dto.impact || '',
            rca: dto.rca || '',
            status: 'pending',
            created_at: new Date().toISOString(),
        };

        this.markdownService.writeMarkdown(filePath, frontmatter, `# ${dto.title}\n\n${dto.description || ''}\n`);
        this.logger.log(`Created bug: ${fileName}`);
        return this.readBug(filePath, 'pending')!;
    }

    async updateBugStatus(id: string, dto: UpdateBugStatusDto): Promise<Bug> {
        const bug = await this.getBugById(id);
        if (!BUG_STATUS_DIRS.includes(dto.status)) {
            throw new Error(`Invalid status: ${dto.status}`);
        }
        if (bug.status === dto.status) return bug;

        const fileName = bug.path.split('/').pop()!;
        const bugCategoryDir = join(bug.path, '..', '..');
        const newStatusDir = join(bugCategoryDir, dto.status);
        if (!existsSync(newStatusDir)) mkdirSync(newStatusDir, { recursive: true });

        const newPath = join(newStatusDir, fileName);
        renameSync(bug.path, newPath);

        const { frontmatter, content } = this.markdownService.parseMarkdown(newPath);
        frontmatter.status = dto.status;
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(newPath, frontmatter, content);

        this.logger.log(`Updated bug ${id} status to ${dto.status}`);
        return this.readBug(newPath, dto.status)!;
    }

    private readBug(filePath: string, status: string): Bug | null {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || '',
                name: frontmatter.title || '',
                title: frontmatter.title || '',
                description: frontmatter.description || '',
                severity: frontmatter.severity || 'medium',
                impact: frontmatter.impact || '',
                rca: frontmatter.rca || '',
                status,
                path: filePath,
            };
        } catch {
            return null;
        }
    }

    private getNextId(): string {
        if (!existsSync(this.bugsPath)) return '001';
        const dirs = readdirSync(this.bugsPath)
            .filter((d) => { try { return statSync(join(this.bugsPath, d)).isDirectory(); } catch { return false; } })
            .sort();
        if (dirs.length === 0) return '001';
        const lastId = parseInt(dirs[dirs.length - 1].split('-')[0], 10);
        return String(lastId + 1).padStart(3, '0');
    }
}

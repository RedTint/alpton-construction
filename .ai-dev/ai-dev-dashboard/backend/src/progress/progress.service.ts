import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface ProgressStats {
    totalStories: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    completionPct: number;
    totalPointsCompleted: number;
    totalPointsRemaining: number;
}

@Injectable()
export class ProgressService {
    private readonly logger = new Logger(ProgressService.name);
    private readonly docsPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        this.docsPath =
            configService.get<string>('DOCS_PATH') || join(__dirname, '..', '..', '..', 'docs');
    }

    async getProgress(): Promise<ProgressStats> {
        const epicsPath = join(this.docsPath, 'epics');
        if (!existsSync(epicsPath)) {
            return this.emptyStats();
        }

        let totalStories = 0;
        let completed = 0;
        let inProgress = 0;
        let pending = 0;
        let blocked = 0;
        let pointsCompleted = 0;
        let pointsRemaining = 0;

        const epicDirs = readdirSync(epicsPath).filter((d) => {
            try { return statSync(join(epicsPath, d)).isDirectory(); } catch { return false; }
        });

        for (const epicDir of epicDirs) {
            const epicPath = join(epicsPath, epicDir);
            for (const status of ['pending', 'in-progress', 'qa', 'done', 'blocked']) {
                const statusDir = join(epicPath, status);
                if (!existsSync(statusDir)) continue;
                const files = readdirSync(statusDir).filter((f) => f.endsWith('.md'));
                for (const file of files) {
                    totalStories++;
                    let effort = 0;
                    try {
                        const { frontmatter } = this.markdownService.parseMarkdown(join(statusDir, file));
                        effort = frontmatter.effort || 0;
                    } catch { /* ignore */ }

                    switch (status) {
                        case 'done': completed++; pointsCompleted += effort; break;
                        case 'in-progress': case 'qa': inProgress++; pointsRemaining += effort; break;
                        case 'blocked': blocked++; pointsRemaining += effort; break;
                        default: pending++; pointsRemaining += effort; break;
                    }
                }
            }
        }

        const completionPct = totalStories > 0 ? Math.round((completed / totalStories) * 100) : 0;

        return {
            totalStories, completed, inProgress, pending, blocked,
            completionPct, totalPointsCompleted: pointsCompleted, totalPointsRemaining: pointsRemaining,
        };
    }

    private emptyStats(): ProgressStats {
        return {
            totalStories: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0,
            completionPct: 0, totalPointsCompleted: 0, totalPointsRemaining: 0,
        };
    }
}

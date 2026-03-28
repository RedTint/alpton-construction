import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
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
export declare class ProgressService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly docsPath;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getProgress(): Promise<ProgressStats>;
    private emptyStats;
}

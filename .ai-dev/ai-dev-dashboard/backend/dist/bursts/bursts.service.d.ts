import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
export declare class CreateBurstDto {
    focusArea: string;
    storyIds?: string[];
}
export declare class StartSessionDto {
    energyLevel?: string;
}
export declare class UpdateSessionDto {
    flowState?: string;
    notes?: string;
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
export declare class BurstsService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly burstsPath;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getBursts(): Promise<Burst[]>;
    getBurstById(id: string): Promise<Burst>;
    getActiveBurst(): Promise<Burst | null>;
    createBurst(dto: CreateBurstDto): Promise<Burst>;
    startSession(burstId: string, dto: StartSessionDto): Promise<Burst>;
    updateSession(burstId: string, sessionId: string, dto: UpdateSessionDto): Promise<Burst>;
    private readBurst;
    private getNextId;
}

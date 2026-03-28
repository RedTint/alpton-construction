import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
export declare class CreateSprintDto {
    title: string;
    startDate: string;
    endDate: string;
    capacityPoints?: number;
}
export declare class AssignStoriesDto {
    storyIds: string[];
}
export declare class DailyProgressDto {
    date: string;
    pointsCompleted: number;
    notes?: string;
}
export interface Sprint {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    capacityPoints: number;
    stories: string[];
    dailyProgress: {
        date: string;
        pointsCompleted: number;
        notes?: string;
    }[];
    status: string;
    path: string;
}
export declare class SprintsService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly sprintsPath;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getSprints(): Promise<Sprint[]>;
    getSprintById(id: string): Promise<Sprint>;
    getActiveSprint(): Promise<Sprint | null>;
    createSprint(dto: CreateSprintDto): Promise<Sprint>;
    assignStories(id: string, dto: AssignStoriesDto): Promise<Sprint>;
    recordDailyProgress(id: string, dto: DailyProgressDto): Promise<Sprint>;
    calculateVelocity(sprint: Sprint): number;
    calculateBurndown(sprint: Sprint): {
        date: string;
        remaining: number;
    }[];
    private readSprint;
    private getNextId;
}

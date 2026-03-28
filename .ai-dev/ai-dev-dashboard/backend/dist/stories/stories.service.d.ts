import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
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
export declare class StoriesService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly docsPath;
    private readonly epicsPath;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getStories(): Promise<Story[]>;
    getStoryById(id: string): Promise<Story>;
    getStoriesByEpic(epicId: string): Promise<Story[]>;
    createStory(dto: CreateStoryDto): Promise<Story>;
    moveStory(id: string, dto: UpdateStoryStatusDto): Promise<Story>;
    private readStory;
    private findEpicDir;
    private getNextStoryNum;
    private kebabCase;
}

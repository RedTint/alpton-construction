import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
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
export declare class EpicsService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly docsPath;
    private readonly epicsPath;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getEpics(): Promise<Epic[]>;
    getEpicById(id: string): Promise<Epic>;
    createEpic(dto: CreateEpicDto): Promise<Epic>;
    updateEpic(id: string, dto: UpdateEpicDto): Promise<Epic>;
    deleteEpic(id: string): Promise<void>;
    private readEpic;
    private countStories;
    private getNextId;
}

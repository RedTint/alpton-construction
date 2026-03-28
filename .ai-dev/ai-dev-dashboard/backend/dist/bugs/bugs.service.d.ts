import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
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
export declare class BugsService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly bugsPath;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getBugs(): Promise<Bug[]>;
    getBugById(id: string): Promise<Bug>;
    createBug(dto: CreateBugDto): Promise<Bug>;
    updateBugStatus(id: string, dto: UpdateBugStatusDto): Promise<Bug>;
    private readBug;
    private getNextId;
}

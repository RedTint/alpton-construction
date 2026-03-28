import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
export interface DocumentInfo {
    path: string;
    name: string;
    type: string;
    size: number;
    versions?: string[];
}
export interface DocumentContent {
    path: string;
    name: string;
    content: string;
    frontmatter: Record<string, any>;
}
export declare class DocumentsService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly docsPath;
    private readonly DOC_TYPE_MAP;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    getDocuments(): Promise<DocumentInfo[]>;
    getDocumentByPath(docPath: string): Promise<DocumentContent>;
    searchDocuments(query: string): Promise<DocumentContent[]>;
    private scanDir;
}

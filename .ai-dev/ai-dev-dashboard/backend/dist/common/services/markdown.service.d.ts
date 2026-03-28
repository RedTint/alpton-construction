import { ConfigService } from '@nestjs/config';
export interface ParsedMarkdown {
    frontmatter: Record<string, any>;
    content: string;
}
export declare class MarkdownService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    parseMarkdown(filePath: string): ParsedMarkdown;
    writeMarkdown(filePath: string, frontmatter: Record<string, any>, content: string): void;
    extractFrontmatter(filePath: string): Record<string, any>;
    readRawContent(filePath: string): string;
}

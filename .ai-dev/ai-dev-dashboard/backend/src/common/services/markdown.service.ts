import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as matter from 'gray-matter';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ParsedMarkdown {
    frontmatter: Record<string, any>;
    content: string;
}

@Injectable()
export class MarkdownService {
    private readonly logger = new Logger(MarkdownService.name);

    constructor(private readonly configService: ConfigService) { }

    parseMarkdown(filePath: string): ParsedMarkdown {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const raw = readFileSync(filePath, 'utf-8');
        const parsed = matter(raw);
        return {
            frontmatter: parsed.data as Record<string, any>,
            content: parsed.content,
        };
    }

    writeMarkdown(
        filePath: string,
        frontmatter: Record<string, any>,
        content: string,
    ): void {
        const output = matter.stringify(content, frontmatter);
        writeFileSync(filePath, output, 'utf-8');
        this.logger.log(`Written markdown to ${filePath}`);
    }

    extractFrontmatter(filePath: string): Record<string, any> {
        const { frontmatter } = this.parseMarkdown(filePath);
        return frontmatter;
    }

    readRawContent(filePath: string): string {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return readFileSync(filePath, 'utf-8');
    }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

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

@Injectable()
export class DocumentsService {
    private readonly logger = new Logger(DocumentsService.name);
    private readonly docsPath: string;

    private readonly DOC_TYPE_MAP: Record<string, string> = {
        '000': 'tracking', '001': 'planning', '002': 'planning',
        '100': 'planning', '125': 'planning', '150': 'development',
        '175': 'development', '200': 'development', '300': 'implementation',
        '325': 'implementation', '350': 'implementation', '375': 'implementation',
        '400': 'quality', '425': 'quality', '450': 'quality',
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        this.docsPath = configService.get<string>('DOCS_PATH') || join(process.cwd(), '../../../docs');
    }

    async getDocuments(): Promise<DocumentInfo[]> {
        if (!existsSync(this.docsPath)) return [];
        return this.scanDir(this.docsPath);
    }

    async getDocumentByPath(docPath: string): Promise<DocumentContent> {
        const fullPath = join(this.docsPath, docPath);
        if (!existsSync(fullPath)) throw new NotFoundException(`Document not found: ${docPath}`);

        try {
            const { frontmatter, content } = this.markdownService.parseMarkdown(fullPath);
            return { path: docPath, name: fullPath.split('/').pop()!, content, frontmatter };
        } catch {
            const raw = this.markdownService.readRawContent(fullPath);
            return { path: docPath, name: fullPath.split('/').pop()!, content: raw, frontmatter: {} };
        }
    }

    async searchDocuments(query: string): Promise<DocumentContent[]> {
        const docs = await this.getDocuments();
        const results: DocumentContent[] = [];
        const lowerQuery = query.toLowerCase();

        for (const doc of docs) {
            try {
                const fullPath = join(this.docsPath, doc.path);
                const raw = this.markdownService.readRawContent(fullPath);
                if (raw.toLowerCase().includes(lowerQuery) || doc.name.toLowerCase().includes(lowerQuery)) {
                    results.push({ path: doc.path, name: doc.name, content: raw, frontmatter: {} });
                }
            } catch { /* skip unreadable */ }
        }
        return results;
    }

    private scanDir(dir: string, basePath: string = ''): DocumentInfo[] {
        const results: DocumentInfo[] = [];
        const entries = readdirSync(dir);

        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const relPath = basePath ? `${basePath}/${entry}` : entry;

            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    results.push(...this.scanDir(fullPath, relPath));
                } else if (entry.endsWith('.md')) {
                    const prefix = entry.substring(0, 3);
                    results.push({
                        path: relPath,
                        name: entry,
                        type: this.DOC_TYPE_MAP[prefix] || 'other',
                        size: stat.size,
                    });
                }
            } catch { /* skip */ }
        }
        return results;
    }
}

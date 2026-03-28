"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(DocumentsService_1.name);
        this.DOC_TYPE_MAP = {
            '000': 'tracking', '001': 'planning', '002': 'planning',
            '100': 'planning', '125': 'planning', '150': 'development',
            '175': 'development', '200': 'development', '300': 'implementation',
            '325': 'implementation', '350': 'implementation', '375': 'implementation',
            '400': 'quality', '425': 'quality', '450': 'quality',
        };
        this.docsPath = configService.get('DOCS_PATH') || (0, path_1.join)(process.cwd(), '../../../docs');
    }
    async getDocuments() {
        if (!(0, fs_1.existsSync)(this.docsPath))
            return [];
        return this.scanDir(this.docsPath);
    }
    async getDocumentByPath(docPath) {
        const fullPath = (0, path_1.join)(this.docsPath, docPath);
        if (!(0, fs_1.existsSync)(fullPath))
            throw new common_1.NotFoundException(`Document not found: ${docPath}`);
        try {
            const { frontmatter, content } = this.markdownService.parseMarkdown(fullPath);
            return { path: docPath, name: fullPath.split('/').pop(), content, frontmatter };
        }
        catch {
            const raw = this.markdownService.readRawContent(fullPath);
            return { path: docPath, name: fullPath.split('/').pop(), content: raw, frontmatter: {} };
        }
    }
    async searchDocuments(query) {
        const docs = await this.getDocuments();
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const doc of docs) {
            try {
                const fullPath = (0, path_1.join)(this.docsPath, doc.path);
                const raw = this.markdownService.readRawContent(fullPath);
                if (raw.toLowerCase().includes(lowerQuery) || doc.name.toLowerCase().includes(lowerQuery)) {
                    results.push({ path: doc.path, name: doc.name, content: raw, frontmatter: {} });
                }
            }
            catch { }
        }
        return results;
    }
    scanDir(dir, basePath = '') {
        const results = [];
        const entries = (0, fs_1.readdirSync)(dir);
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(dir, entry);
            const relPath = basePath ? `${basePath}/${entry}` : entry;
            try {
                const stat = (0, fs_1.statSync)(fullPath);
                if (stat.isDirectory()) {
                    results.push(...this.scanDir(fullPath, relPath));
                }
                else if (entry.endsWith('.md')) {
                    const prefix = entry.substring(0, 3);
                    results.push({
                        path: relPath,
                        name: entry,
                        type: this.DOC_TYPE_MAP[prefix] || 'other',
                        size: stat.size,
                    });
                }
            }
            catch { }
        }
        return results;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map
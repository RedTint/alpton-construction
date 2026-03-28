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
var MarkdownService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const matter = require("gray-matter");
const fs_1 = require("fs");
let MarkdownService = MarkdownService_1 = class MarkdownService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MarkdownService_1.name);
    }
    parseMarkdown(filePath) {
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const raw = (0, fs_1.readFileSync)(filePath, 'utf-8');
        const parsed = matter(raw);
        return {
            frontmatter: parsed.data,
            content: parsed.content,
        };
    }
    writeMarkdown(filePath, frontmatter, content) {
        const output = matter.stringify(content, frontmatter);
        (0, fs_1.writeFileSync)(filePath, output, 'utf-8');
        this.logger.log(`Written markdown to ${filePath}`);
    }
    extractFrontmatter(filePath) {
        const { frontmatter } = this.parseMarkdown(filePath);
        return frontmatter;
    }
    readRawContent(filePath) {
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return (0, fs_1.readFileSync)(filePath, 'utf-8');
    }
};
exports.MarkdownService = MarkdownService;
exports.MarkdownService = MarkdownService = MarkdownService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MarkdownService);
//# sourceMappingURL=markdown.service.js.map
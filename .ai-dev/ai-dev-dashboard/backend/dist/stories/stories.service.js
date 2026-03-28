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
var StoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
const STATUS_DIRS = ['pending', 'in-progress', 'qa', 'done', 'blocked'];
let StoriesService = StoriesService_1 = class StoriesService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(StoriesService_1.name);
        this.docsPath =
            configService.get('DOCS_PATH') ||
                (0, path_1.join)(process.cwd(), '../../../docs');
        this.epicsPath = (0, path_1.join)(this.docsPath, 'epics');
    }
    async getStories() {
        const stories = [];
        if (!(0, fs_1.existsSync)(this.epicsPath))
            return stories;
        const epicDirs = (0, fs_1.readdirSync)(this.epicsPath).filter((d) => {
            try {
                return require('fs').statSync((0, path_1.join)(this.epicsPath, d)).isDirectory();
            }
            catch {
                return false;
            }
        });
        for (const epicDir of epicDirs) {
            const epicId = epicDir.split('-')[0];
            for (const status of STATUS_DIRS) {
                const statusDir = (0, path_1.join)(this.epicsPath, epicDir, status);
                if (!(0, fs_1.existsSync)(statusDir))
                    continue;
                const files = (0, fs_1.readdirSync)(statusDir).filter((f) => f.endsWith('.md'));
                for (const file of files) {
                    const story = this.readStory((0, path_1.join)(statusDir, file), epicId, status);
                    if (story)
                        stories.push(story);
                }
            }
        }
        return stories;
    }
    async getStoryById(id) {
        const stories = await this.getStories();
        const story = stories.find((s) => s.id === id);
        if (!story)
            throw new common_1.NotFoundException(`Story ${id} not found`);
        return story;
    }
    async getStoriesByEpic(epicId) {
        const stories = await this.getStories();
        return stories.filter((s) => s.epicId === epicId);
    }
    async createStory(dto) {
        const epicDir = this.findEpicDir(dto.epicId);
        const pendingDir = (0, path_1.join)(epicDir, 'pending');
        if (!(0, fs_1.existsSync)(pendingDir)) {
            (0, fs_1.mkdirSync)(pendingDir, { recursive: true });
        }
        const nextStoryNum = this.getNextStoryNum(epicDir);
        const fileName = `${dto.epicId}.${nextStoryNum}-${this.kebabCase(dto.title)}.md`;
        const filePath = (0, path_1.join)(pendingDir, fileName);
        const frontmatter = {
            id: `${dto.epicId}.${nextStoryNum}`,
            title: dto.title,
            description: dto.description || '',
            priority: dto.priority || 'medium',
            effort: dto.effort || 0,
            status: 'pending',
            created_at: new Date().toISOString(),
        };
        this.markdownService.writeMarkdown(filePath, frontmatter, `# ${dto.title}\n\n${dto.description || ''}\n`);
        this.logger.log(`Created story: ${fileName}`);
        return this.readStory(filePath, dto.epicId, 'pending');
    }
    async moveStory(id, dto) {
        const story = await this.getStoryById(id);
        if (!STATUS_DIRS.includes(dto.status)) {
            throw new Error(`Invalid status: ${dto.status}. Valid: ${STATUS_DIRS.join(', ')}`);
        }
        if (story.status === dto.status)
            return story;
        const fileName = story.path.split('/').pop();
        const epicDir = (0, path_1.join)(story.path, '..', '..');
        const newStatusDir = (0, path_1.join)(epicDir, dto.status);
        if (!(0, fs_1.existsSync)(newStatusDir))
            (0, fs_1.mkdirSync)(newStatusDir, { recursive: true });
        const newPath = (0, path_1.join)(newStatusDir, fileName);
        (0, fs_1.renameSync)(story.path, newPath);
        const { frontmatter, content } = this.markdownService.parseMarkdown(newPath);
        frontmatter.status = dto.status;
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(newPath, frontmatter, content);
        this.logger.log(`Moved story ${id} to ${dto.status}`);
        return this.readStory(newPath, story.epicId, dto.status);
    }
    readStory(filePath, epicId, status) {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || frontmatter.story_id || filePath.split('/').pop()?.replace('.md', '') || '',
                epicId: frontmatter.epic_id || epicId,
                title: frontmatter.title || frontmatter.story_name || '',
                description: frontmatter.description || '',
                status: frontmatter.story_status || status,
                priority: frontmatter.priority || 'medium',
                effort: frontmatter.effort || frontmatter.story_points || 0,
                path: filePath,
            };
        }
        catch {
            return null;
        }
    }
    findEpicDir(epicId) {
        if (!(0, fs_1.existsSync)(this.epicsPath)) {
            throw new common_1.NotFoundException(`Epics directory not found`);
        }
        const dirs = (0, fs_1.readdirSync)(this.epicsPath).filter((d) => d.startsWith(`${epicId}-`) && require('fs').statSync((0, path_1.join)(this.epicsPath, d)).isDirectory());
        if (dirs.length === 0)
            throw new common_1.NotFoundException(`Epic ${epicId} not found`);
        return (0, path_1.join)(this.epicsPath, dirs[0]);
    }
    getNextStoryNum(epicDir) {
        let max = 0;
        for (const status of STATUS_DIRS) {
            const statusDir = (0, path_1.join)(epicDir, status);
            if (!(0, fs_1.existsSync)(statusDir))
                continue;
            const files = (0, fs_1.readdirSync)(statusDir).filter((f) => f.endsWith('.md'));
            for (const f of files) {
                const match = f.match(/^\d+[.-](\d{3})-/);
                if (match)
                    max = Math.max(max, parseInt(match[1], 10));
            }
        }
        return String(max + 1).padStart(3, '0');
    }
    kebabCase(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = StoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], StoriesService);
//# sourceMappingURL=stories.service.js.map
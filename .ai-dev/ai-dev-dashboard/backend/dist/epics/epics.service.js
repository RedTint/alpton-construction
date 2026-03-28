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
var EpicsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpicsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
let EpicsService = EpicsService_1 = class EpicsService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(EpicsService_1.name);
        this.docsPath =
            configService.get('DOCS_PATH') ||
                (0, path_1.join)(process.cwd(), '../../../docs');
        this.epicsPath = (0, path_1.join)(this.docsPath, 'epics');
    }
    async getEpics() {
        if (!(0, fs_1.existsSync)(this.epicsPath)) {
            return [];
        }
        const dirs = (0, fs_1.readdirSync)(this.epicsPath).filter((d) => (0, fs_1.statSync)((0, path_1.join)(this.epicsPath, d)).isDirectory());
        return dirs.map((dir) => this.readEpic(dir)).filter(Boolean);
    }
    async getEpicById(id) {
        const dirs = (0, fs_1.existsSync)(this.epicsPath)
            ? (0, fs_1.readdirSync)(this.epicsPath).filter((d) => d.startsWith(`${id}-`) && (0, fs_1.statSync)((0, path_1.join)(this.epicsPath, d)).isDirectory())
            : [];
        if (dirs.length === 0) {
            throw new common_1.NotFoundException(`Epic ${id} not found`);
        }
        const epic = this.readEpic(dirs[0]);
        if (!epic)
            throw new common_1.NotFoundException(`Epic ${id} not found`);
        return epic;
    }
    async createEpic(dto) {
        if (!(0, fs_1.existsSync)(this.epicsPath)) {
            (0, fs_1.mkdirSync)(this.epicsPath, { recursive: true });
        }
        const nextId = this.getNextId();
        const dirName = `${nextId}-epic-${dto.name}`;
        const epicDir = (0, path_1.join)(this.epicsPath, dirName);
        (0, fs_1.mkdirSync)(epicDir, { recursive: true });
        for (const status of ['pending', 'in-progress', 'qa', 'done', 'blocked']) {
            (0, fs_1.mkdirSync)((0, path_1.join)(epicDir, status), { recursive: true });
        }
        const frontmatter = {
            id: nextId,
            title: dto.title,
            description: dto.description || '',
            priority: dto.priority || 'medium',
            status: 'active',
            created_at: new Date().toISOString(),
        };
        this.markdownService.writeMarkdown((0, path_1.join)(epicDir, 'epic.md'), frontmatter, `# ${dto.title}\n\n${dto.description || ''}\n`);
        this.logger.log(`Created epic: ${dirName}`);
        return this.readEpic(dirName);
    }
    async updateEpic(id, dto) {
        const epic = await this.getEpicById(id);
        const epicMdPath = (0, fs_1.existsSync)((0, path_1.join)(epic.path, 'epic.md'))
            ? (0, path_1.join)(epic.path, 'epic.md')
            : (0, path_1.join)(epic.path, 'README.md');
        const { frontmatter, content } = this.markdownService.parseMarkdown(epicMdPath);
        if (dto.title)
            frontmatter.title = dto.title;
        if (dto.description)
            frontmatter.description = dto.description;
        if (dto.priority)
            frontmatter.priority = dto.priority;
        if (dto.status)
            frontmatter.status = dto.status;
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(epicMdPath, frontmatter, content);
        this.logger.log(`Updated epic: ${id}`);
        return this.readEpic((0, path_1.join)(epic.path).split('/').pop());
    }
    async deleteEpic(id) {
        const epic = await this.getEpicById(id);
        (0, fs_1.rmSync)(epic.path, { recursive: true, force: true });
        this.logger.log(`Deleted epic: ${id}`);
    }
    readEpic(dirName) {
        const epicDir = (0, path_1.join)(this.epicsPath, dirName);
        const name = dirName.replace(/^\d+-(epic-)?/, '');
        const extractedId = dirName.split('-')[0];
        const storyCount = this.countStories(epicDir);
        const epicMdPath = (0, fs_1.existsSync)((0, path_1.join)(epicDir, 'epic.md'))
            ? (0, path_1.join)(epicDir, 'epic.md')
            : (0, fs_1.existsSync)((0, path_1.join)(epicDir, 'README.md'))
                ? (0, path_1.join)(epicDir, 'README.md')
                : null;
        if (!epicMdPath) {
            return {
                id: extractedId,
                name,
                title: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                description: '',
                priority: 'medium',
                status: 'active',
                storyCount,
                path: epicDir,
            };
        }
        try {
            const { frontmatter, content } = this.markdownService.parseMarkdown(epicMdPath);
            const id = frontmatter.id || frontmatter.epic_id || extractedId;
            let title = frontmatter.title || '';
            if (!title && content) {
                const headingMatch = content.match(/^# (?:Epic \d+ - )?(.+)$/m);
                if (headingMatch)
                    title = headingMatch[1].trim();
            }
            if (!title)
                title = name;
            let priority = frontmatter.priority || 'medium';
            if (priority === 'medium' && content) {
                const prioMatch = content.match(/\*\*Priority:\*\*\s*(\w+)/i);
                if (prioMatch)
                    priority = prioMatch[1].toLowerCase();
            }
            let status = frontmatter.status || 'active';
            if (status === 'active' && content) {
                const statusMatch = content.match(/\*\*Status:\*\*\s*([^\n*]+)/i);
                if (statusMatch) {
                    const raw = statusMatch[1].trim().toLowerCase();
                    if (raw.includes('completed') || raw.includes('100%'))
                        status = 'completed';
                    else if (raw.includes('in progress'))
                        status = 'in-progress';
                    else
                        status = raw.replace(/[✅🚧⏳⏸️]/g, '').trim() || 'active';
                }
            }
            let description = frontmatter.description || '';
            if (!description && content) {
                const descMatch = content.match(/## Description\n+([^#]+)/m);
                if (descMatch)
                    description = descMatch[1].trim().split('\n')[0];
            }
            return {
                id,
                name,
                title,
                description,
                priority,
                status,
                storyCount,
                path: epicDir,
            };
        }
        catch {
            this.logger.warn(`Failed to read epic: ${dirName}`);
            return null;
        }
    }
    countStories(epicDir) {
        let count = 0;
        for (const status of ['pending', 'in-progress', 'qa', 'done', 'blocked']) {
            const statusDir = (0, path_1.join)(epicDir, status);
            if ((0, fs_1.existsSync)(statusDir)) {
                count += (0, fs_1.readdirSync)(statusDir).filter((f) => f.endsWith('.md')).length;
            }
        }
        return count;
    }
    getNextId() {
        if (!(0, fs_1.existsSync)(this.epicsPath))
            return '001';
        const dirs = (0, fs_1.readdirSync)(this.epicsPath)
            .filter((d) => (0, fs_1.statSync)((0, path_1.join)(this.epicsPath, d)).isDirectory())
            .sort();
        if (dirs.length === 0)
            return '001';
        const lastId = parseInt(dirs[dirs.length - 1].split('-')[0], 10);
        return String(lastId + 1).padStart(3, '0');
    }
};
exports.EpicsService = EpicsService;
exports.EpicsService = EpicsService = EpicsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], EpicsService);
//# sourceMappingURL=epics.service.js.map
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
var BugsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BugsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
const BUG_STATUS_DIRS = ['pending', 'in-progress', 'qa', 'fixed', 'wontfix'];
let BugsService = BugsService_1 = class BugsService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(BugsService_1.name);
        const docsPath = configService.get('DOCS_PATH') || (0, path_1.join)(process.cwd(), '../../../docs');
        this.bugsPath = (0, path_1.join)(docsPath, 'bugs');
    }
    async getBugs() {
        const bugs = [];
        if (!(0, fs_1.existsSync)(this.bugsPath))
            return bugs;
        const bugDirs = (0, fs_1.readdirSync)(this.bugsPath).filter((d) => {
            try {
                return (0, fs_1.statSync)((0, path_1.join)(this.bugsPath, d)).isDirectory();
            }
            catch {
                return false;
            }
        });
        for (const bugDir of bugDirs) {
            for (const status of BUG_STATUS_DIRS) {
                const statusDir = (0, path_1.join)(this.bugsPath, bugDir, status);
                if (!(0, fs_1.existsSync)(statusDir))
                    continue;
                const files = (0, fs_1.readdirSync)(statusDir).filter((f) => f.endsWith('.md'));
                for (const file of files) {
                    const bug = this.readBug((0, path_1.join)(statusDir, file), status);
                    if (bug)
                        bugs.push(bug);
                }
            }
        }
        return bugs;
    }
    async getBugById(id) {
        const bugs = await this.getBugs();
        const bug = bugs.find((b) => b.id === id);
        if (!bug)
            throw new common_1.NotFoundException(`Bug ${id} not found`);
        return bug;
    }
    async createBug(dto) {
        if (!(0, fs_1.existsSync)(this.bugsPath))
            (0, fs_1.mkdirSync)(this.bugsPath, { recursive: true });
        const nextId = this.getNextId();
        const dirName = `${nextId}-bug-${dto.name}`;
        const bugDir = (0, path_1.join)(this.bugsPath, dirName);
        (0, fs_1.mkdirSync)(bugDir, { recursive: true });
        for (const status of BUG_STATUS_DIRS) {
            (0, fs_1.mkdirSync)((0, path_1.join)(bugDir, status), { recursive: true });
        }
        const fileName = `${nextId}.001-${dto.name}.md`;
        const filePath = (0, path_1.join)(bugDir, 'pending', fileName);
        const frontmatter = {
            id: `${nextId}.001`,
            title: dto.title,
            description: dto.description || '',
            severity: dto.severity,
            impact: dto.impact || '',
            rca: dto.rca || '',
            status: 'pending',
            created_at: new Date().toISOString(),
        };
        this.markdownService.writeMarkdown(filePath, frontmatter, `# ${dto.title}\n\n${dto.description || ''}\n`);
        this.logger.log(`Created bug: ${fileName}`);
        return this.readBug(filePath, 'pending');
    }
    async updateBugStatus(id, dto) {
        const bug = await this.getBugById(id);
        if (!BUG_STATUS_DIRS.includes(dto.status)) {
            throw new Error(`Invalid status: ${dto.status}`);
        }
        if (bug.status === dto.status)
            return bug;
        const fileName = bug.path.split('/').pop();
        const bugCategoryDir = (0, path_1.join)(bug.path, '..', '..');
        const newStatusDir = (0, path_1.join)(bugCategoryDir, dto.status);
        if (!(0, fs_1.existsSync)(newStatusDir))
            (0, fs_1.mkdirSync)(newStatusDir, { recursive: true });
        const newPath = (0, path_1.join)(newStatusDir, fileName);
        (0, fs_1.renameSync)(bug.path, newPath);
        const { frontmatter, content } = this.markdownService.parseMarkdown(newPath);
        frontmatter.status = dto.status;
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(newPath, frontmatter, content);
        this.logger.log(`Updated bug ${id} status to ${dto.status}`);
        return this.readBug(newPath, dto.status);
    }
    readBug(filePath, status) {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || '',
                name: frontmatter.title || '',
                title: frontmatter.title || '',
                description: frontmatter.description || '',
                severity: frontmatter.severity || 'medium',
                impact: frontmatter.impact || '',
                rca: frontmatter.rca || '',
                status,
                path: filePath,
            };
        }
        catch {
            return null;
        }
    }
    getNextId() {
        if (!(0, fs_1.existsSync)(this.bugsPath))
            return '001';
        const dirs = (0, fs_1.readdirSync)(this.bugsPath)
            .filter((d) => { try {
            return (0, fs_1.statSync)((0, path_1.join)(this.bugsPath, d)).isDirectory();
        }
        catch {
            return false;
        } })
            .sort();
        if (dirs.length === 0)
            return '001';
        const lastId = parseInt(dirs[dirs.length - 1].split('-')[0], 10);
        return String(lastId + 1).padStart(3, '0');
    }
};
exports.BugsService = BugsService;
exports.BugsService = BugsService = BugsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], BugsService);
//# sourceMappingURL=bugs.service.js.map
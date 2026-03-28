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
var SprintsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintsService = exports.DailyProgressDto = exports.AssignStoriesDto = exports.CreateSprintDto = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
class CreateSprintDto {
}
exports.CreateSprintDto = CreateSprintDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sprint 13 — Auth Feature' }),
    __metadata("design:type", String)
], CreateSprintDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-15' }),
    __metadata("design:type", String)
], CreateSprintDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-29' }),
    __metadata("design:type", String)
], CreateSprintDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40 }),
    __metadata("design:type", Number)
], CreateSprintDto.prototype, "capacityPoints", void 0);
class AssignStoriesDto {
}
exports.AssignStoriesDto = AssignStoriesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['001.003', '001.004'] }),
    __metadata("design:type", Array)
], AssignStoriesDto.prototype, "storyIds", void 0);
class DailyProgressDto {
}
exports.DailyProgressDto = DailyProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-16' }),
    __metadata("design:type", String)
], DailyProgressDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], DailyProgressDto.prototype, "pointsCompleted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Completed user login story' }),
    __metadata("design:type", String)
], DailyProgressDto.prototype, "notes", void 0);
let SprintsService = SprintsService_1 = class SprintsService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(SprintsService_1.name);
        const docsPath = configService.get('DOCS_PATH') || (0, path_1.join)(process.cwd(), '../../../docs');
        this.sprintsPath = (0, path_1.join)(docsPath, 'sprints');
    }
    async getSprints() {
        if (!(0, fs_1.existsSync)(this.sprintsPath))
            return [];
        return (0, fs_1.readdirSync)(this.sprintsPath)
            .filter((f) => f.endsWith('.md') && f.startsWith('sprint-'))
            .map((f) => this.readSprint((0, path_1.join)(this.sprintsPath, f)))
            .filter(Boolean);
    }
    async getSprintById(id) {
        const sprints = await this.getSprints();
        const sprint = sprints.find((s) => s.id === id);
        if (!sprint)
            throw new common_1.NotFoundException(`Sprint ${id} not found`);
        return sprint;
    }
    async getActiveSprint() {
        const sprints = await this.getSprints();
        return sprints.find((s) => s.status === 'active') || null;
    }
    async createSprint(dto) {
        if (!(0, fs_1.existsSync)(this.sprintsPath))
            (0, fs_1.mkdirSync)(this.sprintsPath, { recursive: true });
        const nextId = this.getNextId();
        const fileName = `sprint-${nextId}.md`;
        const filePath = (0, path_1.join)(this.sprintsPath, fileName);
        const frontmatter = {
            id: nextId,
            title: dto.title,
            start_date: dto.startDate,
            end_date: dto.endDate,
            capacity_points: dto.capacityPoints || 0,
            stories: [],
            daily_progress: [],
            status: 'active',
            created_at: new Date().toISOString(),
        };
        this.markdownService.writeMarkdown(filePath, frontmatter, `# ${dto.title}\n`);
        this.logger.log(`Created sprint: ${fileName}`);
        return this.readSprint(filePath);
    }
    async assignStories(id, dto) {
        const sprint = await this.getSprintById(id);
        const { frontmatter, content } = this.markdownService.parseMarkdown(sprint.path);
        frontmatter.stories = [...new Set([...(frontmatter.stories || []), ...dto.storyIds])];
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(sprint.path, frontmatter, content);
        return this.readSprint(sprint.path);
    }
    async recordDailyProgress(id, dto) {
        const sprint = await this.getSprintById(id);
        const { frontmatter, content } = this.markdownService.parseMarkdown(sprint.path);
        frontmatter.daily_progress = frontmatter.daily_progress || [];
        frontmatter.daily_progress.push({
            date: dto.date,
            points_completed: dto.pointsCompleted,
            notes: dto.notes || '',
        });
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(sprint.path, frontmatter, content);
        return this.readSprint(sprint.path);
    }
    calculateVelocity(sprint) {
        return sprint.dailyProgress.reduce((sum, d) => sum + d.pointsCompleted, 0);
    }
    calculateBurndown(sprint) {
        let remaining = sprint.capacityPoints;
        return sprint.dailyProgress.map((d) => {
            remaining -= d.pointsCompleted;
            return { date: d.date, remaining: Math.max(0, remaining) };
        });
    }
    readSprint(filePath) {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || '',
                title: frontmatter.title || '',
                startDate: frontmatter.start_date || '',
                endDate: frontmatter.end_date || '',
                capacityPoints: frontmatter.capacity_points || 0,
                stories: frontmatter.stories || [],
                dailyProgress: (frontmatter.daily_progress || []).map((d) => ({
                    date: d.date,
                    pointsCompleted: d.points_completed || 0,
                    notes: d.notes,
                })),
                status: frontmatter.status || 'active',
                path: filePath,
            };
        }
        catch {
            return null;
        }
    }
    getNextId() {
        if (!(0, fs_1.existsSync)(this.sprintsPath))
            return '001';
        const files = (0, fs_1.readdirSync)(this.sprintsPath).filter((f) => f.startsWith('sprint-')).sort();
        if (files.length === 0)
            return '001';
        const lastNum = parseInt(files[files.length - 1].replace('sprint-', '').replace('.md', ''), 10);
        return String(lastNum + 1).padStart(3, '0');
    }
};
exports.SprintsService = SprintsService;
exports.SprintsService = SprintsService = SprintsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], SprintsService);
//# sourceMappingURL=sprints.service.js.map
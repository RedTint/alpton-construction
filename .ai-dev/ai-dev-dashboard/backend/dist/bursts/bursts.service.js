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
var BurstsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurstsService = exports.UpdateSessionDto = exports.StartSessionDto = exports.CreateBurstDto = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
class CreateBurstDto {
}
exports.CreateBurstDto = CreateBurstDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Authentication deep-dive' }),
    __metadata("design:type", String)
], CreateBurstDto.prototype, "focusArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['001.003'] }),
    __metadata("design:type", Array)
], CreateBurstDto.prototype, "storyIds", void 0);
class StartSessionDto {
}
exports.StartSessionDto = StartSessionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'high', enum: ['high', 'medium', 'low'] }),
    __metadata("design:type", String)
], StartSessionDto.prototype, "energyLevel", void 0);
class UpdateSessionDto {
}
exports.UpdateSessionDto = UpdateSessionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'flow', enum: ['flow', 'focused', 'distracted', 'blocked'] }),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "flowState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Completed auth module' }),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    __metadata("design:type", Boolean)
], UpdateSessionDto.prototype, "ended", void 0);
let BurstsService = BurstsService_1 = class BurstsService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(BurstsService_1.name);
        const docsPath = configService.get('DOCS_PATH') || (0, path_1.join)(process.cwd(), '../../../docs');
        this.burstsPath = (0, path_1.join)(docsPath, 'bursts');
    }
    async getBursts() {
        if (!(0, fs_1.existsSync)(this.burstsPath))
            return [];
        return (0, fs_1.readdirSync)(this.burstsPath)
            .filter((f) => f.endsWith('.md') && f.startsWith('burst-'))
            .map((f) => this.readBurst((0, path_1.join)(this.burstsPath, f)))
            .filter(Boolean);
    }
    async getBurstById(id) {
        const bursts = await this.getBursts();
        const burst = bursts.find((b) => b.id === id);
        if (!burst)
            throw new common_1.NotFoundException(`Burst ${id} not found`);
        return burst;
    }
    async getActiveBurst() {
        const bursts = await this.getBursts();
        return bursts.find((b) => b.status === 'active') || null;
    }
    async createBurst(dto) {
        if (!(0, fs_1.existsSync)(this.burstsPath))
            (0, fs_1.mkdirSync)(this.burstsPath, { recursive: true });
        const nextId = this.getNextId();
        const fileName = `burst-${nextId}.md`;
        const filePath = (0, path_1.join)(this.burstsPath, fileName);
        const frontmatter = {
            id: nextId,
            focus_area: dto.focusArea,
            stories: dto.storyIds || [],
            sessions: [],
            status: 'active',
            created_at: new Date().toISOString(),
        };
        this.markdownService.writeMarkdown(filePath, frontmatter, `# Burst: ${dto.focusArea}\n`);
        return this.readBurst(filePath);
    }
    async startSession(burstId, dto) {
        const burst = await this.getBurstById(burstId);
        const { frontmatter, content } = this.markdownService.parseMarkdown(burst.path);
        const sessionId = String((frontmatter.sessions || []).length + 1).padStart(3, '0');
        frontmatter.sessions = frontmatter.sessions || [];
        frontmatter.sessions.push({
            id: sessionId,
            started_at: new Date().toISOString(),
            flow_state: 'focused',
            energy_level: dto.energyLevel || 'medium',
            notes: '',
        });
        this.markdownService.writeMarkdown(burst.path, frontmatter, content);
        return this.readBurst(burst.path);
    }
    async updateSession(burstId, sessionId, dto) {
        const burst = await this.getBurstById(burstId);
        const { frontmatter, content } = this.markdownService.parseMarkdown(burst.path);
        const session = (frontmatter.sessions || []).find((s) => s.id === sessionId);
        if (!session)
            throw new common_1.NotFoundException(`Session ${sessionId} not found`);
        if (dto.flowState)
            session.flow_state = dto.flowState;
        if (dto.notes)
            session.notes = dto.notes;
        if (dto.ended)
            session.ended_at = new Date().toISOString();
        frontmatter.updated_at = new Date().toISOString();
        this.markdownService.writeMarkdown(burst.path, frontmatter, content);
        return this.readBurst(burst.path);
    }
    readBurst(filePath) {
        try {
            const { frontmatter } = this.markdownService.parseMarkdown(filePath);
            return {
                id: frontmatter.id || '',
                focusArea: frontmatter.focus_area || '',
                stories: frontmatter.stories || [],
                sessions: (frontmatter.sessions || []).map((s) => ({
                    id: s.id, startedAt: s.started_at, endedAt: s.ended_at,
                    flowState: s.flow_state || 'focused', energyLevel: s.energy_level || 'medium', notes: s.notes || '',
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
        if (!(0, fs_1.existsSync)(this.burstsPath))
            return '001';
        const files = (0, fs_1.readdirSync)(this.burstsPath).filter((f) => f.startsWith('burst-')).sort();
        if (files.length === 0)
            return '001';
        const lastNum = parseInt(files[files.length - 1].replace('burst-', '').replace('.md', ''), 10);
        return String(lastNum + 1).padStart(3, '0');
    }
};
exports.BurstsService = BurstsService;
exports.BurstsService = BurstsService = BurstsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], BurstsService);
//# sourceMappingURL=bursts.service.js.map
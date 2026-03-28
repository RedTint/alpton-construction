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
var ProgressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
let ProgressService = ProgressService_1 = class ProgressService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(ProgressService_1.name);
        this.docsPath =
            configService.get('DOCS_PATH') || (0, path_1.join)(__dirname, '..', '..', '..', 'docs');
    }
    async getProgress() {
        const epicsPath = (0, path_1.join)(this.docsPath, 'epics');
        if (!(0, fs_1.existsSync)(epicsPath)) {
            return this.emptyStats();
        }
        let totalStories = 0;
        let completed = 0;
        let inProgress = 0;
        let pending = 0;
        let blocked = 0;
        let pointsCompleted = 0;
        let pointsRemaining = 0;
        const epicDirs = (0, fs_1.readdirSync)(epicsPath).filter((d) => {
            try {
                return (0, fs_1.statSync)((0, path_1.join)(epicsPath, d)).isDirectory();
            }
            catch {
                return false;
            }
        });
        for (const epicDir of epicDirs) {
            const epicPath = (0, path_1.join)(epicsPath, epicDir);
            for (const status of ['pending', 'in-progress', 'qa', 'done', 'blocked']) {
                const statusDir = (0, path_1.join)(epicPath, status);
                if (!(0, fs_1.existsSync)(statusDir))
                    continue;
                const files = (0, fs_1.readdirSync)(statusDir).filter((f) => f.endsWith('.md'));
                for (const file of files) {
                    totalStories++;
                    let effort = 0;
                    try {
                        const { frontmatter } = this.markdownService.parseMarkdown((0, path_1.join)(statusDir, file));
                        effort = frontmatter.effort || 0;
                    }
                    catch { }
                    switch (status) {
                        case 'done':
                            completed++;
                            pointsCompleted += effort;
                            break;
                        case 'in-progress':
                        case 'qa':
                            inProgress++;
                            pointsRemaining += effort;
                            break;
                        case 'blocked':
                            blocked++;
                            pointsRemaining += effort;
                            break;
                        default:
                            pending++;
                            pointsRemaining += effort;
                            break;
                    }
                }
            }
        }
        const completionPct = totalStories > 0 ? Math.round((completed / totalStories) * 100) : 0;
        return {
            totalStories, completed, inProgress, pending, blocked,
            completionPct, totalPointsCompleted: pointsCompleted, totalPointsRemaining: pointsRemaining,
        };
    }
    emptyStats() {
        return {
            totalStories: 0, completed: 0, inProgress: 0, pending: 0, blocked: 0,
            completionPct: 0, totalPointsCompleted: 0, totalPointsRemaining: 0,
        };
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = ProgressService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map
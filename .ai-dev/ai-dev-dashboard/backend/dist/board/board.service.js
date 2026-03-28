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
var BoardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardService = void 0;
const common_1 = require("@nestjs/common");
const epics_service_1 = require("../epics/epics.service");
const stories_service_1 = require("../stories/stories.service");
const markdown_service_1 = require("../common/services/markdown.service");
let BoardService = BoardService_1 = class BoardService {
    constructor(epicsService, storiesService, markdownService) {
        this.epicsService = epicsService;
        this.storiesService = storiesService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(BoardService_1.name);
    }
    async getBoardData() {
        const epics = await this.epicsService.getEpics();
        const rawStories = await this.storiesService.getStories();
        let totalPoints = 0;
        let completedPoints = 0;
        let totalUacs = 0;
        let completedUacs = 0;
        let completedStories = 0;
        let inProgressStories = 0;
        let pendingStories = 0;
        let blockedStories = 0;
        const pointsByVersion = {};
        const releasesMap = {};
        const enrichedStories = rawStories.map((s) => {
            const parsed = this.markdownService.parseMarkdown(s.path);
            const content = parsed.content || '';
            const fm = parsed.frontmatter || {};
            const tags = fm.tags || [];
            const versionTag = tags.find((t) => t.startsWith('v')) || 'v1.0.0';
            const category = tags.filter((t) => !t.startsWith('v')).join(', ') || 'General';
            const uacs = [];
            const uacMatch = content.match(/## User Acceptance Criteria\s+([\s\S]*?)(?:\n## |$)/i);
            if (uacMatch) {
                const lines = uacMatch[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('- ['));
                for (const line of lines) {
                    const match = line.match(/^- \[( |x|X)\] (.*?): (.*)/);
                    if (match) {
                        uacs.push({
                            status: match[1].trim() ? 'completed' : 'pending',
                            tag: match[2].trim(),
                            description: match[3].trim(),
                        });
                    }
                    else {
                        const genericMatch = line.match(/^- \[( |x|X)\] (.*)/);
                        if (genericMatch) {
                            uacs.push({
                                status: genericMatch[1].trim() ? 'completed' : 'pending',
                                tag: 'General',
                                description: genericMatch[2].trim(),
                            });
                        }
                    }
                }
            }
            const mappedStatus = s.status === 'done' ? 'completed' : (s.status === 'in-progress' ? 'in_progress' : s.status);
            if (mappedStatus === 'completed') {
                uacs.forEach((u) => { u.status = 'completed'; });
            }
            totalUacs += uacs.length;
            completedUacs += uacs.filter(u => u.status === 'completed').length;
            const effort = Number(fm.story_points || fm.effort || s.effort || 0);
            totalPoints += effort;
            if (mappedStatus === 'completed') {
                completedPoints += effort;
                completedStories++;
            }
            else if (mappedStatus === 'in_progress') {
                inProgressStories++;
            }
            else if (mappedStatus === 'blocked') {
                blockedStories++;
            }
            else {
                pendingStories++;
            }
            if (!pointsByVersion[versionTag]) {
                pointsByVersion[versionTag] = { completed: 0, total: 0, pct: 0 };
                let releaseName = `Release ${versionTag}`;
                let releasedAt = '';
                const keyAchievements = [];
                try {
                    const basePathMatch = __dirname.match(/(.*\.ai-dev-dashboard\/backend)(?:\/dist|\/src|$)/);
                    const basePath = basePathMatch ? basePathMatch[1] : process.cwd();
                    const docsPath = process.env.DOCS_PATH || require('path').join(basePath, '../../../docs');
                    const releasePath = require('path').join(docsPath, 'releases', `release-${versionTag}.md`);
                    const fs = require('fs');
                    if (fs.existsSync(releasePath)) {
                        const releaseCode = fs.readFileSync(releasePath, 'utf-8');
                        const dateMatch = releaseCode.match(/\*\*Release Date:\*\*\s*(.+)/i);
                        if (dateMatch) {
                            releasedAt = dateMatch[1].trim();
                        }
                        const highlightsMatch = releaseCode.match(/\*\*Highlights:\*\*\s*\n([\s\S]*?)(?:\n---|\n##)/i);
                        if (highlightsMatch) {
                            const items = highlightsMatch[1].split('\n').map(l => l.trim()).filter(l => l.match(/^- /));
                            items.slice(0, 5).forEach(item => {
                                keyAchievements.push(item.replace(/^- (?:[\u1000-\uFFFF] )?/, '').replace(/\*\*/g, ''));
                            });
                        }
                    }
                }
                catch (e) {
                    this.logger.warn(`Could not read release notes for ${versionTag}`, e);
                }
                releasesMap[versionTag] = {
                    version: versionTag,
                    name: releaseName,
                    released_at: releasedAt,
                    key_achievements: keyAchievements,
                    stories: [],
                };
            }
            pointsByVersion[versionTag].total += effort;
            if (mappedStatus === 'completed') {
                pointsByVersion[versionTag].completed += effort;
                releasesMap[versionTag].stories.push(s.id);
            }
            const descMatch = content.match(/## Description\s+([\s\S]*?)(?:\n## |$)/i);
            const extractedDesc = descMatch ? descMatch[1].trim() : (fm.description || s.description || '');
            return {
                id: s.id,
                title: s.title,
                description: extractedDesc,
                status: mappedStatus,
                priority: s.priority,
                effort,
                version: versionTag,
                category,
                dependencies: fm.dependencies || [],
                uacs,
                notes: fm.notes || '',
            };
        });
        for (const v in pointsByVersion) {
            if (pointsByVersion[v].total > 0) {
                pointsByVersion[v].pct = Math.round((pointsByVersion[v].completed / pointsByVersion[v].total) * 100);
            }
        }
        const completion_pct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
        const metrics = {
            total_epics: epics.length,
            total_stories: enrichedStories.length,
            completed: completedStories,
            in_progress: inProgressStories,
            pending: pendingStories,
            blocked: blockedStories,
            total_uacs: totalUacs,
            completed_uacs: completedUacs,
            completion_pct: completion_pct,
            total_points_completed: completedPoints,
            total_points_remaining: totalPoints - completedPoints,
            points_by_version: pointsByVersion,
            velocity_per_sprint: 0,
            estimated_remaining_sprints: 0,
            suggestions: [],
        };
        return {
            metadata: {
                generated_at: new Date().toISOString(),
                atomic_stories_version: 'v1.6.0',
                progress_version: 'v1.6.0',
                total_stories: metrics.total_stories,
                overall_completion_pct: metrics.completion_pct,
            },
            stories: enrichedStories,
            releases: Object.values(releasesMap),
            metrics,
        };
    }
    async getStories(version, status) {
        const board = await this.getBoardData();
        let stories = board.stories;
        if (version)
            stories = stories.filter((s) => s.version === version);
        if (status)
            stories = stories.filter((s) => s.status === status);
        return stories;
    }
    async getReleases() {
        const board = await this.getBoardData();
        return board.releases;
    }
    async getMetrics() {
        const board = await this.getBoardData();
        return board.metrics;
    }
};
exports.BoardService = BoardService;
exports.BoardService = BoardService = BoardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [epics_service_1.EpicsService,
        stories_service_1.StoriesService,
        markdown_service_1.MarkdownService])
], BoardService);
//# sourceMappingURL=board.service.js.map
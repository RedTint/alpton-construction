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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stories_service_1 = require("./stories.service");
const story_dto_1 = require("./dto/story.dto");
let StoriesController = class StoriesController {
    constructor(storiesService) {
        this.storiesService = storiesService;
    }
    getStoryById(id) {
        return this.storiesService.getStoryById(id);
    }
    updateStoryStatus(id, dto) {
        return this.storiesService.moveStory(id, dto);
    }
    getStoriesByEpic(epicId) {
        return this.storiesService.getStoriesByEpic(epicId);
    }
    createStory(dto) {
        return this.storiesService.createStory(dto);
    }
};
exports.StoriesController = StoriesController;
__decorate([
    (0, common_1.Get)('stories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get story by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Story ID (e.g. 001.003)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoryById", null);
__decorate([
    (0, common_1.Put)('stories/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update story status (move between directories)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Story ID' }),
    (0, swagger_1.ApiBody)({ type: story_dto_1.UpdateStoryStatusDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, story_dto_1.UpdateStoryStatusDto]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "updateStoryStatus", null);
__decorate([
    (0, common_1.Get)('epics/:epicId/stories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stories for a specific epic' }),
    (0, swagger_1.ApiParam)({ name: 'epicId', description: 'Epic ID (e.g. 001)' }),
    __param(0, (0, common_1.Param)('epicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoriesByEpic", null);
__decorate([
    (0, common_1.Post)('stories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new story' }),
    (0, swagger_1.ApiBody)({ type: story_dto_1.CreateStoryDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [story_dto_1.CreateStoryDto]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "createStory", null);
exports.StoriesController = StoriesController = __decorate([
    (0, swagger_1.ApiTags)('stories'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [stories_service_1.StoriesService])
], StoriesController);
//# sourceMappingURL=stories.controller.js.map
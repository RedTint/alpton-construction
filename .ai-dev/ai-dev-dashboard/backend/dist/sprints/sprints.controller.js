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
exports.SprintsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sprints_service_1 = require("./sprints.service");
let SprintsController = class SprintsController {
    constructor(sprintsService) {
        this.sprintsService = sprintsService;
    }
    getSprints() {
        return this.sprintsService.getSprints();
    }
    getActiveSprint() {
        return this.sprintsService.getActiveSprint();
    }
    getSprintById(id) {
        return this.sprintsService.getSprintById(id);
    }
    createSprint(dto) {
        return this.sprintsService.createSprint(dto);
    }
    assignStories(id, dto) {
        return this.sprintsService.assignStories(id, dto);
    }
    recordDailyProgress(id, dto) {
        return this.sprintsService.recordDailyProgress(id, dto);
    }
};
exports.SprintsController = SprintsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all sprints' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "getSprints", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active sprint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "getActiveSprint", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sprint by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sprint ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "getSprintById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new sprint' }),
    (0, swagger_1.ApiBody)({ type: sprints_service_1.CreateSprintDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sprints_service_1.CreateSprintDto]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "createSprint", null);
__decorate([
    (0, common_1.Put)(':id/stories'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign stories to sprint' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sprint ID' }),
    (0, swagger_1.ApiBody)({ type: sprints_service_1.AssignStoriesDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sprints_service_1.AssignStoriesDto]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "assignStories", null);
__decorate([
    (0, common_1.Post)(':id/daily-progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Record daily progress' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sprint ID' }),
    (0, swagger_1.ApiBody)({ type: sprints_service_1.DailyProgressDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sprints_service_1.DailyProgressDto]),
    __metadata("design:returntype", Promise)
], SprintsController.prototype, "recordDailyProgress", null);
exports.SprintsController = SprintsController = __decorate([
    (0, swagger_1.ApiTags)('sprints'),
    (0, common_1.Controller)('api/sprints'),
    __metadata("design:paramtypes", [sprints_service_1.SprintsService])
], SprintsController);
//# sourceMappingURL=sprints.controller.js.map
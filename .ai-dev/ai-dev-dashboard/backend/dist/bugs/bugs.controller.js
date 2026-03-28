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
exports.BugsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bugs_service_1 = require("./bugs.service");
const bug_dto_1 = require("./dto/bug.dto");
let BugsController = class BugsController {
    constructor(bugsService) {
        this.bugsService = bugsService;
    }
    getBugs() {
        return this.bugsService.getBugs();
    }
    getBugById(id) {
        return this.bugsService.getBugById(id);
    }
    createBug(dto) {
        return this.bugsService.createBug(dto);
    }
    updateBugStatus(id, dto) {
        return this.bugsService.updateBugStatus(id, dto);
    }
};
exports.BugsController = BugsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all bugs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BugsController.prototype, "getBugs", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bug by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Bug ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BugsController.prototype, "getBugById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new bug' }),
    (0, swagger_1.ApiBody)({ type: bug_dto_1.CreateBugDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bug_dto_1.CreateBugDto]),
    __metadata("design:returntype", Promise)
], BugsController.prototype, "createBug", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update bug status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Bug ID' }),
    (0, swagger_1.ApiBody)({ type: bug_dto_1.UpdateBugStatusDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bug_dto_1.UpdateBugStatusDto]),
    __metadata("design:returntype", Promise)
], BugsController.prototype, "updateBugStatus", null);
exports.BugsController = BugsController = __decorate([
    (0, swagger_1.ApiTags)('bugs'),
    (0, common_1.Controller)('api/bugs'),
    __metadata("design:paramtypes", [bugs_service_1.BugsService])
], BugsController);
//# sourceMappingURL=bugs.controller.js.map
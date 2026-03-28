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
exports.EpicsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const epics_service_1 = require("./epics.service");
const epic_dto_1 = require("./dto/epic.dto");
let EpicsController = class EpicsController {
    constructor(epicsService) {
        this.epicsService = epicsService;
    }
    getEpics() {
        return this.epicsService.getEpics();
    }
    getEpicById(id) {
        return this.epicsService.getEpicById(id);
    }
    createEpic(dto) {
        return this.epicsService.createEpic(dto);
    }
    updateEpic(id, dto) {
        return this.epicsService.updateEpic(id, dto);
    }
    deleteEpic(id) {
        return this.epicsService.deleteEpic(id);
    }
};
exports.EpicsController = EpicsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all epics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EpicsController.prototype, "getEpics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get epic by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Epic ID (e.g. 001)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EpicsController.prototype, "getEpicById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new epic' }),
    (0, swagger_1.ApiBody)({ type: epic_dto_1.CreateEpicDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [epic_dto_1.CreateEpicDto]),
    __metadata("design:returntype", Promise)
], EpicsController.prototype, "createEpic", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an epic' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Epic ID' }),
    (0, swagger_1.ApiBody)({ type: epic_dto_1.UpdateEpicDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, epic_dto_1.UpdateEpicDto]),
    __metadata("design:returntype", Promise)
], EpicsController.prototype, "updateEpic", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an epic' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Epic ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EpicsController.prototype, "deleteEpic", null);
exports.EpicsController = EpicsController = __decorate([
    (0, swagger_1.ApiTags)('epics'),
    (0, common_1.Controller)('api/epics'),
    __metadata("design:paramtypes", [epics_service_1.EpicsService])
], EpicsController);
//# sourceMappingURL=epics.controller.js.map
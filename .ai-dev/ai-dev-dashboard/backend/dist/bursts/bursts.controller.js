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
exports.BurstsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bursts_service_1 = require("./bursts.service");
let BurstsController = class BurstsController {
    constructor(burstsService) {
        this.burstsService = burstsService;
    }
    getBursts() { return this.burstsService.getBursts(); }
    getActiveBurst() { return this.burstsService.getActiveBurst(); }
    getBurstById(id) { return this.burstsService.getBurstById(id); }
    createBurst(dto) { return this.burstsService.createBurst(dto); }
    startSession(id, dto) {
        return this.burstsService.startSession(id, dto);
    }
    updateSession(id, sessionId, dto) {
        return this.burstsService.updateSession(id, sessionId, dto);
    }
};
exports.BurstsController = BurstsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all bursts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BurstsController.prototype, "getBursts", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active burst' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BurstsController.prototype, "getActiveBurst", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get burst by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BurstsController.prototype, "getBurstById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new burst' }),
    (0, swagger_1.ApiBody)({ type: bursts_service_1.CreateBurstDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bursts_service_1.CreateBurstDto]),
    __metadata("design:returntype", Promise)
], BurstsController.prototype, "createBurst", null);
__decorate([
    (0, common_1.Post)(':id/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new session' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiBody)({ type: bursts_service_1.StartSessionDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bursts_service_1.StartSessionDto]),
    __metadata("design:returntype", Promise)
], BurstsController.prototype, "startSession", null);
__decorate([
    (0, common_1.Put)(':id/sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a session' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId' }),
    (0, swagger_1.ApiBody)({ type: bursts_service_1.UpdateSessionDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bursts_service_1.UpdateSessionDto]),
    __metadata("design:returntype", Promise)
], BurstsController.prototype, "updateSession", null);
exports.BurstsController = BurstsController = __decorate([
    (0, swagger_1.ApiTags)('bursts'),
    (0, common_1.Controller)('api/bursts'),
    __metadata("design:paramtypes", [bursts_service_1.BurstsService])
], BurstsController);
//# sourceMappingURL=bursts.controller.js.map
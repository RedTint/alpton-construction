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
exports.BoardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const board_service_1 = require("./board.service");
let BoardController = class BoardController {
    constructor(boardService) {
        this.boardService = boardService;
    }
    getBoardData() {
        return this.boardService.getBoardData();
    }
    getStories(version, status) {
        return this.boardService.getStories(version, status);
    }
    getReleases() {
        return this.boardService.getReleases();
    }
    getMetrics() {
        return this.boardService.getMetrics();
    }
};
exports.BoardController = BoardController;
__decorate([
    (0, common_1.Get)('board'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full board data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getBoardData", null);
__decorate([
    (0, common_1.Get)('stories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stories with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'version', required: false, description: 'Filter by version (e.g. v1.4.0)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status (e.g. pending)' }),
    __param(0, (0, common_1.Query)('version')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getStories", null);
__decorate([
    (0, common_1.Get)('releases'),
    (0, swagger_1.ApiOperation)({ summary: 'Get releases grouped by version' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getReleases", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get metrics and suggestions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BoardController.prototype, "getMetrics", null);
exports.BoardController = BoardController = __decorate([
    (0, swagger_1.ApiTags)('board'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [board_service_1.BoardService])
], BoardController);
//# sourceMappingURL=board.controller.js.map
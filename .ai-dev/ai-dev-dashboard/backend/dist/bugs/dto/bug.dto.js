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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBugStatusDto = exports.CreateBugDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateBugDto {
}
exports.CreateBugDto = CreateBugDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bug name in kebab-case', example: 'token-expiry' }),
    __metadata("design:type", String)
], CreateBugDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bug title', example: 'Token expires prematurely' }),
    __metadata("design:type", String)
], CreateBugDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bug description' }),
    __metadata("design:type", String)
], CreateBugDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Severity', enum: ['critical', 'high', 'medium', 'low'], example: 'high' }),
    __metadata("design:type", String)
], CreateBugDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Impact description' }),
    __metadata("design:type", String)
], CreateBugDto.prototype, "impact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Root cause analysis' }),
    __metadata("design:type", String)
], CreateBugDto.prototype, "rca", void 0);
class UpdateBugStatusDto {
}
exports.UpdateBugStatusDto = UpdateBugStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status',
        enum: ['pending', 'in-progress', 'qa', 'fixed', 'wontfix'],
        example: 'in-progress',
    }),
    __metadata("design:type", String)
], UpdateBugStatusDto.prototype, "status", void 0);
//# sourceMappingURL=bug.dto.js.map
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
exports.UpdateEpicDto = exports.CreateEpicDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateEpicDto {
}
exports.CreateEpicDto = CreateEpicDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Epic name in kebab-case', example: 'user-auth' }),
    __metadata("design:type", String)
], CreateEpicDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Epic title', example: 'User Authentication' }),
    __metadata("design:type", String)
], CreateEpicDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Epic description' }),
    __metadata("design:type", String)
], CreateEpicDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority', enum: ['high', 'medium', 'low'] }),
    __metadata("design:type", String)
], CreateEpicDto.prototype, "priority", void 0);
class UpdateEpicDto {
}
exports.UpdateEpicDto = UpdateEpicDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Epic title' }),
    __metadata("design:type", String)
], UpdateEpicDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Epic description' }),
    __metadata("design:type", String)
], UpdateEpicDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority', enum: ['high', 'medium', 'low'] }),
    __metadata("design:type", String)
], UpdateEpicDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status', enum: ['active', 'completed', 'archived'] }),
    __metadata("design:type", String)
], UpdateEpicDto.prototype, "status", void 0);
//# sourceMappingURL=epic.dto.js.map
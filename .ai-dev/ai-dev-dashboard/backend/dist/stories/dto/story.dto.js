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
exports.CreateStoryDto = exports.UpdateStoryStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UpdateStoryStatusDto {
}
exports.UpdateStoryStatusDto = UpdateStoryStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status for the story',
        enum: ['pending', 'in-progress', 'qa', 'done', 'blocked'],
        example: 'in-progress',
    }),
    __metadata("design:type", String)
], UpdateStoryStatusDto.prototype, "status", void 0);
class CreateStoryDto {
}
exports.CreateStoryDto = CreateStoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Epic ID this story belongs to', example: '001' }),
    __metadata("design:type", String)
], CreateStoryDto.prototype, "epicId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Story title', example: 'User Login' }),
    __metadata("design:type", String)
], CreateStoryDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Story description' }),
    __metadata("design:type", String)
], CreateStoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority', enum: ['high', 'medium', 'low'] }),
    __metadata("design:type", String)
], CreateStoryDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Story points', example: 5 }),
    __metadata("design:type", Number)
], CreateStoryDto.prototype, "effort", void 0);
//# sourceMappingURL=story.dto.js.map
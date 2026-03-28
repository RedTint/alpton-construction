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
var CLIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIService = exports.ExecuteCommandDto = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const swagger_1 = require("@nestjs/swagger");
class ExecuteCommandDto {
}
exports.ExecuteCommandDto = ExecuteCommandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Command to execute', example: '/update-progress' }),
    __metadata("design:type", String)
], ExecuteCommandDto.prototype, "command", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Arguments', type: [String], example: ['--version', '1.6.0'] }),
    __metadata("design:type", Array)
], ExecuteCommandDto.prototype, "args", void 0);
let CLIService = CLIService_1 = class CLIService {
    constructor() {
        this.logger = new common_1.Logger(CLIService_1.name);
        this.commandHistory = [];
        this.MAX_TIMEOUT_MS = 5 * 60 * 1000;
    }
    async executeCommand(dto) {
        const result = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            command: dto.command,
            args: dto.args || [],
            status: 'running',
            output: '',
            error: '',
            startedAt: new Date().toISOString(),
        };
        this.commandHistory.push(result);
        try {
            await this.runCommand(result);
        }
        catch (err) {
            result.status = 'failed';
            result.error = err instanceof Error ? err.message : String(err);
        }
        result.completedAt = new Date().toISOString();
        return result;
    }
    getCommandHistory() {
        return [...this.commandHistory].reverse();
    }
    runCommand(result) {
        return new Promise((resolve) => {
            const proc = (0, child_process_1.spawn)(result.command, result.args, {
                cwd: process.cwd(),
                shell: true,
                timeout: this.MAX_TIMEOUT_MS,
            });
            const timeout = setTimeout(() => {
                proc.kill();
                result.status = 'timeout';
                resolve();
            }, this.MAX_TIMEOUT_MS);
            proc.stdout?.on('data', (data) => {
                result.output += data.toString();
            });
            proc.stderr?.on('data', (data) => {
                result.error += data.toString();
            });
            proc.on('close', (code) => {
                clearTimeout(timeout);
                result.status = code === 0 ? 'completed' : 'failed';
                resolve();
            });
            proc.on('error', (err) => {
                clearTimeout(timeout);
                result.status = 'failed';
                result.error = err.message;
                resolve();
            });
        });
    }
};
exports.CLIService = CLIService;
exports.CLIService = CLIService = CLIService_1 = __decorate([
    (0, common_1.Injectable)()
], CLIService);
//# sourceMappingURL=cli.service.js.map
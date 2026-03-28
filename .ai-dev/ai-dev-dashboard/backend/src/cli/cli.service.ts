import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteCommandDto {
    @ApiProperty({ description: 'Command to execute', example: '/update-progress' })
    command: string;

    @ApiPropertyOptional({ description: 'Arguments', type: [String], example: ['--version', '1.6.0'] })
    args?: string[];
}

export interface CommandResult {
    id: string;
    command: string;
    args: string[];
    status: 'running' | 'completed' | 'failed' | 'timeout';
    output: string;
    error: string;
    startedAt: string;
    completedAt?: string;
}

@Injectable()
export class CLIService {
    private readonly logger = new Logger(CLIService.name);
    private readonly commandHistory: CommandResult[] = [];
    private readonly MAX_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    async executeCommand(dto: ExecuteCommandDto): Promise<CommandResult> {
        const result: CommandResult = {
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
        } catch (err) {
            result.status = 'failed';
            result.error = err instanceof Error ? err.message : String(err);
        }

        result.completedAt = new Date().toISOString();
        return result;
    }

    getCommandHistory(): CommandResult[] {
        return [...this.commandHistory].reverse();
    }

    private runCommand(result: CommandResult): Promise<void> {
        return new Promise((resolve) => {
            const proc = spawn(result.command, result.args, {
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
}

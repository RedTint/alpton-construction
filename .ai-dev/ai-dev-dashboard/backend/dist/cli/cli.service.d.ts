export declare class ExecuteCommandDto {
    command: string;
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
export declare class CLIService {
    private readonly logger;
    private readonly commandHistory;
    private readonly MAX_TIMEOUT_MS;
    executeCommand(dto: ExecuteCommandDto): Promise<CommandResult>;
    getCommandHistory(): CommandResult[];
    private runCommand;
}

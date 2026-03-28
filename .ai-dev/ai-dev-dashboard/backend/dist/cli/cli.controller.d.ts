import { CLIService, CommandResult, ExecuteCommandDto } from './cli.service';
export declare class CLIController {
    private readonly cliService;
    constructor(cliService: CLIService);
    executeCommand(dto: ExecuteCommandDto): Promise<CommandResult>;
    getCommandHistory(): CommandResult[];
}

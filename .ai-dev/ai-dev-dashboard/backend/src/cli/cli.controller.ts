import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CLIService, CommandResult, ExecuteCommandDto } from './cli.service';

@ApiTags('cli')
@Controller('api/cli')
export class CLIController {
    constructor(private readonly cliService: CLIService) { }

    @Post('execute')
    @ApiOperation({ summary: 'Execute a CLI command' })
    @ApiBody({ type: ExecuteCommandDto })
    executeCommand(@Body() dto: ExecuteCommandDto): Promise<CommandResult> {
        return this.cliService.executeCommand(dto);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get command execution history' })
    getCommandHistory(): CommandResult[] {
        return this.cliService.getCommandHistory();
    }
}

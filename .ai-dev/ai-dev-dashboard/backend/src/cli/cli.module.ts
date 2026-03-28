import { Module } from '@nestjs/common';
import { CLIController } from './cli.controller';
import { CLIService } from './cli.service';

@Module({
    controllers: [CLIController],
    providers: [CLIService],
    exports: [CLIService],
})
export class CLIModule { }

import { Module } from '@nestjs/common';
import { BurstsController } from './bursts.controller';
import { BurstsService } from './bursts.service';

@Module({
    controllers: [BurstsController],
    providers: [BurstsService],
    exports: [BurstsService],
})
export class BurstsModule { }

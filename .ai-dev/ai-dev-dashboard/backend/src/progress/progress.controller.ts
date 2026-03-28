import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProgressService, ProgressStats } from './progress.service';

@ApiTags('progress')
@Controller('api/progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @Get()
    @ApiOperation({ summary: 'Get progress statistics' })
    getProgress(): Promise<ProgressStats> {
        return this.progressService.getProgress();
    }
}

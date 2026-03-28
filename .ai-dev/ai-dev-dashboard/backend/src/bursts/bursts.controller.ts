import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { BurstsService, Burst, CreateBurstDto, StartSessionDto, UpdateSessionDto } from './bursts.service';

@ApiTags('bursts')
@Controller('api/bursts')
export class BurstsController {
    constructor(private readonly burstsService: BurstsService) { }

    @Get()
    @ApiOperation({ summary: 'List all bursts' })
    getBursts(): Promise<Burst[]> { return this.burstsService.getBursts(); }

    @Get('active')
    @ApiOperation({ summary: 'Get active burst' })
    getActiveBurst(): Promise<Burst | null> { return this.burstsService.getActiveBurst(); }

    @Get(':id')
    @ApiOperation({ summary: 'Get burst by ID' })
    @ApiParam({ name: 'id' })
    getBurstById(@Param('id') id: string): Promise<Burst> { return this.burstsService.getBurstById(id); }

    @Post()
    @ApiOperation({ summary: 'Create a new burst' })
    @ApiBody({ type: CreateBurstDto })
    createBurst(@Body() dto: CreateBurstDto): Promise<Burst> { return this.burstsService.createBurst(dto); }

    @Post(':id/sessions')
    @ApiOperation({ summary: 'Start a new session' })
    @ApiParam({ name: 'id' })
    @ApiBody({ type: StartSessionDto })
    startSession(@Param('id') id: string, @Body() dto: StartSessionDto): Promise<Burst> {
        return this.burstsService.startSession(id, dto);
    }

    @Put(':id/sessions/:sessionId')
    @ApiOperation({ summary: 'Update a session' })
    @ApiParam({ name: 'id' })
    @ApiParam({ name: 'sessionId' })
    @ApiBody({ type: UpdateSessionDto })
    updateSession(
        @Param('id') id: string,
        @Param('sessionId') sessionId: string,
        @Body() dto: UpdateSessionDto,
    ): Promise<Burst> {
        return this.burstsService.updateSession(id, sessionId, dto);
    }
}

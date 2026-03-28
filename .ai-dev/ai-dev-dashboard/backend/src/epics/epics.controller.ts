import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { EpicsService, Epic } from './epics.service';
import { CreateEpicDto, UpdateEpicDto } from './dto/epic.dto';

@ApiTags('epics')
@Controller('api/epics')
export class EpicsController {
    constructor(private readonly epicsService: EpicsService) { }

    @Get()
    @ApiOperation({ summary: 'List all epics' })
    getEpics(): Promise<Epic[]> {
        return this.epicsService.getEpics();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get epic by ID' })
    @ApiParam({ name: 'id', description: 'Epic ID (e.g. 001)' })
    getEpicById(@Param('id') id: string): Promise<Epic> {
        return this.epicsService.getEpicById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new epic' })
    @ApiBody({ type: CreateEpicDto })
    createEpic(@Body() dto: CreateEpicDto): Promise<Epic> {
        return this.epicsService.createEpic(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an epic' })
    @ApiParam({ name: 'id', description: 'Epic ID' })
    @ApiBody({ type: UpdateEpicDto })
    updateEpic(
        @Param('id') id: string,
        @Body() dto: UpdateEpicDto,
    ): Promise<Epic> {
        return this.epicsService.updateEpic(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an epic' })
    @ApiParam({ name: 'id', description: 'Epic ID' })
    deleteEpic(@Param('id') id: string): Promise<void> {
        return this.epicsService.deleteEpic(id);
    }
}

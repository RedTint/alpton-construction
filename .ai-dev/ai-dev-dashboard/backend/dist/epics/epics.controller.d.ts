import { EpicsService, Epic } from './epics.service';
import { CreateEpicDto, UpdateEpicDto } from './dto/epic.dto';
export declare class EpicsController {
    private readonly epicsService;
    constructor(epicsService: EpicsService);
    getEpics(): Promise<Epic[]>;
    getEpicById(id: string): Promise<Epic>;
    createEpic(dto: CreateEpicDto): Promise<Epic>;
    updateEpic(id: string, dto: UpdateEpicDto): Promise<Epic>;
    deleteEpic(id: string): Promise<void>;
}

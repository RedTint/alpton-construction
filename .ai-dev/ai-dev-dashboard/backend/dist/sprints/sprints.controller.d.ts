import { SprintsService, Sprint, CreateSprintDto, AssignStoriesDto, DailyProgressDto } from './sprints.service';
export declare class SprintsController {
    private readonly sprintsService;
    constructor(sprintsService: SprintsService);
    getSprints(): Promise<Sprint[]>;
    getActiveSprint(): Promise<Sprint | null>;
    getSprintById(id: string): Promise<Sprint>;
    createSprint(dto: CreateSprintDto): Promise<Sprint>;
    assignStories(id: string, dto: AssignStoriesDto): Promise<Sprint>;
    recordDailyProgress(id: string, dto: DailyProgressDto): Promise<Sprint>;
}

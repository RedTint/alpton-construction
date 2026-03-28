import { StoriesService, Story } from './stories.service';
import { CreateStoryDto, UpdateStoryStatusDto } from './dto/story.dto';
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    getStoryById(id: string): Promise<Story>;
    updateStoryStatus(id: string, dto: UpdateStoryStatusDto): Promise<Story>;
    getStoriesByEpic(epicId: string): Promise<Story[]>;
    createStory(dto: CreateStoryDto): Promise<Story>;
}

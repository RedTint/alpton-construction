import { EpicsService } from '../epics/epics.service';
import { StoriesService } from '../stories/stories.service';
import { MarkdownService } from '../common/services/markdown.service';
import { BoardData, Metrics, Release, Story } from './board.types';
export declare class BoardService {
    private readonly epicsService;
    private readonly storiesService;
    private readonly markdownService;
    private readonly logger;
    constructor(epicsService: EpicsService, storiesService: StoriesService, markdownService: MarkdownService);
    getBoardData(): Promise<BoardData>;
    getStories(version?: string, status?: string): Promise<Story[]>;
    getReleases(): Promise<Release[]>;
    getMetrics(): Promise<Metrics>;
}

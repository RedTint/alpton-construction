import { BoardService } from './board.service';
import { BoardData, Metrics, Release, Story } from './board.types';
export declare class BoardController {
    private readonly boardService;
    constructor(boardService: BoardService);
    getBoardData(): Promise<BoardData>;
    getStories(version?: string, status?: string): Promise<Story[]>;
    getReleases(): Promise<Release[]>;
    getMetrics(): Promise<Metrics>;
}

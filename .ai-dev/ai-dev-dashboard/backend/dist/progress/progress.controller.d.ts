import { ProgressService, ProgressStats } from './progress.service';
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    getProgress(): Promise<ProgressStats>;
}

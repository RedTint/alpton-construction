import { BugsService, Bug } from './bugs.service';
import { CreateBugDto, UpdateBugStatusDto } from './dto/bug.dto';
export declare class BugsController {
    private readonly bugsService;
    constructor(bugsService: BugsService);
    getBugs(): Promise<Bug[]>;
    getBugById(id: string): Promise<Bug>;
    createBug(dto: CreateBugDto): Promise<Bug>;
    updateBugStatus(id: string, dto: UpdateBugStatusDto): Promise<Bug>;
}

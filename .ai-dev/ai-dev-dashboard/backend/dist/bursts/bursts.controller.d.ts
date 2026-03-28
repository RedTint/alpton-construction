import { BurstsService, Burst, CreateBurstDto, StartSessionDto, UpdateSessionDto } from './bursts.service';
export declare class BurstsController {
    private readonly burstsService;
    constructor(burstsService: BurstsService);
    getBursts(): Promise<Burst[]>;
    getActiveBurst(): Promise<Burst | null>;
    getBurstById(id: string): Promise<Burst>;
    createBurst(dto: CreateBurstDto): Promise<Burst>;
    startSession(id: string, dto: StartSessionDto): Promise<Burst>;
    updateSession(id: string, sessionId: string, dto: UpdateSessionDto): Promise<Burst>;
}

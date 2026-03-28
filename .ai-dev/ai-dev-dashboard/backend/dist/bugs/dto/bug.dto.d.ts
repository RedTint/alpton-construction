export declare class CreateBugDto {
    name: string;
    title: string;
    description?: string;
    severity: string;
    impact?: string;
    rca?: string;
}
export declare class UpdateBugStatusDto {
    status: string;
}

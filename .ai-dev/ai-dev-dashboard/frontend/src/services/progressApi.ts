import { apiGet } from './apiClient';

export interface ProgressStats {
    totalStories: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    completionPct: number;
    totalPointsCompleted: number;
    totalPointsRemaining: number;
}

export const progressApi = {
    get: () => apiGet<ProgressStats>('/api/progress'),
};

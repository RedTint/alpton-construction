import { apiGet, apiPost, apiPut } from './apiClient';

export interface Sprint {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    capacityPoints: number;
    stories: string[];
    dailyProgress: { date: string; pointsCompleted: number; notes?: string }[];
    status: string;
    path: string;
}

export const sprintsApi = {
    getAll: () => apiGet<Sprint[]>('/api/sprints'),
    getActive: () => apiGet<Sprint | null>('/api/sprints/active'),
    getById: (id: string) => apiGet<Sprint>(`/api/sprints/${id}`),
    create: (data: { title: string; startDate: string; endDate: string; capacityPoints?: number }) =>
        apiPost<Sprint>('/api/sprints', data),
    assignStories: (id: string, storyIds: string[]) =>
        apiPut<Sprint>(`/api/sprints/${id}/stories`, { storyIds }),
    recordProgress: (id: string, data: { date: string; pointsCompleted: number; notes?: string }) =>
        apiPost<Sprint>(`/api/sprints/${id}/daily-progress`, data),
};

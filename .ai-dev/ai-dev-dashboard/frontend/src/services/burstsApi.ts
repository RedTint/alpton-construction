import { apiGet, apiPost, apiPut } from './apiClient';

export interface Burst {
    id: string;
    focusArea: string;
    stories: string[];
    sessions: { id: string; startedAt: string; endedAt?: string; flowState: string; energyLevel: string; notes: string }[];
    status: string;
    path: string;
}

export const burstsApi = {
    getAll: () => apiGet<Burst[]>('/api/bursts'),
    getActive: () => apiGet<Burst | null>('/api/bursts/active'),
    getById: (id: string) => apiGet<Burst>(`/api/bursts/${id}`),
    create: (data: { focusArea: string; storyIds?: string[] }) => apiPost<Burst>('/api/bursts', data),
    startSession: (id: string, data: { energyLevel?: string }) => apiPost<Burst>(`/api/bursts/${id}/sessions`, data),
    updateSession: (id: string, sessionId: string, data: { flowState?: string; notes?: string; ended?: boolean }) =>
        apiPut<Burst>(`/api/bursts/${id}/sessions/${sessionId}`, data),
};

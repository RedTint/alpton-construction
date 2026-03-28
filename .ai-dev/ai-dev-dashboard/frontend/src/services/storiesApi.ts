import { apiGet, apiPost, apiPut } from './apiClient';

export interface Story {
    id: string;
    epicId: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    effort: number;
    path: string;
}

export const storiesApi = {
    getById: (id: string) => apiGet<Story>(`/api/stories/${id}`),
    getByEpic: (epicId: string) => apiGet<Story[]>(`/api/epics/${epicId}/stories`),
    create: (data: { epicId: string; title: string; description?: string; priority?: string; effort?: number }) =>
        apiPost<Story>('/api/stories', data),
    updateStatus: (id: string, status: string) => apiPut<Story>(`/api/stories/${id}/status`, { status }),
};

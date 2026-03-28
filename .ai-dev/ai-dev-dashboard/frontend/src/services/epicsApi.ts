import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

export interface Epic {
    id: string;
    name: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    storyCount: number;
    path: string;
}

export const epicsApi = {
    getAll: () => apiGet<Epic[]>('/api/epics'),
    getById: (id: string) => apiGet<Epic>(`/api/epics/${id}`),
    create: (data: { name: string; title: string; description?: string; priority?: string }) =>
        apiPost<Epic>('/api/epics', data),
    update: (id: string, data: Partial<Epic>) => apiPut<Epic>(`/api/epics/${id}`, data),
    delete: (id: string) => apiDelete<void>(`/api/epics/${id}`),
};

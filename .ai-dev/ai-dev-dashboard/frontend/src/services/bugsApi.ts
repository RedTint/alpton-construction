import { apiGet, apiPost, apiPut } from './apiClient';

export interface Bug {
    id: string;
    name: string;
    title: string;
    description: string;
    severity: string;
    impact: string;
    rca: string;
    status: string;
    path: string;
}

export const bugsApi = {
    getAll: () => apiGet<Bug[]>('/api/bugs'),
    getById: (id: string) => apiGet<Bug>(`/api/bugs/${id}`),
    create: (data: { name: string; title: string; severity: string; description?: string }) =>
        apiPost<Bug>('/api/bugs', data),
    updateStatus: (id: string, status: string) => apiPut<Bug>(`/api/bugs/${id}/status`, { status }),
};

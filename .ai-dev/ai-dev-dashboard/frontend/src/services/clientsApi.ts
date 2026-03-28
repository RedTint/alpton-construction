import { apiGet } from './apiClient';

export interface ClientInfo {
    id: string;
    slug: string;
    name: string;
    status: string;
    activeDeliverables: number;
    openIssues: number;
    updatedAt: string;
    folderPath: string;
}

export interface ClientDoc {
    name: string;
    path: string;
    label: string;
}

export interface ClientDetail extends ClientInfo {
    docs: ClientDoc[];
}

export interface ClientDocContent {
    path: string;
    name: string;
    content: string;
    frontmatter: Record<string, unknown>;
}

export const clientsApi = {
    getAll: () => apiGet<ClientInfo[]>('/api/clients'),
    getById: (id: string) => apiGet<ClientDetail>(`/api/clients/${id}`),
    getDoc: (id: string, docPath: string) =>
        apiGet<ClientDocContent>(`/api/clients/${id}/docs/${docPath}`),
};

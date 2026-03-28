import { apiGet } from './apiClient';

export interface DocumentInfo {
    path: string;
    name: string;
    type: string;
    size: number;
}

export interface DocumentContent {
    path: string;
    name: string;
    content: string;
    frontmatter: Record<string, unknown>;
}

export const docsApi = {
    getAll: () => apiGet<DocumentInfo[]>('/api/docs'),
    getByPath: (docPath: string) => apiGet<DocumentContent>(`/api/docs/${docPath}`),
    search: (query: string) => apiGet<DocumentContent[]>(`/api/docs/search?q=${encodeURIComponent(query)}`),
};

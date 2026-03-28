import type { BoardData, Metrics, Release, Story } from '@/types/board.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class BoardApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = 'BoardApiError';
    }
}

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`);
    if (res.status === 503) {
        throw new BoardApiError(503, 'Board data not generated. Run /sync-board first.');
    }
    if (!res.ok) {
        throw new BoardApiError(res.status, `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export async function fetchBoardData(): Promise<BoardData> {
    return apiFetch<BoardData>('/api/board');
}

export async function fetchStories(params?: {
    version?: string;
    status?: string;
}): Promise<Story[]> {
    const search = new URLSearchParams();
    if (params?.version) search.set('version', params.version);
    if (params?.status) search.set('status', params.status);
    const query = search.toString();
    return apiFetch<Story[]>(`/api/stories${query ? `?${query}` : ''}`);
}

export async function fetchReleases(): Promise<Release[]> {
    return apiFetch<Release[]>('/api/releases');
}

export async function fetchMetrics(): Promise<Metrics> {
    return apiFetch<Metrics>('/api/metrics');
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
    return apiFetch<{ status: string; timestamp: string }>('/health');
}

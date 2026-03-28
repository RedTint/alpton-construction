const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        throw new ApiError(res.status, text);
    }

    return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
    return apiFetch<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
    return apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiDelete<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'DELETE' });
}

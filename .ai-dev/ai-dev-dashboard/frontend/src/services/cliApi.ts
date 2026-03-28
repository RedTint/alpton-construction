import { apiGet, apiPost } from './apiClient';

export interface CommandResult {
    id: string;
    command: string;
    args: string[];
    status: 'running' | 'completed' | 'failed' | 'timeout';
    output: string;
    error: string;
    startedAt: string;
    completedAt?: string;
}

export const cliApi = {
    execute: (command: string, args?: string[]) =>
        apiPost<CommandResult>('/api/cli/execute', { command, args: args || [] }),
    getHistory: () => apiGet<CommandResult[]>('/api/cli/history'),
};

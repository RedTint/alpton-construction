import { useMemo } from 'react';
import type { Story, StoryStatus } from '@/types/board.types';

interface FilterOptions {
    version: string;
    status: string;
    search: string;
}

export function useFilteredStories(stories: Story[], filters: FilterOptions): Story[] {
    return useMemo(() => {
        return stories.filter((story) => {
            if (filters.version && filters.version !== 'all' && story.version !== filters.version) {
                return false;
            }
            if (filters.status && filters.status !== 'all' && story.status !== (filters.status as StoryStatus)) {
                return false;
            }
            if (filters.search) {
                const term = filters.search.toLowerCase();
                const matchesTitle = story.title.toLowerCase().includes(term);
                const matchesId = story.id.toLowerCase().includes(term);
                const matchesCategory = story.category.toLowerCase().includes(term);
                if (!matchesTitle && !matchesId && !matchesCategory) {
                    return false;
                }
            }
            return true;
        });
    }, [stories, filters.version, filters.status, filters.search]);
}

export function useStoriesByStatus(stories: Story[]) {
    return useMemo(() => {
        const columns: Record<string, Story[]> = {
            pending: [],
            in_progress: [],
            completed: [],
            blocked: [],
        };

        for (const story of stories) {
            const key = story.status === 'cancelled' ? 'completed' : story.status;
            columns[key]?.push(story);
        }

        return columns;
    }, [stories]);
}

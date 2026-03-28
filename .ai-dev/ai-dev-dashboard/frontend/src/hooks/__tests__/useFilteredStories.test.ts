import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredStories, useStoriesByStatus } from '@/hooks/useFilteredStories';
import { mockBoardData } from '@/test/mocks';

describe('useFilteredStories', () => {
    const stories = mockBoardData.stories;

    it('returns all stories when no filters applied', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'all', status: 'all', search: '' }),
        );
        expect(result.current.length).toBe(5);
    });

    it('filters by version', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'v1.0.0', status: 'all', search: '' }),
        );
        expect(result.current.length).toBe(2);
        expect(result.current.every((s) => s.version === 'v1.0.0')).toBe(true);
    });

    it('filters by status', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'all', status: 'completed', search: '' }),
        );
        expect(result.current.length).toBe(2);
        expect(result.current.every((s) => s.status === 'completed')).toBe(true);
    });

    it('filters by search term (title)', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'all', status: 'all', search: 'frontend' }),
        );
        expect(result.current.length).toBe(1);
        expect(result.current[0]!.id).toBe('101');
    });

    it('filters by search term (ID)', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'all', status: 'all', search: '310' }),
        );
        expect(result.current.length).toBe(1);
        expect(result.current[0]!.id).toBe('310');
    });

    it('filters by search term (category)', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'all', status: 'all', search: 'quality' }),
        );
        expect(result.current.length).toBe(1);
        expect(result.current[0]!.id).toBe('311');
    });

    it('combines version and search filters', () => {
        const { result } = renderHook(() =>
            useFilteredStories(stories, { version: 'v1.0.0', status: 'all', search: 'setup' }),
        );
        expect(result.current.length).toBe(1);
        expect(result.current[0]!.id).toBe('001');
    });
});

describe('useStoriesByStatus', () => {
    it('groups stories by status into columns', () => {
        const { result } = renderHook(() => useStoriesByStatus(mockBoardData.stories));
        expect(result.current['completed']!.length).toBe(2);
        expect(result.current['in_progress']!.length).toBe(1);
        expect(result.current['pending']!.length).toBe(1);
        expect(result.current['blocked']!.length).toBe(1);
    });

    it('returns empty arrays for empty input', () => {
        const { result } = renderHook(() => useStoriesByStatus([]));
        expect(result.current['completed']!.length).toBe(0);
        expect(result.current['in_progress']!.length).toBe(0);
        expect(result.current['pending']!.length).toBe(0);
        expect(result.current['blocked']!.length).toBe(0);
    });
});

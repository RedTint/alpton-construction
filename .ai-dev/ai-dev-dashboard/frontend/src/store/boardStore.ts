import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story } from '@/services/storiesApi';
import type { Epic } from '@/services/epicsApi';

interface BoardState {
    epics: Epic[];
    stories: Story[];
    selectedEpicId: string | null;
    searchQuery: string;
    statusFilter: string;
    priorityFilter: string;
    setEpics: (epics: Epic[]) => void;
    setStories: (stories: Story[]) => void;
    setSelectedEpicId: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    setPriorityFilter: (priority: string) => void;
    moveStory: (storyId: string, newStatus: string) => void;
    addStory: (story: Story) => void;
}

export const useBoardStore = create<BoardState>()(
    persist(
        (set) => ({
            epics: [],
            stories: [],
            selectedEpicId: null,
            searchQuery: '',
            statusFilter: 'all',
            priorityFilter: 'all',
            setEpics: (epics) => set({ epics }),
            setStories: (stories) => set({ stories }),
            setSelectedEpicId: (id) => set({ selectedEpicId: id }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setStatusFilter: (status) => set({ statusFilter: status }),
            setPriorityFilter: (priority) => set({ priorityFilter: priority }),
            moveStory: (storyId, newStatus) =>
                set((state) => ({
                    stories: state.stories.map((s) =>
                        s.id === storyId ? { ...s, status: newStatus } : s,
                    ),
                })),
            addStory: (story) => set((state) => ({ stories: [...state.stories, story] })),
        }),
        {
            name: 'board-store',
            partialize: (state) => ({
                selectedEpicId: state.selectedEpicId,
                searchQuery: state.searchQuery,
                statusFilter: state.statusFilter,
                priorityFilter: state.priorityFilter,
            }),
        },
    ),
);

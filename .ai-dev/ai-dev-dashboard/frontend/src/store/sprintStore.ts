import { create } from 'zustand';
import type { Sprint } from '@/services/sprintsApi';

interface SprintState {
    sprints: Sprint[];
    activeSprint: Sprint | null;
    setSprints: (sprints: Sprint[]) => void;
    setActiveSprint: (sprint: Sprint | null) => void;
}

export const useSprintStore = create<SprintState>()((set) => ({
    sprints: [],
    activeSprint: null,
    setSprints: (sprints) => set({ sprints }),
    setActiveSprint: (sprint) => set({ activeSprint: sprint }),
}));

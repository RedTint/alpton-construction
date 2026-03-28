export interface UAC {
  tag: string;
  description: string;
  status: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  effort: number;
  version: string;
  category: string;
  dependencies: string[];
  uacs: UAC[];
  notes: string;
}

export interface Release {
  version: string;
  name: string;
  released_at: string;
  stories: string[];
  key_achievements: string[];
}

export interface PointsByVersion {
  completed: number;
  total: number;
  pct: number;
}

export interface Suggestion {
  type: string;
  priority: string;
  title: string;
  detail: string;
}

export interface Metrics {
  total_epics: number;
  total_stories: number;
  completed: number;
  in_progress: number;
  pending: number;
  blocked: number;
  total_uacs: number;
  completed_uacs: number;
  completion_pct: number;
  total_points_completed: number;
  total_points_remaining: number;
  points_by_version: Record<string, PointsByVersion>;
  velocity_per_sprint: number;
  estimated_remaining_sprints: number;
  suggestions: Suggestion[];
}

export interface BoardMetadata {
  generated_at: string;
  atomic_stories_version: string;
  progress_version: string;
  total_stories: number;
  overall_completion_pct: number;
}

export interface BoardData {
  metadata: BoardMetadata;
  stories: Story[];
  releases: Release[];
  metrics: Metrics;
}

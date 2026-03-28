import { useState, useCallback, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import type { Story } from '@/types/board.types';
import { useBoardData } from '@/hooks/useBoardData';
import { useFilteredStories } from '@/hooks/useFilteredStories';
import { FilterBar } from '@/components/filters/FilterBar';
import { KanbanColumn } from '@/components/board/KanbanColumn';
import { StoryDetailPanel } from '@/components/board/StoryDetailPanel';
import { MetricsPanel } from '@/components/metrics/MetricsPanel';
import { SuggestionsPanel } from '@/components/suggestions/SuggestionsPanel';
import { ReleasesPanel } from '@/components/releases/ReleasesPanel';
import { BoardKPIs } from '@/components/board/BoardKPIs';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'board' | 'metrics' | 'releases';

const COLUMNS = [
    { id: 'pending', title: 'Pending', emoji: '⏳' },
    { id: 'in_progress', title: 'In Progress', emoji: '🚧' },
    { id: 'completed', title: 'Done', emoji: '✅' },
    { id: 'blocked', title: 'Blocked', emoji: '⏸️' },
];

export function DashboardPage() {
    const { data, loading, error, is503, refetch } = useBoardData();
    const [activeTab, setActiveTab] = useState<TabId>('board');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Filter state
    const [version, setVersion] = useState('all');
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');

    const versions = useMemo(() => {
        if (!data) return [];
        const vSet = new Set(data.stories.map((s) => s.version));
        return Array.from(vSet).sort();
    }, [data]);

    const filteredStories = useFilteredStories(data?.stories ?? [], { version, status, search });

    // Local stories state for optimistic DnD
    const [localStories, setLocalStories] = useState<Story[]>([]);
    const storiesForBoard = localStories.length > 0 ? localStories : filteredStories;

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setLocalStories(filteredStories);
    }, [filteredStories]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const storyId = active.id as string;
        const newStatus = over.id as string;

        // Only process if dropped on a column
        if (COLUMNS.some((c) => c.id === newStatus)) {
            setLocalStories((prev) =>
                prev.map((s) => (s.id === storyId ? { ...s, status: newStatus as Story['status'] } : s)),
            );
        }
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setLocalStories([]);
        setRefreshing(false);
    };

    const tabs: { id: TabId; label: string; count?: number }[] = [
        { id: 'board', label: 'Board', count: filteredStories.length },
        { id: 'metrics', label: 'Metrics' },
        { id: 'releases', label: 'Releases', count: data?.releases.length },
    ];

    if (loading && !data) {
        return (
            <div className="p-6 max-w-[1400px] mx-auto">
                <LoadingSkeleton />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="flex items-center justify-center p-6 min-h-[60vh]">
                <ErrorState message={error} is503={is503} onRetry={refetch} />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-[1400px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold gradient-text">Project Board</h1>
                            <p className="text-xs text-muted-foreground">
                                {data.metadata.atomic_stories_version} · {filteredStories.length} stories
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={cn(
                                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                                'bg-secondary hover:bg-secondary/80 text-foreground transition-colors',
                                'disabled:opacity-50',
                            )}
                            data-testid="refresh-button"
                        >
                            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                            Refresh
                        </button>
                    </div>

                    {/* Tabs */}
                    <nav className="flex items-center gap-1 mt-4 -mb-px" role="tablist">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                    activeTab === tab.id
                                        ? 'text-primary bg-primary/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                                )}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                data-testid={`tab-${tab.id}`}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className="ml-1.5 text-[10px] bg-secondary rounded-full px-1.5 py-0.5">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-[1400px] mx-auto px-6 py-6">
                <BoardKPIs metrics={data.metrics} />
                
                {activeTab === 'board' && (
                    <div className="space-y-6 animate-fade-in">
                        <FilterBar
                            versions={versions}
                            version={version}
                            status={status}
                            search={search}
                            onVersionChange={setVersion}
                            onStatusChange={setStatus}
                            onSearchChange={setSearch}
                        />

                        {/* Kanban columns */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-4 overflow-x-auto pb-4" data-testid="kanban-board">
                                {COLUMNS.map((col) => (
                                    <KanbanColumn
                                        key={col.id}
                                        id={col.id}
                                        title={col.title}
                                        emoji={col.emoji}
                                        stories={storiesForBoard.filter((s) => s.status === col.id)}
                                        onStoryClick={setSelectedStory}
                                    />
                                ))}
                            </div>
                            <DragOverlay>
                                {activeId && (
                                    <div className="rounded-xl border border-primary/30 bg-card p-3 shadow-2xl w-[280px] opacity-90">
                                        <span className="text-sm font-medium">{activeId}</span>
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>

                        {data.metrics.suggestions.length > 0 && (
                            <SuggestionsPanel suggestions={data.metrics.suggestions} />
                        )}
                    </div>
                )}

                {activeTab === 'metrics' && (
                    <div className="animate-fade-in">
                        <MetricsPanel metrics={data.metrics} />
                    </div>
                )}

                {activeTab === 'releases' && (
                    <div className="animate-fade-in">
                        <ReleasesPanel releases={data.releases} stories={data.stories} />
                    </div>
                )}
            </main>

            {selectedStory && (
                <StoryDetailPanel story={selectedStory} onClose={() => setSelectedStory(null)} />
            )}
        </div>
    );
}

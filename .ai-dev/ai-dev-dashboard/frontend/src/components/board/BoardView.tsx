import type { Story, StoryStatus } from '@/types/board.types';
import { useStoriesByStatus } from '@/hooks/useFilteredStories';
import { StoryCard } from './StoryCard';
import { ColumnHeader } from './ColumnHeader';
import { cn } from '@/lib/utils';

interface BoardViewProps {
    stories: Story[];
    onStoryClick: (story: Story) => void;
    className?: string;
}

const columnOrder: StoryStatus[] = ['pending', 'in_progress', 'completed', 'blocked'];

export function BoardView({ stories, onStoryClick, className }: BoardViewProps) {
    const columns = useStoriesByStatus(stories);

    return (
        <div
            className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}
            data-testid="board-view"
        >
            {columnOrder.map((status) => {
                const items = columns[status] ?? [];
                return (
                    <div key={status} className="min-w-0">
                        <ColumnHeader status={status} count={items.length} />
                        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                            {items.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                                    <p className="text-xs text-muted-foreground">No stories</p>
                                </div>
                            ) : (
                                items.map((story) => (
                                    <StoryCard key={story.id} story={story} onClick={onStoryClick} />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

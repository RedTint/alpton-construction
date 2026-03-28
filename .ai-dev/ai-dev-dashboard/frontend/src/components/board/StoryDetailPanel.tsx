import { Badge } from '@/components/ui/Badge';
import { MarkdownText } from '@/components/ui/MarkdownText';
import type { Story, UAC, UACTag, Priority } from '@/types/board.types';
import { cn } from '@/lib/utils';
import {
    X,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Hash,
    Zap,
    GitBranch,
    StickyNote,
} from 'lucide-react';

interface StoryDetailPanelProps {
    story: Story;
    onClose: () => void;
}

const priorityVariant: Record<Priority, 'destructive' | 'warning' | 'secondary'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary',
};

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
    completed: 'success',
    in_progress: 'info',
    pending: 'warning',
    blocked: 'destructive',
    cancelled: 'secondary',
};

const statusLabel: Record<string, string> = {
    completed: 'Completed',
    in_progress: 'In Progress',
    pending: 'Pending',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
};

const uacStatusIcon: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    pending: <Clock className="w-4 h-4 text-amber-400 shrink-0" />,
    blocked: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
};

const tagColorMap: Record<UACTag, 'default' | 'success' | 'warning' | 'info' | 'purple'> = {
    FE: 'default',
    BE: 'success',
    DB: 'warning',
    DevOps: 'info',
    CLI: 'purple',
};

function groupUacsByTag(uacs: UAC[]): Record<string, UAC[]> {
    const groups: Record<string, UAC[]> = {};
    for (const uac of uacs) {
        if (!groups[uac.tag]) groups[uac.tag] = [];
        groups[uac.tag]!.push(uac);
    }
    return groups;
}

export function StoryDetailPanel({ story, onClose }: StoryDetailPanelProps) {
    const groupedUacs = groupUacsByTag(story.uacs);
    const completedUacs = story.uacs.filter((u) => u.status === 'completed').length;
    const totalUacs = story.uacs.length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
                onClick={onClose}
                data-testid="panel-backdrop"
            />

            {/* Panel */}
            <aside
                className={cn(
                    'fixed right-0 top-0 h-full w-full sm:w-[480px] z-50',
                    'bg-background border-l border-border',
                    'animate-slide-in-right overflow-y-auto',
                )}
                data-testid="story-detail-panel"
            >
                {/* Header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        <span className="text-lg font-bold text-primary tabular-nums">{story.id}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                        data-testid="close-panel"
                        aria-label="Close panel"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-foreground leading-tight">{story.title}</h2>

                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusVariant[story.status]}>
                            {statusLabel[story.status] ?? story.status}
                        </Badge>
                        <Badge variant={priorityVariant[story.priority]}>
                            {story.priority.charAt(0).toUpperCase() + story.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="info">{story.version}</Badge>
                        <Badge variant="purple">
                            <Zap className="w-3 h-3 mr-0.5" />
                            {story.effort} pts
                        </Badge>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Description
                        </h3>
                        <div className="text-sm text-foreground/80 leading-relaxed">
                            <MarkdownText text={story.description} />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Category
                        </h3>
                        <p className="text-sm text-foreground/80">{story.category}</p>
                    </div>

                    {/* Dependencies */}
                    {story.dependencies.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <GitBranch className="w-3.5 h-3.5" />
                                Dependencies
                            </h3>
                            <div className="flex gap-2 flex-wrap">
                                {story.dependencies.map((dep) => (
                                    <Badge key={dep} variant="outline">
                                        #{dep}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* UACs */}
                    {totalUacs > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    User Acceptance Criteria
                                </h3>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {completedUacs}/{totalUacs}
                                </span>
                            </div>

                            {/* UAC progress bar */}
                            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{
                                        width: `${totalUacs > 0 ? (completedUacs / totalUacs) * 100 : 0}%`,
                                    }}
                                />
                            </div>

                            {/* Grouped UACs */}
                            <div className="space-y-4">
                                {Object.entries(groupedUacs).map(([tag, uacs]) => (
                                    <div key={tag} className="space-y-2">
                                        <Badge variant={tagColorMap[tag as UACTag] ?? 'secondary'} className="text-[10px]">
                                            {tag}
                                        </Badge>
                                        <div className="space-y-1.5 pl-1">
                                            {uacs.map((uac, i) => (
                                                <div key={i} className="flex items-start gap-2 py-1">
                                                    <div className="mt-0.5 shrink-0">{uacStatusIcon[uac.status]}</div>
                                                    <span className="text-xs text-foreground/80 leading-relaxed flex-1">
                                                        <MarkdownText text={uac.description} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {story.notes && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <StickyNote className="w-3.5 h-3.5" />
                                Notes
                            </h3>
                            <p className="text-xs text-foreground/70 leading-relaxed bg-muted rounded-lg p-3">
                                {story.notes}
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

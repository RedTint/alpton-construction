import { Badge } from '@/components/ui/Badge';
import type { Suggestion, SuggestionType } from '@/types/board.types';
import { cn } from '@/lib/utils';
import { Lightbulb, AlertCircle, Star, Clock } from 'lucide-react';

interface SuggestionsPanelProps {
    suggestions: Suggestion[];
    className?: string;
}

const typeConfig: Record<
    SuggestionType,
    { icon: React.ReactNode; variant: 'success' | 'destructive' | 'warning' | 'info'; label: string }
> = {
    available: {
        icon: <Lightbulb className="w-4 h-4" />,
        variant: 'success',
        label: 'Available',
    },
    bottleneck: {
        icon: <AlertCircle className="w-4 h-4" />,
        variant: 'destructive',
        label: 'Bottleneck',
    },
    'high-value': {
        icon: <Star className="w-4 h-4" />,
        variant: 'warning',
        label: 'High Value',
    },
    stale: {
        icon: <Clock className="w-4 h-4" />,
        variant: 'info',
        label: 'Stale',
    },
};

export function SuggestionsPanel({ suggestions, className }: SuggestionsPanelProps) {
    if (suggestions.length === 0) return null;

    return (
        <div className={cn('space-y-4', className)} data-testid="suggestions-panel">
            <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-foreground">Suggestions</h2>
                <Badge variant="secondary" className="ml-1">
                    {suggestions.length}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((suggestion, i) => {
                    const config = typeConfig[suggestion.type];
                    return (
                        <div
                            key={i}
                            className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                            data-testid={`suggestion-${i}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={cn('mt-0.5 shrink-0', `text-${config.variant === 'success' ? 'emerald' : config.variant === 'destructive' ? 'red' : config.variant === 'warning' ? 'amber' : 'sky'}-400`)}>
                                    {config.icon}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Badge variant={config.variant} className="text-[10px]">
                                            {config.label}
                                        </Badge>
                                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'warning' : 'secondary'} className="text-[10px]">
                                            {suggestion.priority}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground mb-1">
                                        {suggestion.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {suggestion.detail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

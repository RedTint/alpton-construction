import { AlertTriangle, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    message: string;
    is503?: boolean;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({ message, is503, onRetry, className }: ErrorStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center min-h-[400px] text-center px-6 animate-fade-in',
                className,
            )}
            data-testid="error-state"
        >
            <div className="rounded-2xl border border-border bg-card p-8 max-w-lg w-full space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                        {is503 ? 'Board Data Not Available' : 'Something went wrong'}
                    </h2>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>

                {is503 && (
                    <div className="rounded-lg bg-muted p-4 text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <Terminal className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                Quick Fix
                            </span>
                        </div>
                        <code className="text-sm text-emerald-400 font-mono block">/sync-board</code>
                        <p className="text-xs text-muted-foreground mt-2">
                            Run this command in Claude Code to generate the board data from your project
                            documentation.
                        </p>
                    </div>
                )}

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        data-testid="retry-button"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'info';
    className?: string;
}

const sizeMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};

const variantMap = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
};

export function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = true,
    size = 'md',
    variant = 'default',
    className,
}: ProgressBarProps) {
    const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

    return (
        <div className={cn('w-full', className)} data-testid="progress-bar">
            {(label || showPercentage) && (
                <div className="flex items-center justify-between mb-1.5">
                    {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
                    {showPercentage && (
                        <span className="text-xs font-semibold text-foreground tabular-nums">{pct}%</span>
                    )}
                </div>
            )}
            <div
                className={cn('w-full rounded-full bg-secondary overflow-hidden', sizeMap[size])}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        variantMap[variant],
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

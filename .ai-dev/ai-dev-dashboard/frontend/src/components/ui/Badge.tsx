import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-primary/10 text-primary ring-primary/20',
                secondary: 'bg-secondary text-secondary-foreground ring-border',
                success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
                warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
                destructive: 'bg-destructive/10 text-red-400 ring-destructive/20',
                info: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',
                purple: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
                outline: 'bg-transparent text-muted-foreground ring-border',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)} data-testid="badge" {...props} />;
}

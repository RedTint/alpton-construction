import { cn } from '@/lib/utils';

interface MarkdownTextProps {
    text: string;
    className?: string;
}

export function MarkdownText({ text, className }: MarkdownTextProps) {
    if (!text) return null;

    // Split by code blocks first
    const codeParts = text.split(/(`[^`]+`)/g);

    return (
        <span className={cn('whitespace-pre-wrap', className)}>
            {codeParts.map((part, i) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-muted/80 text-primary border border-border/50 font-mono text-[0.85em] whitespace-nowrap"
                        >
                            {part.slice(1, -1)}
                        </code>
                    );
                }

                // Handle bold **text** within non-code parts
                const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                return (
                    <span key={i}>
                        {boldParts.map((bp, j) => {
                            if (bp.startsWith('**') && bp.endsWith('**')) {
                                return (
                                    <strong key={j} className="font-bold text-foreground">
                                        {bp.slice(2, -2)}
                                    </strong>
                                );
                            }
                            // Handle italic *text*
                            const italicParts = bp.split(/(\*[^*]+\*)/g);
                            return (
                                <span key={j}>
                                    {italicParts.map((ip, k) => {
                                        if (ip.startsWith('*') && ip.endsWith('*')) {
                                            return <em key={k} className="italic">{ip.slice(1, -1)}</em>;
                                        }
                                        return <span key={k}>{ip}</span>;
                                    })}
                                </span>
                            );
                        })}
                    </span>
                );
            })}
        </span>
    );
}

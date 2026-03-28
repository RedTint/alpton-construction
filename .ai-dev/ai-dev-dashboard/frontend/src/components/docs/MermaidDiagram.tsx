import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        darkMode: true,
        background: '#0d1117',
        primaryColor: '#3b82f6',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#1e293b',
        noteBkgColor: '#1e293b',
        noteTextColor: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
    },
});

let mermaidCounter = 0;

export function MermaidDiagram({ chart }: { chart: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const idRef = useRef(`mermaid-${++mermaidCounter}`);

    useEffect(() => {
        if (!containerRef.current || !chart.trim()) return;
        setError(null);

        const render = async () => {
            try {
                const { svg } = await mermaid.render(idRef.current, chart.trim());
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
            }
        };

        render();
    }, [chart]);

    if (error) {
        return (
            <div className="mermaid-container border-destructive/50">
                <p className="text-xs text-destructive mb-2">⚠️ Mermaid render error</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{chart}</pre>
            </div>
        );
    }

    return <div ref={containerRef} className="mermaid-container" />;
}

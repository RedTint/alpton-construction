import { useState, useCallback, useRef, useEffect } from 'react';
import { cliApi, type CommandResult } from '@/services/cliApi';
import { cn } from '@/lib/utils';
import { Terminal, Play, Clock, ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const QUICK_ACTIONS = [
    { label: '🆕 New Feature', command: 'new-feature', icon: '🆕' },
    { label: '🏗️ Build', command: 'build', icon: '🏗️' },
    { label: '📊 Update Progress', command: 'update-progress', icon: '📊' },
    { label: '🔄 Sync Board', command: 'sync-board', icon: '🔄' },
    { label: '🐛 Log Bug', command: 'log-bug', icon: '🐛' },
    { label: '✅ Fix Bug', command: 'fix-bug', icon: '✅' },
];

export function CLIPage() {
    const [commandInput, setCommandInput] = useState('');
    const [executing, setExecuting] = useState(false);
    const [history, setHistory] = useState<CommandResult[]>([]);
    const [currentOutput, setCurrentOutput] = useState<CommandResult | null>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        cliApi.getHistory().then(setHistory).catch(() => { });
    }, []);

    const executeCommand = useCallback(async (command: string, args?: string[]) => {
        setExecuting(true);
        setCurrentOutput(null);
        try {
            const result = await cliApi.execute(command, args);
            setCurrentOutput(result);
            setHistory((prev) => [result, ...prev]);
        } catch (err) {
            setCurrentOutput({
                id: Date.now().toString(),
                command,
                args: args || [],
                status: 'failed',
                output: '',
                error: err instanceof Error ? err.message : 'Unknown error',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            });
        } finally {
            setExecuting(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commandInput.trim() || executing) return;
        const parts = commandInput.trim().split(/\s+/);
        const cmd = (parts[0] ?? '').replace(/^\//, '');
        const args = parts.slice(1);
        executeCommand(cmd, args);
        setCommandInput('');
    };

    useEffect(() => {
        outputRef.current?.scrollTo(0, outputRef.current.scrollHeight);
    }, [currentOutput]);

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold gradient-text">CLI Terminal</h1>
                        <p className="text-xs text-muted-foreground">Execute skills from the dashboard</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Quick actions sidebar */}
                <aside className="w-52 border-r border-border bg-card/30 p-3 space-y-1 flex-shrink-0" data-testid="cli-quick-actions">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Quick Actions</h3>
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.command}
                            onClick={() => executeCommand(action.command)}
                            disabled={executing}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-secondary transition-colors disabled:opacity-50"
                            data-testid={`quick-action-${action.command}`}
                        >
                            <span>{action.icon}</span>
                            <span>{action.label.replace(/^[^\s]+\s/, '')}</span>
                        </button>
                    ))}
                </aside>

                {/* Terminal area */}
                <div className="flex-1 flex flex-col bg-[#0d1117]">
                    {/* Output display */}
                    <div ref={outputRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3" data-testid="cli-output">
                        {/* Current output */}
                        {currentOutput && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <ChevronRight className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">/{currentOutput.command}</span>
                                    {currentOutput.args.length > 0 && (
                                        <span className="text-muted-foreground">{currentOutput.args.join(' ')}</span>
                                    )}
                                </div>
                                {currentOutput.output && (
                                    <pre className="text-gray-300 whitespace-pre-wrap pl-5">{currentOutput.output}</pre>
                                )}
                                {currentOutput.error && (
                                    <pre className="text-red-400 whitespace-pre-wrap pl-5">{currentOutput.error}</pre>
                                )}
                                <div className="flex items-center gap-2 pl-5">
                                    {currentOutput.status === 'completed' ? (
                                        <><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Completed</span></>
                                    ) : currentOutput.status === 'failed' ? (
                                        <><XCircle className="w-3 h-3 text-red-400" /><span className="text-red-400">Failed</span></>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {!currentOutput && !executing && (
                            <div className="text-muted-foreground/50 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                <span>Ready. Type a command or select a quick action.</span>
                            </div>
                        )}

                        {executing && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Executing...</span>
                            </div>
                        )}
                    </div>

                    {/* Command input */}
                    <form onSubmit={handleSubmit} className="border-t border-border/50 p-3 flex items-center gap-2 bg-[#161b22]" data-testid="cli-input-form">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder="/command args..."
                            disabled={executing}
                            className="flex-1 bg-transparent text-sm font-mono text-gray-200 placeholder:text-gray-600 outline-none"
                            data-testid="cli-command-input"
                        />
                        <button
                            type="submit"
                            disabled={executing || !commandInput.trim()}
                            className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 disabled:opacity-40 transition-colors"
                            data-testid="cli-execute-btn"
                        >
                            <Play className="w-3 h-3" />
                        </button>
                    </form>
                </div>

                {/* History sidebar */}
                <aside className="w-64 border-l border-border bg-card/30 flex flex-col flex-shrink-0" data-testid="cli-history">
                    <div className="px-3 py-2 border-b border-border flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">History</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {history.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground p-2">No commands yet</p>
                        ) : (
                            history.map((cmd) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => setCurrentOutput(cmd)}
                                    className={cn(
                                        'w-full text-left px-2 py-1.5 rounded text-[11px] hover:bg-secondary transition-colors',
                                        currentOutput?.id === cmd.id && 'bg-secondary',
                                    )}
                                    data-testid={`history-item-${cmd.id}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {cmd.status === 'completed' ? (
                                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                                        )}
                                        <span className="font-mono text-foreground truncate">/{cmd.command}</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground">{cmd.startedAt}</span>
                                </button>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

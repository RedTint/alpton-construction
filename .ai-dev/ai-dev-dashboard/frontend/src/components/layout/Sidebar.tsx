import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Layers,
    Bug,
    Timer,
    Zap,
    FileText,
    Terminal,
    ChevronLeft,
    ChevronRight,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Board' },
    { to: '/epics', icon: Layers, label: 'Epics' },
    { to: '/sprints', icon: Timer, label: 'Sprints' },
    { to: '/bursts', icon: Zap, label: 'Bursts' },
    { to: '/bugs', icon: Bug, label: 'Bugs' },
    { to: '/docs', icon: FileText, label: 'Docs' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/cli', icon: Terminal, label: 'Terminal' },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                'flex flex-col border-r border-border bg-card/50 transition-all duration-200',
                collapsed ? 'w-16' : 'w-56',
            )}
            data-testid="sidebar"
        >
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-sm gradient-text whitespace-nowrap">
                        AI Dev Dashboard
                    </span>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-3 px-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                                collapsed && 'justify-center px-2',
                            )
                        }
                        data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                        <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
                data-testid="sidebar-toggle"
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </aside>
    );
}

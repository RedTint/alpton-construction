import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { EpicsPage } from '@/pages/EpicsPage';
import { SprintPage } from '@/pages/SprintPage';
import { BurstPage } from '@/pages/BurstPage';
import { BugsPage } from '@/pages/BugsPage';
import { DocsPage } from '@/pages/DocsPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { CLIPage } from '@/pages/CLIPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, retry: 2 },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppShell />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/epics" element={<EpicsPage />} />
                        <Route path="/sprints" element={<SprintPage />} />
                        <Route path="/bursts" element={<BurstPage />} />
                        <Route path="/bugs" element={<BugsPage />} />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/docs/*" element={<DocsPage />} />
                        <Route path="/clients" element={<ClientsPage />} />
                        <Route path="/cli" element={<CLIPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;

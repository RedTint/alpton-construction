import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/pages/LandingPage';
import { LeadsDashboard } from './components/features/admin/LeadsDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/leads" element={<LeadsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

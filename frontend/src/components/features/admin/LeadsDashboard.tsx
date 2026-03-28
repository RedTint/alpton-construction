import React, { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { Link } from 'react-router-dom';

export const LeadsDashboard: React.FC = () => {
  const { leads } = useAdminStore();
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(leads.length / itemsPerPage);
  
  // Sort leads by highest qualification score, then paginated
  const sortedLeads = [...leads].sort((a, b) => b.qualificationScore - a.qualificationScore);
  const visibleLeads = sortedLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Computed KPIs
  const highQualityLeads = leads.filter(l => l.qualificationScore >= 80).length;
  // Mock total booked value based on 'Negotiation' or high quality
  const mockTotalBookedValue = leads.reduce((acc, lead) => {
    if (lead.valuation && lead.valuation !== 'Pending Evaluation') {
      const val = parseFloat(lead.valuation.replace('$', '').replace('M', '')) || 0;
      return acc + val;
    }
    return acc;
  }, 0).toFixed(1);

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex selection:bg-secondary/30">
      {/* SideNavBar */}
      <nav className="h-screen w-64 fixed left-0 top-0 bg-primary flex flex-col p-6 z-50 shadow-2xl">
        <div className="text-on-primary mb-10">
          <div className="text-lg font-bold tracking-tighter">ALFTON ADMIN</div>
          <div className="font-headline uppercase tracking-widest text-[10px] font-bold text-secondary">Project Controller</div>
        </div>
        <div className="flex-grow space-y-2">
          <Link to="/admin/leads" className="flex items-center gap-4 px-4 py-3 bg-primary-container text-secondary border-r-4 border-secondary transition-all duration-200">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Leads Pipeline</span>
          </Link>
          <a className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-primary-container transition-all duration-200 cursor-pointer">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Inventory</span>
          </a>
          <a className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-primary-container transition-all duration-200 cursor-pointer">
            <span className="material-symbols-outlined">architecture</span>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Site Mgmt</span>
          </a>
          <a className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-primary-container transition-all duration-200 cursor-pointer">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Financials</span>
          </a>
          <Link to="/" className="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-primary-container transition-all duration-200 cursor-pointer mt-auto">
            <span className="material-symbols-outlined">exit_to_app</span>
            <span className="font-headline uppercase tracking-widest text-[10px] font-bold">Return Home</span>
          </Link>
        </div>
        <div className="pt-8 border-t border-white/10 mt-4">
          <div className="flex items-center gap-3 px-2">
            <img className="w-10 h-10 object-cover grayscale brightness-75 border border-secondary/20" alt="Admin user profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsqj55bdKbx8tjhKlKqE4FceMnBOzVByZXeK9SDp4yK-oy-xnIfUAo_qE7BmbPWA3O_8m4XBeCNzlPUdoT3isv5-KtwgJQBjNuKhDPo_nCVemFI8H9fIsHSqL_vmALMjqBUfgTdI4nfNrur5pB0cDZVio8GtlDcfMUlTmTSEdq2GQ2-_m02OULvIrYIJ04xH_NAI0VwVbcLvN9kQpXS7Itbqc2cS8fF41VrRgJJr-nK4qdD1Tg5mRkEB38VAQ0dZIyrzKluZ2pIRg"/>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Admin User</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Global Access</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-12 py-8 transition-all border-b border-surface-container-high">
          <h1 className="text-2xl font-black tracking-tighter text-primary">Lead Control Center</h1>
          <div className="flex gap-8 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">System Connectivity</span>
              <span className="text-sm font-semibold text-primary">Real-time (Zustand)</span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/30"></div>
          </div>
        </header>

        <div className="px-12 py-12 space-y-16 flex-1 max-w-[1600px]">
          {/* Key Metrics Dashboard */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-0 bg-primary-container overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,4,16,0.12)]">
            <div className="p-8 border-r border-white/5 bg-primary relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-secondary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Total Asset Valuation</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">${mockTotalBookedValue}M</h3>
                <p className="text-slate-400 text-xs mt-2">Active Pipeline</p>
              </div>
              <span className="absolute bottom-[-10px] right-[-10px] text-[100px] font-black text-secondary/5 leading-none select-none">VAL</span>
            </div>
            <div className="p-8 border-r border-white/5 bg-primary relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-secondary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">High-Tier Qualified</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{highQualityLeads}</h3>
                <p className="text-slate-400 text-xs mt-2">Score {'>'} 80</p>
              </div>
              <span className="absolute bottom-[-10px] right-[-10px] text-[100px] font-black text-secondary/5 leading-none select-none">HOT</span>
            </div>
            <div className="p-8 border-r border-white/5 bg-primary relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-secondary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Gross Leads</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{leads.length}</h3>
                <p className="text-slate-400 text-xs mt-2">In Database</p>
              </div>
              <span className="absolute bottom-[-10px] right-[-10px] text-[100px] font-black text-secondary/5 leading-none select-none">LDS</span>
            </div>
            <div className="p-8 bg-primary relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-secondary text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Avg Processing Time</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">4.8d</h3>
                <p className="text-slate-400 text-xs mt-2">Optimal Flow</p>
              </div>
              <span className="absolute bottom-[-10px] right-[-10px] text-[100px] font-black text-secondary/5 leading-none select-none">VEL</span>
            </div>
          </section>

          {/* Lead Pipeline Table */}
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-primary">LEADS PIPELINE</h2>
                <p className="text-xs text-secondary font-bold tracking-widest uppercase mt-1">Acquisition Tracking (Ranked by Qual. Score)</p>
              </div>
              <div className="flex gap-4">
                <button className="px-4 py-2 text-[10px] font-bold tracking-widest border-b-2 border-primary text-primary">ALL LEADS</button>
                <button className="px-4 py-2 text-[10px] font-bold tracking-widest text-outline hover:text-primary transition-colors cursor-pointer">COMMERCIAL</button>
                <button className="px-4 py-2 text-[10px] font-bold tracking-widest text-outline hover:text-primary transition-colors cursor-pointer">RESIDENTIAL</button>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest overflow-hidden shadow-sm border border-surface-container-high">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-surface-container-high">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary w-[35%]">Lead Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary">Qual. Score</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary">Asset Scope</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary">Valuation</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {visibleLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`shrink-0 w-10 h-10 flex items-center justify-center text-xs font-bold ${lead.status === 'New' ? 'bg-secondary text-on-secondary' : 'bg-primary text-white'}`}>
                            {lead.full_name?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-primary truncate" title={lead.full_name}>{lead.full_name || 'Anonymous'}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-tight mt-0.5 truncate" title={`${lead.email} • ${lead.affiliation_company || 'Independent'}`}>
                              {lead.email} • {lead.affiliation_company || 'Independent'}
                              {lead.agent_id ? <span className="text-secondary font-bold"> (Agent: {lead.agent_id})</span> : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${lead.qualificationScore >= 80 ? 'text-secondary' : lead.qualificationScore >= 50 ? 'text-primary' : 'text-outline'}`}>
                            {lead.qualificationScore}
                          </span>
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden hidden md:block">
                            <div className={`h-full ${lead.qualificationScore >= 80 ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${lead.qualificationScore}%`}} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{lead.project_type || 'Unspecified'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-primary">{lead.valuation}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                          lead.status === 'New' ? 'bg-secondary text-on-secondary shadow-sm' : 
                          lead.status === 'Under Review' ? 'bg-primary text-white' : 
                          'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {leads.length > 0 ? (
                 <div className="px-8 py-5 border-t border-surface-container-high bg-surface-bright flex justify-between items-center">
                   <p className="text-[10px] font-bold tracking-widest uppercase text-outline">
                     Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, leads.length)} of {leads.length} leads
                   </p>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                       disabled={currentPage === 1}
                       className="px-4 py-2 border border-surface-container-high text-[10px] font-bold tracking-widest uppercase disabled:opacity-50 text-primary hover:bg-surface-container-low transition-colors"
                     >
                       Previous
                     </button>
                     <button 
                       onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                       disabled={currentPage === totalPages}
                       className="px-4 py-2 border border-surface-container-high text-[10px] font-bold tracking-widest uppercase disabled:opacity-50 text-primary hover:bg-surface-container-low transition-colors"
                     >
                       Next
                     </button>
                   </div>
                 </div>
              ) : (
                <div className="p-8 text-center text-outline text-sm">No leads in the pipeline.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

import { create } from 'zustand';
import type { WizardData } from './wizardStore';

export interface Lead extends WizardData {
  id: string;
  status: 'New' | 'Under Review' | 'Negotiation' | 'Cold Prospect';
  valuation: string;
  submittedAt: string;
  qualificationScore: number;
}

interface AdminState {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'status' | 'valuation' | 'submittedAt' | 'qualificationScore'>) => void;
}

function calculateScore(lead: Partial<Lead>): number {
  let score = 30; // Base score
  if (lead.budget === '5m+') score += 40;
  if (lead.budget === '1m-5m') score += 20;
  if (lead.project_type === 'Commercial') score += 15;
  if (lead.timeline === 'immediately') score += 15;
  if (lead.linkedin_url) score += 5;
  return Math.min(score, 100);
}

export const useAdminStore = create<AdminState>((set) => ({
  leads: [],
  addLead: (leadData) => set((state) => {
    const score = calculateScore(leadData);
    const newLead: Lead = {
      ...leadData,
      id: `ALP-00${state.leads.length + 1}`,
      status: 'New',
      valuation: 'Pending Evaluation',
      submittedAt: new Date().toISOString(),
      qualificationScore: score
    };
    // Sort leads by score descending
    const updatedLeads = [newLead, ...state.leads].sort((a, b) => b.qualificationScore - a.qualificationScore);
    return { leads: updatedLeads };
  })
}));

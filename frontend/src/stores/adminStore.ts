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
  if (lead.budget === '250m+') score += 40;
  else if (lead.budget === '50m-250m') score += 30;
  else if (lead.budget === '25m-50m') score += 20;
  else score += 10;
  
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

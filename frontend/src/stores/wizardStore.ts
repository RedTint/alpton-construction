import { create } from 'zustand';

export interface WizardData {
  full_name: string;
  email: string;
  phone: string;
  facebook_account: string;
  affiliation_job: string;
  affiliation_company: string;
  affiliation_years: string;
  linkedin_url: string;
  project_type: string;
  budget: string;
  timeline: string;
  agent_id: string | null;
}

interface WizardState {
  isOpen: boolean;
  currentStep: number;
  data: WizardData;
  setOpen: (isOpen: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<WizardData>) => void;
  submitLead: () => Promise<void>;
  resetWizard: () => void;
}

const initialData: WizardData = {
  full_name: '', email: '', phone: '', facebook_account: '',
  affiliation_job: '', affiliation_company: '', affiliation_years: '', linkedin_url: '',
  project_type: '', budget: '', timeline: '',
  agent_id: new URLSearchParams(window.location.search).get('agent') || null
};

export const useWizardStore = create<WizardState>((set, get) => ({
  isOpen: false,
  currentStep: 1,
  data: initialData,
  setOpen: (isOpen) => set({ isOpen, currentStep: 1 }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  updateData: (partial) => set((state) => ({ data: { ...state.data, ...partial } })),
  submitLead: async () => {
    console.log("Submitting lead directly to Supabase...", get().data);
    // API logic will be placed here
    set({ currentStep: 4 }); // Success step
  },
  resetWizard: () => set({ currentStep: 1, data: initialData, isOpen: false })
}));

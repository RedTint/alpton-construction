import React from 'react';
import { useWizardStore } from '../../../stores/wizardStore';

export const WizardFlow: React.FC = () => {
  const { isOpen, currentStep, data, setOpen, nextStep, prevStep, updateData, submitLead, resetWizard } = useWizardStore();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-xl transition-all duration-300">
      <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
      
      <div className="relative w-full max-w-2xl bg-surface-container-lowest shadow-[0_40px_80px_rgba(25,28,29,0.1)] rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-primary structural-gradient text-on-primary p-6 sm:p-8 flex justify-between items-center relative">
          <div>
            <span className="font-label text-[10px] tracking-widest uppercase text-secondary font-bold mb-2 block">
              Alpton Construction
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl tracking-tight">
              Build Now, Pay Later
            </h2>
          </div>
          <button 
            onClick={() => setOpen(false)} 
            className="text-on-primary/60 hover:text-on-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-highest h-1">
          <div 
            className="bg-secondary h-full transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Form Body - Scrollable Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* STEP 1: Contact Information */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-headline font-bold text-xl text-primary mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Full Name</label>
                  <input data-testid="wizard-input-full_name" type="text" name="full_name" value={data.full_name} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Email</label>
                    <input data-testid="wizard-input-email" type="email" name="email" value={data.email} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="john@example.com" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Phone Number</label>
                    <input data-testid="wizard-input-phone" type="tel" name="phone" value={data.phone} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Facebook Account Name</label>
                  <input data-testid="wizard-input-facebook_account" type="text" name="facebook_account" value={data.facebook_account} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="John Doe FB" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Affiliation & Professional Info */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-headline font-bold text-xl text-primary mb-6">Professional Affiliation</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Job Title</label>
                    <input data-testid="wizard-input-affiliation_job" type="text" name="affiliation_job" value={data.affiliation_job} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="CEO / Developer" />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Company/Business Name</label>
                    <input data-testid="wizard-input-affiliation_company" type="text" name="affiliation_company" value={data.affiliation_company} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Years of Affiliation</label>
                  <select data-testid="wizard-select-affiliation_years" name="affiliation_years" value={data.affiliation_years} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all cursor-pointer">
                    <option value="" disabled>Select Duration</option>
                    <option value="0-2">0 - 2 Years</option>
                    <option value="3-5">3 - 5 Years</option>
                    <option value="5-10">5 - 10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">LinkedIn URL (Optional)</label>
                  <input data-testid="wizard-input-linkedin_url" type="url" name="linkedin_url" value={data.linkedin_url} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Project Details */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-headline font-bold text-xl text-primary mb-6">Project Parameters</h3>
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Project Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Residential', 'Commercial', 'Bespoke/Custom'].map(type => (
                      <button 
                        key={type}
                        data-testid={`wizard-btn-${type.toLowerCase().split('/')[0]}`}
                        onClick={() => updateData({ project_type: type })}
                        className={`p-4 rounded-sm font-headline text-sm tracking-wide transition-all border ${data.project_type === type ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-primary border-transparent hover:border-primary/30'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Estimated Budget</label>
                  <select data-testid="wizard-select-budget" name="budget" value={data.budget} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all cursor-pointer">
                    <option value="" disabled>Select Budget Tier</option>
                    <option value="5m-25m">₱5M - ₱25M</option>
                    <option value="25m-50m">₱25M - ₱50M</option>
                    <option value="50m-250m">₱50M - ₱250M</option>
                    <option value="250m+">₱250M+</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant font-bold">Desired Timeline</label>
                  <select data-testid="wizard-select-timeline" name="timeline" value={data.timeline} onChange={handleInputChange} className="bg-surface-container-high border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0 p-4 rounded-sm font-body text-primary outline-none transition-all cursor-pointer">
                    <option value="" disabled>Select Timeline</option>
                    <option value="immediately">Immediately (1-3 months)</option>
                    <option value="soon">Soon (3-6 months)</option>
                    <option value="planning">Planning phase (6mos+)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success State */}
          {currentStep === 4 && (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 structural-gradient shadow-xl">
                <span className="material-symbols-outlined text-4xl text-on-primary">done</span>
              </div>
              <h3 className="font-headline font-extrabold text-3xl text-primary mb-4">Request Received.</h3>
              <p className="font-body text-on-surface-variant max-w-sm mb-2">
                Your portfolio has been submitted to the Alpton architecture board.
              </p>
              {data.agent_id && (
                <p className="font-label text-[10px] tracking-widest uppercase text-secondary font-bold mt-4 bg-secondary/10 px-4 py-2 rounded-sm inline-block">
                  Agent ID applied: {data.agent_id}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:px-10 sm:py-6 bg-surface-container-low border-t border-surface-container flex justify-between items-center">
          {currentStep < 4 ? (
            <>
              {currentStep > 1 ? (
                <button 
                  onClick={prevStep}
                  className="px-6 py-3 font-label text-xs tracking-widest font-bold uppercase text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Back
                </button>
              ) : <div />}
              
              {currentStep < 3 ? (
                <button 
                  data-testid="wizard-btn-continue"
                  onClick={nextStep}
                  className="bg-primary text-on-primary px-8 py-3 rounded-sm font-headline font-bold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors shadow-lg cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button 
                  data-testid="wizard-btn-submit"
                  onClick={submitLead}
                  className="bg-secondary text-on-secondary px-8 py-3 rounded-sm font-headline font-bold text-xs tracking-widest uppercase hover:brightness-110 transition-colors shadow-lg cursor-pointer"
                >
                  Submit Inquiry
                </button>
              )}
            </>
          ) : (
            <button 
              data-testid="wizard-btn-close"
              onClick={resetWizard}
              className="w-full bg-primary text-on-primary px-8 py-4 rounded-sm font-headline font-bold text-sm tracking-widest uppercase hover:bg-primary-container transition-colors shadow-lg cursor-pointer"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

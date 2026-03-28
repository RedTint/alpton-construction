import { test, expect } from '@playwright/test';

const testLeads = [
  {
    name: 'Isabella Sterling', email: 'isabella@sterling.com', phone: '555-0199', fb: 'IsabellaS',
    job: 'Executive Architect', company: 'Sterling Design', years: '5-10', link: 'https://linkedin.com/in/isabellasterling',
    type: 'Commercial', budget: '250m+', timeline: 'immediately', expectedScore: 100
  },
  {
    name: 'Marcus Vance', email: 'marcus.v@vanceinc.com', phone: '555-0211', fb: 'MVance',
    job: 'CEO', company: 'Vance Inc', years: '10+', link: '',
    type: 'Commercial', budget: '50m-250m', timeline: 'soon', expectedScore: 75
  },
  {
    name: 'Elena Rostova', email: 'elena@gmail.com', phone: '555-0344', fb: '',
    job: 'Homeowner', company: '', years: '0-2', link: '',
    type: 'Bespoke/Custom', budget: '5m-25m', timeline: 'planning', expectedScore: 40
  },
  {
    name: 'David Chen', email: 'dchen@chenholdings.io', phone: '555-0899', fb: 'DavidChen',
    job: 'Managing Director', company: 'Chen Holdings', years: '3-5', link: 'https://linkedin.com/in/dchen',
    type: 'Residential', budget: '250m+', timeline: 'planning', expectedScore: 75
  },
  {
    name: 'Sarah Jenkins', email: 's.jenkins@retailgroup.com', phone: '555-0991', fb: 'SaraJ',
    job: 'Expansion Lead', company: 'Retail Group', years: '5-10', link: '',
    type: 'Commercial', budget: '25m-50m', timeline: 'immediately', expectedScore: 80
  }
];

test.describe('Alpton Construction E2E Flow', () => {
  test('User can submit 5 wizard inquiries of varying quality and admin can review them in local currency', async ({ page }) => {
    
    // Visit Landing Page
    await page.goto('/');

    for (const lead of testLeads) {
      // Open Wizard
      await page.getByTestId('cta-hero').click();
      await expect(page.getByText('Contact Information')).toBeVisible();

      // Step 1
      await page.getByTestId('wizard-input-full_name').fill(lead.name);
      await page.getByTestId('wizard-input-email').fill(lead.email);
      await page.getByTestId('wizard-input-phone').fill(lead.phone);
      await page.getByTestId('wizard-input-facebook_account').fill(lead.fb);
      await page.getByTestId('wizard-btn-continue').click();

      // Step 2
      await expect(page.getByText('Professional Affiliation')).toBeVisible();
      await page.getByTestId('wizard-input-affiliation_job').fill(lead.job);
      await page.getByTestId('wizard-input-affiliation_company').fill(lead.company);
      await page.getByTestId('wizard-select-affiliation_years').selectOption(lead.years);
      await page.getByTestId('wizard-input-linkedin_url').fill(lead.link);
      await page.getByTestId('wizard-btn-continue').click();

      // Step 3
      await expect(page.getByText('Project Parameters')).toBeVisible();
      await page.getByTestId(`wizard-btn-${lead.type.toLowerCase().split('/')[0]}`).click();
      await page.getByTestId('wizard-select-budget').selectOption(lead.budget);
      await page.getByTestId('wizard-select-timeline').selectOption(lead.timeline);
      await page.getByTestId('wizard-btn-submit').click();

      // Success Step
      await expect(page.getByText('Request Received.')).toBeVisible();
      await page.getByTestId('wizard-btn-close').click();
      await expect(page.getByText('Contact Information')).not.toBeVisible();
    }

    // Verify Admin Leads Dashboard
    await page.getByTestId('link-admin').click();
    await expect(page.getByRole('heading', { name: 'Lead Control Center' })).toBeVisible();
    
    // Check all 5 leads
    for (const lead of testLeads) {
      const leadId = lead.name.replace(/\s+/g, '-').toLowerCase();
      const tableRow = page.getByTestId(`lead-row-${leadId}`);
      await expect(tableRow).toBeVisible();
      await expect(tableRow.getByTestId('col-score')).toContainText(lead.expectedScore.toString());
      await expect(tableRow.getByTestId('col-valuation')).toContainText('Pending Evaluation');
      await expect(tableRow.getByTestId('col-status')).toContainText('New');
    }
    
    // Check KPI - 2 high tier qualified (Isabella 100, Sarah 80)
    await expect(page.locator('text=High-Tier Qualified').locator('..').locator('h3')).toContainText('2');
    
    // Total Leads - 5
    await expect(page.locator('text=Gross Leads').locator('..').locator('h3')).toContainText('5');
  });
});

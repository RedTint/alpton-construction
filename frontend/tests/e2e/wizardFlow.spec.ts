import { test, expect } from '@playwright/test';

test.describe('Alpton Construction E2E Flow', () => {
  test('User can submit a wizard inquiry and admin can review it', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    
    // 2. Open Wizard (Click the visible CTA in the Hero)
    await page.getByRole('button', { name: 'Request a Consultation' }).click();
    await expect(page.getByText('Contact Information')).toBeVisible();

    // 3. Step 1: Contact Form
    await page.locator('input[name="full_name"]').fill('Isabella Sterling');
    await page.locator('input[name="email"]').fill('isabella@sterling.com');
    await page.locator('input[name="phone"]').fill('555-0199');
    await page.locator('input[name="facebook_account"]').fill('IsabellaS');
    await page.getByRole('button', { name: 'Continue' }).click();

    // 4. Step 2: Affiliation Form
    await expect(page.getByText('Professional Affiliation')).toBeVisible();
    await page.locator('input[name="affiliation_job"]').fill('Executive Architect');
    await page.locator('input[name="affiliation_company"]').fill('Sterling Design');
    await page.locator('select[name="affiliation_years"]').selectOption('5-10');
    await page.locator('input[name="linkedin_url"]').fill('https://linkedin.com/in/isabellasterling');
    await page.getByRole('button', { name: 'Continue' }).click();

    // 5. Step 3: Project Details
    await expect(page.getByText('Project Parameters')).toBeVisible();
    await page.getByRole('button', { name: 'Commercial' }).click();
    await page.locator('select[name="budget"]').selectOption('5m+');
    await page.locator('select[name="timeline"]').selectOption('immediately');
    await page.getByRole('button', { name: 'Submit Inquiry' }).click();

    // 6. Success Step
    await expect(page.getByText('Request Received.')).toBeVisible();
    await page.getByRole('button', { name: 'Close Window' }).click();
    await expect(page.getByText('Contact Information')).not.toBeVisible();

    // 7. Verify Admin Leads Dashboard
    await page.goto('/admin/leads');
    await expect(page.getByRole('heading', { name: 'Lead Control Center' })).toBeVisible();
    
    // Check if the lead is in the table
    const tableRow = page.locator('tr').filter({ hasText: 'Isabella Sterling' });
    await expect(tableRow).toBeVisible();
    
    // Verify high qualification score calculation (should be 100)
    // 30 base + 40 (5m+ budget) + 15 (Commercial type) + 15 (immediately timeline) + 5 (linkedin url) = 100
    await expect(tableRow).toContainText('100');
    
    // Verify initial values
    await expect(tableRow).toContainText('Pending Evaluation'); // valuation
    await expect(tableRow).toContainText('New'); // status
  });
});

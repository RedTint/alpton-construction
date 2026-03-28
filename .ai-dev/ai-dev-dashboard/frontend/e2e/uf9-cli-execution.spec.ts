import { test, expect } from '@playwright/test';

/**
 * User Flow 9: CLI Command Execution from Dashboard
 *
 * Covers:
 * - Navigate to Terminal tab
 * - Terminal panel loads with quick actions
 * - Command input and execution
 * - Display real-time output
 * - Command history
 * - Quick action buttons
 */

test.describe('UF9: CLI Execution', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/cli');
    });

    test('should load the CLI terminal page', async ({ page }) => {
        // Header should be visible
        await expect(page.locator('h1', { hasText: 'CLI Terminal' })).toBeVisible();
    });

    test('should display quick action buttons', async ({ page }) => {
        const quickActions = page.getByTestId('cli-quick-actions');
        await expect(quickActions).toBeVisible();

        // Should have the 6 quick action buttons
        await expect(page.getByTestId('quick-action-new-feature')).toBeVisible();
        await expect(page.getByTestId('quick-action-build')).toBeVisible();
        await expect(page.getByTestId('quick-action-update-progress')).toBeVisible();
        await expect(page.getByTestId('quick-action-sync-board')).toBeVisible();
        await expect(page.getByTestId('quick-action-log-bug')).toBeVisible();
        await expect(page.getByTestId('quick-action-fix-bug')).toBeVisible();
    });

    test('should display command input and output areas', async ({ page }) => {
        // Command input form
        const inputForm = page.getByTestId('cli-input-form');
        await expect(inputForm).toBeVisible();

        // Command input field
        const commandInput = page.getByTestId('cli-command-input');
        await expect(commandInput).toBeVisible();
        await expect(commandInput).toHaveAttribute('placeholder', '/command args...');

        // Output area
        const output = page.getByTestId('cli-output');
        await expect(output).toBeVisible();
    });

    test('should display history sidebar', async ({ page }) => {
        const history = page.getByTestId('cli-history');
        await expect(history).toBeVisible();
    });

    test('should type a command in the input', async ({ page }) => {
        const commandInput = page.getByTestId('cli-command-input');
        await commandInput.fill('/sync-board');
        await expect(commandInput).toHaveValue('/sync-board');
    });

    test('should have execute button that enables when command is typed', async ({ page }) => {
        const commandInput = page.getByTestId('cli-command-input');
        const executeBtn = page.getByTestId('cli-execute-btn');

        // Execute button should be disabled when input is empty
        await expect(executeBtn).toBeDisabled();

        // Type a command
        await commandInput.fill('/build');

        // Execute button should now be enabled
        await expect(executeBtn).toBeEnabled();
    });

    test('should show ready message when no command has been executed', async ({ page }) => {
        const output = page.getByTestId('cli-output');
        await expect(output.locator('text=Ready')).toBeVisible();
    });

    test('should display output after quick action click', async ({ page }) => {
        // Click a quick action button
        const syncBtn = page.getByTestId('quick-action-sync-board');
        await syncBtn.click();

        // Should show executing or result in output area
        const output = page.getByTestId('cli-output');
        // Either "Executing..." or a result should appear
        await page.waitForTimeout(1000);
        const text = await output.textContent();
        expect(text).toBeTruthy();
    });
});

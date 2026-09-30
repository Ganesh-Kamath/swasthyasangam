import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Demo Reset Verification', () => {
  test('Reset button restores initial pristine state, default selections, and clears revoked state', async ({ page }) => {
    const monitor = attachErrorMonitor(page);

    // 1. Go to patient view and create session
    await page.goto('/?view=patient');
    await page.getByTestId('create-temporary-access-btn').click();
    await page.getByTestId('generate-qr-access-btn').click();
    await expect(page.getByTestId('qr-access-card')).toBeVisible();

    // 2. Revoke the session
    await page.getByTestId('revoke-access-btn').click();
    await page.getByTestId('confirm-revoke-btn').click();
    await expect(page.locator('.status-title')).toContainText('Access Revoked');

    // 3. Click "Reset Demo" in top bar
    await page.getByTestId('top-reset-demo-btn').click();

    // 4. Verify redirected to Patient Records with default 3 selections
    await expect(page.getByTestId('patient-records-view')).toBeVisible();
    await expect(page.getByTestId('selection-count-indicator')).toContainText('3 of 12 records selected');

    // Verify revoked state is completely cleared
    await expect(page.locator('.status-title')).not.toBeVisible();

    // Default 3 records selected
    await expect(page.getByTestId('record-card-rec-ecg-01')).toHaveClass(/selected/);
    await expect(page.getByTestId('record-card-rec-lipid-02')).toHaveClass(/selected/);
    await expect(page.getByTestId('record-card-rec-echo-03')).toHaveClass(/selected/);
    await expect(page.getByTestId('record-card-rec-presc-04')).not.toHaveClass(/selected/);

    monitor.verifyNoErrors();
  });
});

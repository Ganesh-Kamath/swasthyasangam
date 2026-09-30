import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Error States & Privacy Fallback Verification', () => {
  test('Invalid session identifier displays ACCESS NOT FOUND without crashing', async ({ page }) => {
    const monitor = attachErrorMonitor(page);

    // Navigate directly with an unrecognized session code
    await page.goto('/?session=INVALID-SESSION-999');

    // Expected: ACCESS NOT FOUND screen with reset option
    await expect(page.getByTestId('access-not-found-card')).toBeVisible();
    await expect(page.locator('.scan-trans-title')).toHaveText('ACCESS NOT FOUND');
    await expect(page.getByTestId('reset-session-code-btn')).toBeVisible();

    // Reset back to demo session works
    await page.getByTestId('reset-session-code-btn').click();
    await expect(page.getByTestId('session-code-input')).toHaveValue('SS-DEMO-4821');

    monitor.verifyNoErrors();
  });

  test('Empty record selection disables progression and shows warning', async ({ page }) => {
    const monitor = attachErrorMonitor(page);

    await page.goto('/?view=patient');
    await expect(page.getByTestId('patient-records-view')).toBeVisible();

    // Deselect all records
    const selectAllBtn = page.getByTestId('toggle-select-all-btn');
    // If currently 3 selected, clicking deselect all or clicking each card
    const ecgCard = patientRecord(page, 'rec-ecg-01');
    const lipidCard = patientRecord(page, 'rec-lipid-02');
    const echoCard = patientRecord(page, 'rec-echo-03');
    const prescCard = patientRecord(page, 'rec-presc-04');

    if (await isSelected(ecgCard)) await ecgCard.click();
    if (await isSelected(lipidCard)) await lipidCard.click();
    if (await isSelected(echoCard)) await echoCard.click();
    if (await isSelected(prescCard)) await prescCard.click();

    // Verify 0 of 12 records selected
    await expect(page.getByTestId('selection-count-indicator')).toContainText('0 of 12 records selected');
    await expect(page.getByTestId('selection-status-subtext')).toContainText('Select at least one record to continue.');

    // Button MUST be disabled
    const createBtn = page.getByTestId('create-temporary-access-btn');
    await expect(createBtn).toBeDisabled();

    monitor.verifyNoErrors();
  });
});

function patientRecord(page: any, id: string) {
  return page.getByTestId(`record-card-${id}`);
}

async function isSelected(locator: any): Promise<boolean> {
  return await locator.evaluate((el: HTMLElement) => el.classList.contains('selected'));
}

import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Session Expiry Verification', () => {
  test('Fast-duration test: Session reaches 00:00 -> Transitions to ACCESS EXPIRED -> Doctor access blocked', async ({ browser }) => {
    const context = await browser.newContext();
    const patientPage = await context.newPage();
    const doctorPage = await context.newPage();

    const patientMonitor = attachErrorMonitor(patientPage);
    const doctorMonitor = attachErrorMonitor(doctorPage);

    // 1. Patient opens with 2000ms test duration override
    await patientPage.goto('/?duration_ms=2000&view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();

    const sessionId = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionId).toBeTruthy();

    // 2. Doctor opens session while active
    await doctorPage.goto(`/?session=${sessionId}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();

    // 3. Wait for the 2000ms duration to expire
    await doctorPage.waitForTimeout(2500);
    await doctorPage.reload();

    // 4. Verify ACCESS EXPIRED state on Doctor View
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible();
    await expect(doctorPage.getByTestId('status-title-expired')).toContainText('ACCESS EXPIRED');

    // Verify records are unavailable
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();

    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();

    await context.close();
  });
});

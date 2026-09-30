import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Demo Simulate Expiry Feature', () => {
  test('Full Simulate Expiry Workflow: 15s Simulation -> Real Server Expiry -> Live Countdown -> Cutoff -> Block on Refresh', async ({ browser }) => {
    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();

    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    const patientMonitor = attachErrorMonitor(patientPage);
    const doctorMonitor = attachErrorMonitor(doctorPage);

    // 1. Create normal session on Patient laptop
    await patientPage.goto('/?view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();

    // Verify session is active
    await expect(patientPage.getByTestId('qr-access-card')).toBeVisible();
    const sessionCode = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    // 2. Click "Demo: Simulate Expiry" -> Modal opens with 15s and 30s choices
    await patientPage.getByTestId('simulate-expiry-btn').click();
    await expect(patientPage.getByTestId('simulate-expiry-modal')).toBeVisible();
    await expect(patientPage.getByTestId('expire-15s-btn')).toBeVisible();
    await expect(patientPage.getByTestId('expire-30s-btn')).toBeVisible();

    // 3. Choose 15 seconds
    await patientPage.getByTestId('expire-15s-btn').click();
    await expect(patientPage.getByTestId('simulate-expiry-modal')).not.toBeVisible();

    // 4. Open doctor view on independent context (separate device)
    await doctorPage.goto(`/${sessionCode}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();

    // 5. Confirm countdown starts around 15 seconds (e.g. 00:15, 00:14, 00:13...)
    const timerDisplay = doctorPage.getByTestId('timer-value-display').first();
    await expect(timerDisplay).toBeVisible();
    const timerText = await timerDisplay.textContent();
    expect(timerText).toMatch(/00:(1[0-5]|0[0-9])/);

    // Confirm records are currently visible
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).toBeVisible();

    // 6. Wait for timer to reach 00:00 (around 15-16s)
    // Doctor UI transitions automatically to ACCESS EXPIRED
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible({ timeout: 20000 });
    await expect(doctorPage.getByTestId('status-title-expired')).toContainText('ACCESS EXPIRED');
    await expect(doctorPage.getByText('This temporary sharing session has ended.')).toBeVisible();

    // 7. Confirm doctor loses access and records are blocked
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();

    // 8. Refresh doctor view - server MUST still return EXPIRED
    await doctorPage.reload();
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible();
    await expect(doctorPage.getByTestId('status-title-expired')).toContainText('ACCESS EXPIRED');
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).not.toBeVisible();

    // 9. Confirm patient view also shows Access Expired
    await expect(patientPage.getByTestId('patient-access-expired-card')).toBeVisible({ timeout: 5000 });
    await expect(patientPage.getByText('This temporary sharing session has ended.')).toBeVisible();

    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();

    await patientContext.close();
    await doctorContext.close();
  });

  test('Second session creation is completely independent', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Create session
    await page.goto('/?view=patient');
    await page.getByTestId('create-temporary-access-btn').click();
    await page.getByTestId('generate-qr-access-btn').click();

    // Simulate expiry 30s selection check
    await page.getByTestId('simulate-expiry-btn').click();
    await expect(page.getByTestId('simulate-expiry-modal')).toBeVisible();
    await page.getByTestId('expire-30s-btn').click();
    await expect(page.getByTestId('simulate-expiry-modal')).not.toBeVisible();

    // Timer on patient view should now be around 00:30 (e.g. 00:29 or 00:30)
    const patientTimer = page.getByTestId('timer-value-display');
    await expect(patientTimer).toBeVisible();
    const timeVal = await patientTimer.textContent();
    expect(timeVal).toMatch(/00:(2[0-9]|30)/);

    await context.close();
  });
});

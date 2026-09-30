import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Session Revocation Verification', () => {
  test('Patient revokes active session; Doctor immediately loses record access and refresh shows ACCESS REVOKED', async ({ browser }) => {
    // Sharing storage between contexts via newContext with storageState or direct localStorage synchronization
    const context = await browser.newContext();
    const patientPage = await context.newPage();
    const doctorPage = await context.newPage();

    const patientMonitor = attachErrorMonitor(patientPage);
    const doctorMonitor = attachErrorMonitor(doctorPage);

    // 1. Patient creates access session
    await patientPage.goto('/?view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();
    await expect(patientPage.getByTestId('qr-access-card')).toBeVisible();

    const sessionId = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionId).toBeTruthy();

    // 2. Doctor opens session in second tab/page
    await doctorPage.goto(`/?session=${sessionId}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();

    // 3. Patient revokes access
    await patientPage.bringToFront();
    await patientPage.getByTestId('revoke-access-btn').click();
    await expect(patientPage.getByTestId('revoke-modal')).toBeVisible();
    await patientPage.getByTestId('confirm-revoke-btn').click();

    // Patient view updates to Revoked
    await expect(patientPage.getByTestId('status-title-revoked', { timeout: 3000 }).or(patientPage.locator('.status-title'))).toContainText('Access Revoked');

    // 4. Doctor view refreshes or synchronizes
    await doctorPage.bringToFront();
    await doctorPage.reload();

    // Doctor MUST see ACCESS REVOKED
    await expect(doctorPage.getByTestId('access-revoked-card')).toBeVisible();
    await expect(doctorPage.getByTestId('status-title-revoked')).toHaveText('ACCESS REVOKED');

    // All medical records MUST be inaccessible
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-echo-03')).not.toBeVisible();

    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();

    await context.close();
  });
});

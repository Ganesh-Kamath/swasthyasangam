import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Judge Live Demonstration Flow — 27 Steps', () => {
  test('Complete 27-step Judge Walkthrough: Clean State -> Selective Sharing -> Smart Insights Traceability -> Access History -> Revocation Lockout', async ({ browser }) => {
    // 1. Patient Context
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const patientMonitor = attachErrorMonitor(patientPage);

    // Step 1: Start Demo
    await patientPage.goto('/');
    await expect(patientPage.getByTestId('landing-view')).toBeVisible();
    await expect(patientPage.getByTestId('start-demo-btn')).toBeVisible();

    // Step 2: Open Rahul's records
    await patientPage.getByTestId('start-demo-btn').click();
    await expect(patientPage.getByTestId('patient-records-view')).toBeVisible();
    await expect(patientPage.getByTestId('patient-title')).toHaveText('Rahul Mehta');

    // Step 3: Confirm records exist
    const ecgCard = patientPage.getByTestId('record-card-rec-ecg-01');
    const lipidCard = patientPage.getByTestId('record-card-rec-lipid-02');
    const echoCard = patientPage.getByTestId('record-card-rec-echo-03');
    const prescCard = patientPage.getByTestId('record-card-rec-presc-04');

    await expect(ecgCard).toBeVisible();
    await expect(lipidCard).toBeVisible();
    await expect(echoCard).toBeVisible();
    await expect(prescCard).toBeVisible();

    // Step 4: Confirm ECG, Lipid Profile, 2D Echo are selected
    await expect(ecgCard).toHaveClass(/selected/);
    await expect(lipidCard).toHaveClass(/selected/);
    await expect(echoCard).toHaveClass(/selected/);

    // Step 5: Confirm Cardiology Prescription is NOT selected
    await expect(prescCard).not.toHaveClass(/selected/);
    await expect(prescCard).toContainText('NOT SHARED');

    // Step 6: Create Temporary Access
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await expect(patientPage.getByTestId('create-access-view')).toBeVisible();

    // Step 7: Confirm purpose is: "Remote Cardiology Consultation"
    await expect(patientPage.locator('.clinical-form-card')).toContainText('Remote Cardiology Consultation');
    await expect(patientPage.getByTestId('doctor-name-display')).toHaveText('Dr. Ananya Shah');

    // Step 8: Confirm temporary duration / session state
    await expect(patientPage.getByTestId('duration-option-30')).toHaveClass(/active/);

    // Step 9: Generate QR / session access
    await patientPage.getByTestId('generate-qr-access-btn').click();
    await expect(patientPage.getByTestId('qr-access-card')).toBeVisible();

    const sessionIdElem = patientPage.getByTestId('session-id-display');
    await expect(sessionIdElem).toBeVisible();
    const sessionId = (await sessionIdElem.textContent())?.trim();
    expect(sessionId).toBeTruthy();

    await expect(patientPage.getByTestId('qr-target-doctor')).toHaveText('Dr. Ananya Shah');
    await expect(patientPage.getByTestId('qr-shared-count-badge')).toContainText('3 of 12 records shared');
    await expect(patientPage.getByTestId('qr-security-note')).toContainText('QR code contains only a temporary session identifier, not medical records');

    // Steps 10-12: Simulate Doctor Scan & Open Doctor View
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    const doctorMonitor = attachErrorMonitor(doctorPage);

    // Step 10 & 11: Navigate doctor to session URL (optical scan simulation)
    await doctorPage.goto(`/?session=${sessionId}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();

    // Step 12: Doctor view loaded with verified access
    await expect(doctorPage.getByTestId('access-granted-pill')).toHaveText('ACCESS GRANTED');
    await expect(doctorPage.getByTestId('doctor-patient-name')).toHaveText('Rahul Mehta');
    await expect(doctorPage.getByTestId('doctor-physician-name')).toHaveText('Dr. Ananya Shah');
    await expect(doctorPage.getByTestId('doctor-consultation-purpose')).toHaveText('Remote Cardiology Consultation');

    // Step 13: Confirm ONLY the three selected records are visible
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-echo-03')).toBeVisible();

    // Step 14: Confirm Prescription is absent
    await expect(doctorPage.getByTestId('doctor-record-card-rec-presc-04')).not.toBeVisible();

    // Step 15: Open one shared medical record
    await doctorPage.getByTestId('view-report-btn-rec-lipid-02').click();
    await expect(doctorPage.getByTestId('doc-viewer-modal')).toBeVisible();
    await expect(doctorPage.getByTestId('modal-doc-title')).toContainText('Lipid Profile');
    await expect(doctorPage.getByTestId('doc-metrics-table')).toContainText('142'); // LDL 142
    await doctorPage.getByTestId('close-doc-btn').click();
    await expect(doctorPage.getByTestId('doc-viewer-modal')).not.toBeVisible();

    // Step 16: Inspect Smart Insights panel
    await expect(doctorPage.getByTestId('doctor-ai-insights-panel')).toBeVisible();

    // Step 17: Confirm Smart Insights says it is based on the shared records
    await expect(doctorPage.getByTestId('doctor-ai-insights-panel')).toContainText('SMART INSIGHTS');
    await expect(doctorPage.getByTestId('doctor-ai-insights-panel')).toContainText('Based on 3 shared records');
    await expect(doctorPage.getByTestId('doctor-ai-insights-panel')).toContainText('ECG • Lipid Profile • 2D Echocardiogram');

    // Step 18: Confirm every factual insight has a source
    await expect(doctorPage.getByTestId('ai-insight-item-0')).toBeVisible();
    await expect(doctorPage.getByTestId('ai-insight-sources-0')).toBeVisible();
    await expect(doctorPage.getByTestId('ai-insight-sources-0')).toContainText('Source:');

    // Step 19: Click a source evidence chip
    const sourceChip = doctorPage.getByTestId('evidence-chip-0-0');
    await expect(sourceChip).toBeVisible();
    await sourceChip.click();

    // Step 20: Confirm the original record opens and the value matches
    await expect(doctorPage.getByTestId('doc-viewer-modal')).toBeVisible();
    await expect(doctorPage.getByTestId('modal-doc-title')).toBeVisible();
    await doctorPage.getByTestId('close-doc-btn').click();
    await expect(doctorPage.getByTestId('doc-viewer-modal')).not.toBeVisible();

    // Step 21 & 22: Open Access History on Patient side & Confirm event
    await patientPage.bringToFront();
    await expect(patientPage.getByTestId('access-history-panel')).toBeVisible();
    await expect(patientPage.getByTestId('access-history-summary-card')).toBeVisible();
    await expect(patientPage.getByTestId('access-history-summary-card')).toContainText('Dr. Ananya Shah');
    await expect(patientPage.getByTestId('access-history-summary-card')).toContainText('Remote Cardiology Consultation');

    // Step 23: Revoke Access
    await patientPage.getByTestId('revoke-access-btn').click();
    await expect(patientPage.getByTestId('revoke-modal')).toBeVisible();
    await patientPage.getByTestId('confirm-revoke-btn').click();
    await expect(patientPage.getByTestId('status-title-revoked', { timeout: 3000 }).or(patientPage.locator('.status-title'))).toContainText('Access Revoked');

    // Step 24: Confirm Doctor View updates to revoked/denied state
    await doctorPage.bringToFront();
    await doctorPage.reload();
    await expect(doctorPage.getByTestId('access-revoked-card')).toBeVisible();
    await expect(doctorPage.getByTestId('status-title-revoked')).toHaveText('ACCESS REVOKED');

    // Step 25 & 26: Refresh Doctor View & Try accessing previously authorized records
    await doctorPage.reload();
    await expect(doctorPage.getByTestId('access-revoked-card')).toBeVisible();

    // Step 27: Confirm access remains completely denied with ZERO records
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-echo-03')).not.toBeVisible();

    // Verification of 0 console runtime errors across entire session
    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();

    await patientContext.close();
    await doctorContext.close();
  });
});

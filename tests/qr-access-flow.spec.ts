import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Core QR Access Workflow', () => {
  test('Complete flow: Patient selects 3 records, generates QR, doctor scans and receives selective access', async ({ browser }) => {
    // Isolated Patient Context (Context A)
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const patientMonitor = attachErrorMonitor(patientPage);

    // 1. Landing Page
    await patientPage.goto('/');
    await expect(patientPage.getByTestId('landing-view')).toBeVisible();
    await expect(patientPage.getByTestId('start-demo-btn')).toBeVisible();

    // 2. Start Demo -> Patient Records Page
    await patientPage.getByTestId('start-demo-btn').click();
    await expect(patientPage.getByTestId('patient-records-view')).toBeVisible();
    await expect(patientPage.getByTestId('patient-title')).toHaveText('Rahul Mehta');

    // 3. Selection Verification: Default has ECG, Lipid, and Echo selected, Prescription unselected
    const ecgCard = patientPage.getByTestId('record-card-rec-ecg-01');
    const lipidCard = patientPage.getByTestId('record-card-rec-lipid-02');
    const echoCard = patientPage.getByTestId('record-card-rec-echo-03');
    const prescCard = patientPage.getByTestId('record-card-rec-presc-04');

    await expect(ecgCard).toHaveClass(/selected/);
    await expect(lipidCard).toHaveClass(/selected/);
    await expect(echoCard).toHaveClass(/selected/);
    await expect(prescCard).not.toHaveClass(/selected/);

    // Verify selection count indicator
    await expect(patientPage.getByTestId('selection-count-indicator')).toContainText('3 of 12 records selected');

    // 4. Click "Create Temporary Access"
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await expect(patientPage.getByTestId('create-access-view')).toBeVisible();
    await expect(patientPage.getByTestId('doctor-name-display')).toHaveText('Dr. Ananya Shah');
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('ECG Report');
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('Lipid Profile');
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('2D Echocardiogram');
    await expect(patientPage.getByTestId('selected-records-chips')).not.toContainText('Cardiology Prescription');

    // 5. Generate QR Access
    await patientPage.getByTestId('generate-qr-access-btn').click();
    await expect(patientPage.getByTestId('qr-access-card')).toBeVisible();

    // Verify QR Element & Dimensions
    const qrFrame = patientPage.getByTestId('qr-frame-box');
    await expect(qrFrame).toBeVisible();
    const qrBox = await qrFrame.boundingBox();
    expect(qrBox).not.toBeNull();
    expect(qrBox!.width).toBeGreaterThan(150);
    expect(qrBox!.height).toBeGreaterThan(150);

    // Verify Session ID and Records count badge
    const sessionIdElem = patientPage.getByTestId('session-id-display');
    await expect(sessionIdElem).toBeVisible();
    const sessionId = (await sessionIdElem.textContent())?.trim();
    expect(sessionId).toBeTruthy();
    expect(sessionId).toContain('SS-DEMO-');

    await expect(patientPage.getByTestId('qr-shared-count-badge')).toContainText('3 of 12 records shared');
    await expect(patientPage.getByTestId('qr-security-note')).toContainText('Zero Health Data in QR');

    // 6. Isolated Doctor Context (Context B) accessing the session
    // Test optical link simulation / route navigation
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    const doctorMonitor = attachErrorMonitor(doctorPage);

    // Navigate to doctor access route directly using the session ID
    await doctorPage.goto(`/?session=${sessionId}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();

    // Verify Doctor view patient metadata
    await expect(doctorPage.getByTestId('access-granted-pill')).toHaveText('ACCESS GRANTED');
    await expect(doctorPage.getByTestId('doctor-patient-name')).toHaveText('Rahul Mehta');
    await expect(doctorPage.getByTestId('doctor-physician-name')).toHaveText('Dr. Ananya Shah');
    await expect(doctorPage.getByTestId('doctor-shared-records-count')).toContainText('3 of 12 reports');

    // 7. Verify Selective Records Visibility
    // 3 Selected reports MUST be visible
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-echo-03')).toBeVisible();

    // Prescription MUST NOT be visible
    await expect(doctorPage.getByTestId('doctor-record-card-rec-presc-04')).not.toBeVisible();

    // Verify Withheld Records Badge
    await expect(doctorPage.getByTestId('withheld-records-badge')).toContainText('9 withheld');
    await expect(doctorPage.getByTestId('withheld-records-badge')).toContainText('Cardiology Prescription');

    // 8. Open Report Document Viewer
    await doctorPage.getByTestId('view-report-btn-rec-ecg-01').click();
    await expect(doctorPage.getByTestId('doc-viewer-modal')).toBeVisible();
    await expect(doctorPage.getByTestId('modal-doc-title')).toContainText('ECG Report');
    await expect(doctorPage.getByTestId('doc-source-facility')).toContainText('City Heart Centre');
    await expect(doctorPage.getByTestId('doc-record-date')).toContainText('12 August 2025');
    await expect(doctorPage.getByTestId('demo-watermark-badge')).toBeVisible();

    // Close Document Modal
    await doctorPage.getByTestId('close-doc-btn').click();
    await expect(doctorPage.getByTestId('doc-viewer-modal')).not.toBeVisible();

    // Verify 0 runtime console errors
    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();

    await patientContext.close();
    await doctorContext.close();
  });
});

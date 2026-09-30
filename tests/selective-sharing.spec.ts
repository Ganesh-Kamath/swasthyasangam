import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Selective Sharing Verification', () => {
  test('Patient selects strictly ECG and Echocardiogram; Doctor receives ONLY those two', async ({ browser }) => {
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const patientMonitor = attachErrorMonitor(patientPage);

    // 1. Go to patient records
    await patientPage.goto('/');
    await patientPage.getByTestId('start-demo-btn').click();
    await expect(patientPage.getByTestId('patient-records-view')).toBeVisible();

    // 2. Clear all and select ONLY ECG (rec-ecg-01) and Echocardiogram (rec-echo-03)
    await patientPage.getByTestId('clear-selection-btn').click();
    await patientPage.getByTestId('record-card-rec-ecg-01').click();
    await patientPage.getByTestId('record-card-rec-echo-03').click();

    // Verify 2 records selected
    await expect(patientPage.getByTestId('selection-count-indicator')).toContainText('2 of 12 records selected');

    // 3. Create Access
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('ECG Report');
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('2D Echocardiogram');
    await expect(patientPage.getByTestId('selected-records-chips')).not.toContainText('Lipid Profile');
    await expect(patientPage.getByTestId('selected-records-chips')).not.toContainText('Cardiology Prescription');

    // 4. Generate QR
    await patientPage.getByTestId('generate-qr-access-btn').click();
    await expect(patientPage.getByTestId('qr-shared-count-badge')).toContainText('2 of 12 records shared');

    const sessionId = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionId).toBeTruthy();

    // 5. Doctor Context connects
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    const doctorMonitor = attachErrorMonitor(doctorPage);

    await doctorPage.goto(`/?session=${sessionId}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();

    // Verify Doctor Record Access Boundary
    await expect(doctorPage.getByTestId('doctor-shared-records-count')).toContainText('2 of 12 reports');
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-echo-03')).toBeVisible();

    // Lipid and Prescription MUST be completely absent
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-presc-04')).not.toBeVisible();

    // Withheld badge should mention withheld records
    await expect(doctorPage.getByTestId('withheld-records-badge')).toContainText('10 withheld');
    await expect(doctorPage.getByTestId('withheld-records-badge')).toContainText('Lipid Profile');
    await expect(doctorPage.getByTestId('withheld-records-badge')).toContainText('Cardiology Prescription');

    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();

    await patientContext.close();
    await doctorContext.close();
  });
});

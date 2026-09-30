import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Demo Medical Records Library & Scenarios', () => {
  test('1. Patient Switcher: Multiple fictional patients load with unique clinical records', async ({ page }) => {
    const monitor = attachErrorMonitor(page);
    await page.goto('/?view=patient');
    await expect(page.getByTestId('patient-records-view')).toBeVisible();

    // Verify initial default patient: Rahul Mehta (52 Y, B+, Cardiology)
    await expect(page.getByTestId('patient-title')).toHaveText('Rahul Mehta');
    await expect(page.getByTestId('patient-profile-card')).toContainText('52 Y');
    await expect(page.getByTestId('patient-profile-card')).toContainText('B+');
    await expect(page.getByTestId('patient-profile-card')).toContainText('Primary: Cardiology');

    // Switch to Aisha Kulkarni (34 Y, O+, General Medicine)
    await page.getByTestId('switch-patient-btn-pat-aisha-02').click();
    await expect(page.getByTestId('patient-title')).toHaveText('Aisha Kulkarni');
    await expect(page.getByTestId('patient-profile-card')).toContainText('34 Y');
    await expect(page.getByTestId('patient-profile-card')).toContainText('O+');
    await expect(page.getByTestId('patient-profile-card')).toContainText('Primary: General Medicine');
    // Aisha's CBC record should be present
    await expect(page.getByTestId('record-card-rec-ak-cbc-2026')).toBeVisible();

    // Switch to Arjun Desai (61 Y, A+, Diabetes / Cardiology)
    await page.getByTestId('switch-patient-btn-pat-arjun-03').click();
    await expect(page.getByTestId('patient-title')).toHaveText('Arjun Desai');
    await expect(page.getByTestId('patient-profile-card')).toContainText('61 Y');
    await expect(page.getByTestId('patient-profile-card')).toContainText('A+');
    await expect(page.getByTestId('patient-profile-card')).toContainText('Primary: Diabetes / Cardiology');
    // Arjun's HbA1c record should be present
    await expect(page.getByTestId('record-card-rec-ad-hba1c-2026')).toBeVisible();

    monitor.verifyNoErrors();
  });

  test('2. Search, Filter Pills & Sorting in Records Library', async ({ page }) => {
    const monitor = attachErrorMonitor(page);
    await page.goto('/?view=patient');
    await expect(page.getByTestId('patient-records-view')).toBeVisible();

    // Verify Rahul Mehta's longitudinal records are loaded
    await expect(page.getByTestId('record-card-rec-ecg-01')).toBeVisible(); // 2026

    // Test Search Input
    const searchInput = page.getByTestId('records-search-input');
    await searchInput.fill('Troponin');
    await expect(page.getByTestId('record-card-rec-rm-trop-2026')).toBeVisible();
    await expect(page.getByTestId('record-card-rec-ecg-01')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.getByTestId('record-card-rec-ecg-01')).toBeVisible();

    // Test Category Filter Pill: Blood Tests
    await page.getByTestId('filter-pill-blood-tests').click();
    await expect(page.getByTestId('record-card-rec-lipid-02')).toBeVisible();
    await expect(page.getByTestId('record-card-rec-ecg-01')).not.toBeVisible();

    // Test Category Filter Pill: Prescriptions
    await page.getByTestId('filter-pill-prescriptions').click();
    await expect(page.getByTestId('record-card-rec-presc-04')).toBeVisible();

    // Return to All
    await page.getByTestId('filter-pill-all').click();
    await expect(page.getByTestId('record-card-rec-ecg-01')).toBeVisible();

    // Test Sorting: Oldest First
    await page.getByTestId('records-sort-select').selectOption('oldest');
    // 2021 records should appear at top
    await expect(page.getByTestId('record-card-rec-rm-lipid-2021')).toBeVisible();

    monitor.verifyNoErrors();
  });

  test('3. Polished Clinical Document Viewer with Structured Metrics', async ({ page }) => {
    const monitor = attachErrorMonitor(page);
    await page.goto('/?view=patient');

    // Click preview on 2026 Lipid Profile
    await page.getByTestId('record-preview-btn-rec-lipid-02').click();
    await expect(page.getByTestId('doc-viewer-modal')).toBeVisible();

    // Verify Document Viewer contents
    await expect(page.getByTestId('modal-doc-title')).toContainText('Lipid Profile');
    await expect(page.getByTestId('doc-patient-name')).toContainText('Rahul Mehta');
    await expect(page.getByTestId('provenance-metadata-bar')).toContainText('Metro Diagnostics');
    await expect(page.getByTestId('provenance-metadata-bar')).toContainText('Pathology & Biochemistry');
    await expect(page.getByTestId('provenance-metadata-bar')).toContainText('2026');

    // Verify structured lab metrics and reference ranges
    await expect(page.getByTestId('doc-metrics-table')).toContainText('Total Cholesterol');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('218');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('LDL Cholesterol');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('142');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('HDL Cholesterol');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('44');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('Triglycerides');
    await expect(page.getByTestId('doc-metrics-table')).toContainText('161');

    // Verify impression and findings
    await expect(page.getByTestId('doc-impression-box')).toContainText('Primary dyslipidemia');
    await expect(page.getByTestId('demo-watermark-badge')).toBeVisible();

    // Close Viewer
    await page.getByTestId('close-doc-btn').click();
    await expect(page.getByTestId('doc-viewer-modal')).not.toBeVisible();

    monitor.verifyNoErrors();
  });

  test('4. Quick Demo Mode: Loading Preconfigured Scenarios', async ({ page }) => {
    const monitor = attachErrorMonitor(page);
    await page.goto('/?view=patient');

    // Open Scenario Modal
    await page.getByTestId('load-demo-scenario-btn').click();
    await expect(page.getByTestId('demo-scenario-modal')).toBeVisible();

    // Select Scenario 3: Diabetes Review (Arjun Desai)
    await page.getByTestId('select-scenario-btn-scenario-diabetes-review').click();
    await expect(page.getByTestId('demo-scenario-modal')).not.toBeVisible();

    // Verify Patient switched to Arjun Desai
    await expect(page.getByTestId('patient-title')).toHaveText('Arjun Desai');
    await expect(page.getByTestId('consultation-purpose-select')).toHaveValue('Endocrinology & diabetes review');

    // Verify Arjun's diabetes records are selected
    await expect(page.getByTestId('record-card-rec-ad-hba1c-2026')).toHaveClass(/selected/);
    await expect(page.getByTestId('record-card-rec-ad-fbg-2026')).toHaveClass(/selected/);
    await expect(page.getByTestId('record-card-rec-ad-ppbg-2026')).toHaveClass(/selected/);
    await expect(page.getByTestId('record-card-rec-ad-lipid-2026')).toHaveClass(/selected/);

    monitor.verifyNoErrors();
  });

  test('5. End-to-End Selective Session Isolation & AI Clinical Insights with Source Traceability', async ({ browser }) => {
    // PATIENT CONTEXT
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const patientMonitor = attachErrorMonitor(patientPage);

    await patientPage.goto('/?view=patient');

    // Clear selection and select strictly ECG (2026) and 2D Echocardiogram (2026)
    await patientPage.getByTestId('clear-selection-btn').click();
    await patientPage.getByTestId('record-card-rec-ecg-01').click();
    await patientPage.getByTestId('record-card-rec-echo-03').click();

    // Create Access
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('ECG Report');
    await expect(patientPage.getByTestId('selected-records-chips')).toContainText('2D Echocardiogram');
    await expect(patientPage.getByTestId('selected-records-chips')).not.toContainText('Lipid Profile');

    // Generate QR
    await patientPage.getByTestId('generate-qr-access-btn').click();
    const sessionCode = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    // DOCTOR CONTEXT (Completely separate browser context)
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    const doctorMonitor = attachErrorMonitor(doctorPage);

    await doctorPage.goto(`/?session=${sessionCode}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();

    // 1. Doctor receives ONLY the 2 authorized records
    await expect(doctorPage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-echo-03')).toBeVisible();

    // 2. Unselected records MUST NOT be visible
    await expect(doctorPage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-presc-04')).not.toBeVisible();
    await expect(doctorPage.getByTestId('doctor-record-card-rec-rm-ecg-2021')).not.toBeVisible();

    // 3. Withheld records badge indicates withheld records
    await expect(doctorPage.getByTestId('withheld-records-badge')).toBeVisible();
    await expect(doctorPage.getByTestId('withheld-records-badge')).toContainText('10 withheld');

    // 4. AI Clinical Insights Panel displays insights with explicit source traceability
    await expect(doctorPage.getByTestId('doctor-ai-insights-panel')).toBeVisible();
    await expect(doctorPage.getByTestId('ai-insight-item-0')).toBeVisible();
    // Sources must be rendered for the insight
    await expect(doctorPage.getByTestId('ai-insight-sources-0')).toBeVisible();
    await expect(doctorPage.getByTestId('ai-insight-sources-0')).toContainText('ECG Report');

    patientMonitor.verifyNoErrors();
    doctorMonitor.verifyNoErrors();
  });
});

import { MedicalRecord } from '../types/index';
import { DEMO_RECORDS } from './demoData';

export const CLINICAL_RECORDS_CATALOG: Record<string, MedicalRecord> = {};

DEMO_RECORDS.forEach((rec) => {
  CLINICAL_RECORDS_CATALOG[rec.id] = rec;
});

export interface AiInsight {
  type: string;
  title: string;
  summary: string;
  severity: 'routine' | 'moderate' | 'elevated';
  sources: string[];
}

export function generateAiInsightsForRecords(recordIds: string[]): AiInsight[] {
  const ids = new Set(recordIds || []);
  const insights: AiInsight[] = [];

  // 1. Rahul Mehta: Longitudinal Lipid Trend
  if ((ids.has('rec-rm-lipid-2021') || ids.has('rec-rm-lipid-2022')) && ids.has('rec-lipid-02')) {
    const baselineYear = ids.has('rec-rm-lipid-2021') ? '2021' : '2022';
    const baselineVal = ids.has('rec-rm-lipid-2021') ? '118 mg/dL' : '126 mg/dL';
    const sourceList = ids.has('rec-rm-lipid-2021')
      ? ['Lipid Profile (Baseline) — May 2021', 'Lipid Profile (Comprehensive) — Feb 2026']
      : ['Lipid Profile (Follow-up) — Nov 2022', 'Lipid Profile (Comprehensive) — Feb 2026'];

    insights.push({
      type: 'lipid_longitudinal_trend',
      title: `Longitudinal Lipid Progression (${baselineYear} → 2026)`,
      summary: `LDL cholesterol has progressively increased from ${baselineVal} in ${baselineYear} to 142 mg/dL in 2026, and Total Cholesterol from sub-200 to 218 mg/dL, indicating escalating atherogenic risk requiring statin titration.`,
      severity: 'moderate',
      sources: sourceList
    });
  } else if (ids.has('rec-lipid-02')) {
    insights.push({
      type: 'lipid_risk',
      title: 'Atherogenic Dyslipidemia Confirmed',
      summary: 'Elevated LDL cholesterol (142 mg/dL) and Total Cholesterol (218 mg/dL) indicate primary hypercholesterolemia requiring statin adherence.',
      severity: 'moderate',
      sources: ['Lipid Profile (Comprehensive) — Feb 2026']
    });
  }

  // 2. Rahul Mehta: Longitudinal Cardiac Rhythm Stability
  const selectedEcgs: string[] = [];
  if (ids.has('rec-rm-ecg-2021')) selectedEcgs.push('12-Lead ECG — 2021');
  if (ids.has('rec-rm-ecg-2022')) selectedEcgs.push('12-Lead ECG — 2022');
  if (ids.has('rec-ecg-01')) selectedEcgs.push('ECG Report (12-Lead) — 2025/2026');

  if (selectedEcgs.length >= 2) {
    insights.push({
      type: 'rhythm_longitudinal',
      title: 'Longitudinal Cardiac Rhythm Stability',
      summary: `Sinus rhythm consistently maintained across multiple surveillance recordings (72 bpm in 2021 → 74 bpm in 2022 → 78 bpm current) with stable PR interval (~146 ms) and no conduction defects.`,
      severity: 'routine',
      sources: selectedEcgs
    });
  } else if (ids.has('rec-ecg-01')) {
    insights.push({
      type: 'rhythm_analysis',
      title: 'Normal Resting Sinus Rhythm Confirmed',
      summary: '12-lead ECG demonstrates regular sinus rhythm at 78 bpm. Normal PR (148 ms) and QTc (412 ms) intervals with no acute ST-T elevation.',
      severity: 'routine',
      sources: ['ECG Report (12-Lead) — Aug 2025']
    });
  }

  // 3. Rahul Mehta: Left Ventricular Structural Imaging
  if (ids.has('rec-echo-03') || ids.has('rec-rm-echo-2024')) {
    const echoSources: string[] = [];
    if (ids.has('rec-rm-echo-2024')) echoSources.push('2D Echocardiogram — Aug 2024');
    if (ids.has('rec-echo-03')) echoSources.push('2D Echocardiogram — Mar 2026');

    insights.push({
      type: 'structural_imaging',
      title: 'Preserved LV Systolic Function',
      summary: 'Transthoracic echocardiogram confirms preserved left ventricular ejection fraction (58-60%) with normal chamber dimensions (LVIDd: 4.6 cm) and no regional wall motion abnormalities.',
      severity: 'routine',
      sources: echoSources
    });
  }

  // 4. Rahul Mehta: Blood Pressure & Troponin
  if (ids.has('rec-rm-bp-2026')) {
    insights.push({
      type: 'vascular_bp',
      title: 'Stage 1 Borderline Hypertension',
      summary: 'Resting ambulatory blood pressure of 138/88 mmHg demonstrates borderline elevation above optimal target (< 120/80 mmHg), supporting prescribed antihypertensive coverage.',
      severity: 'moderate',
      sources: ['Blood Pressure Record — Jun 2026']
    });
  }

  if (ids.has('rec-rm-trop-2026')) {
    insights.push({
      type: 'cardiac_biomarker',
      title: 'Negative Troponin Assay (Rule-Out ACS)',
      summary: 'High-sensitivity Troponin I (< 0.01 ng/mL) and CK-MB (1.8 ng/mL) within biological reference range, confirming absence of acute myocardial cellular necrosis.',
      severity: 'routine',
      sources: ['Cardiac Biomarker / Troponin I — Jun 2026']
    });
  }

  // 5. Arjun Desai: Longitudinal Glycemic Trajectory (HbA1c)
  const selectedHba1c: string[] = [];
  if (ids.has('rec-ad-hba1c-2022')) selectedHba1c.push('HbA1c — Jan 2022 (6.8%)');
  if (ids.has('rec-ad-hba1c-2024')) selectedHba1c.push('HbA1c — Sep 2024 (7.4%)');
  if (ids.has('rec-ad-hba1c-2026')) selectedHba1c.push('HbA1c — Jan 2026 (7.9%)');

  if (selectedHba1c.length >= 2) {
    insights.push({
      type: 'glycemic_trajectory',
      title: 'Longitudinal Glycemic Trajectory (3-Year Worsening)',
      summary: 'Continuous glycemic escape demonstrated by progressive HbA1c rise: 6.8% (2022) → 7.4% (2024) → 7.9% (2026), validating therapeutic intensification to dual oral antidiabetic therapy.',
      severity: 'elevated',
      sources: selectedHba1c
    });
  } else if (ids.has('rec-ad-hba1c-2026')) {
    insights.push({
      type: 'glycemic_control',
      title: 'Elevated HbA1c (Suboptimal Glycemic Target)',
      summary: 'HbA1c at 7.9% reflects elevated mean plasma glucose (~180 mg/dL) over previous 90 days, warranting therapy intensification.',
      severity: 'elevated',
      sources: ['HbA1c Glycated Hemoglobin — Jan 2026']
    });
  }

  // 6. Arjun Desai: Glucose Excursion
  if (ids.has('rec-ad-fbg-2026') || ids.has('rec-ad-ppbg-2026')) {
    const glucSources: string[] = [];
    if (ids.has('rec-ad-fbg-2026')) glucSources.push('Fasting Blood Glucose — Jan 2026');
    if (ids.has('rec-ad-ppbg-2026')) glucSources.push('Postprandial Blood Glucose — Jan 2026');

    insights.push({
      type: 'acute_glycemia',
      title: 'Marked Fasting & Postprandial Hyperglycemia',
      summary: 'Fasting glucose of 152 mg/dL and 2-hour postprandial peak of 218 mg/dL indicate substantial glucose excursion and hepatic insulin resistance.',
      severity: 'elevated',
      sources: glucSources
    });
  }

  // 7. Arjun Desai: Diabetic Dyslipidemia
  if (ids.has('rec-ad-lipid-2026') || ids.has('rec-ad-lipid-2024')) {
    insights.push({
      type: 'diabetic_dyslipidemia',
      title: 'Diabetic Atherogenic Dyslipidemia',
      summary: 'Marked mixed dyslipidemia with elevated LDL (156 mg/dL) and hypertriglyceridemia (210 mg/dL) typical in metabolic syndrome, increasing ASCVD risk.',
      severity: 'elevated',
      sources: [ids.has('rec-ad-lipid-2026') ? 'Lipid Profile — Jan 2026' : 'Lipid Profile — Sep 2024']
    });
  }

  // 8. Aisha Kulkarni: Hematology & Hepatorenal
  if (ids.has('rec-ak-cbc-2026') || ids.has('rec-ak-cbc-2023')) {
    insights.push({
      type: 'hematology',
      title: 'Stable Hematologic Indices',
      summary: 'Hemoglobin (13.2 g/dL), leukocyte count (7,100 /mcL), and platelets (265,000 /mcL) within pristine physiological limits with no cytopenias.',
      severity: 'routine',
      sources: [ids.has('rec-ak-cbc-2026') ? 'Complete Blood Count (CBC) — Feb 2026' : 'Complete Blood Count — Mar 2023']
    });
  }

  if (ids.has('rec-ak-lft-2026') && ids.has('rec-ak-kft-2026')) {
    insights.push({
      type: 'hepatorenal',
      title: 'Preserved Hepatorenal Clearance',
      summary: 'Hepatic transaminases (AST 22, ALT 25 U/L) and renal parameters (Serum Creatinine 0.85 mg/dL, eGFR > 90 mL/min) demonstrate excellent organ function.',
      severity: 'routine',
      sources: ['Liver Function Test — Feb 2026', 'Kidney Function Test — Feb 2026']
    });
  }

  // 9. Prescription Guidance
  if (ids.has('rec-presc-04') || ids.has('rec-ad-presc-2026') || ids.has('rec-ak-presc-2026')) {
    const rxRecord = ids.has('rec-presc-04')
      ? 'Cardiology Prescription — Mar 2026'
      : ids.has('rec-ad-presc-2026')
      ? 'Diabetes Prescription — Jan 2026'
      : 'General Wellness Prescription — Feb 2026';

    insights.push({
      type: 'pharmacotherapy',
      title: 'Active Prescribed Pharmacotherapy',
      summary: 'Active prescription matches clinical findings and established guideline-directed medical therapy.',
      severity: 'routine',
      sources: [rxRecord]
    });
  }

  return insights;
}

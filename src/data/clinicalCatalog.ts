import { MedicalRecord } from '../types/index';
import { DEMO_RECORDS } from './demoData';

export const CLINICAL_RECORDS_CATALOG: Record<string, MedicalRecord> = {};

DEMO_RECORDS.forEach((rec) => {
  CLINICAL_RECORDS_CATALOG[rec.id] = rec;
});

export interface InsightSource {
  text: string;
  sourceRecordId: string;
  sourceLabel: string;
  sourceDate: string;
}

export interface AiInsight {
  type: string;
  title: string;
  summary: string;
  severity: 'routine' | 'moderate' | 'elevated';
  sources: InsightSource[];
}

export function generateAiInsightsForRecords(recordIds: string[]): AiInsight[] {
  const ids = new Set(recordIds || []);
  const insights: AiInsight[] = [];

  // 1. Rahul Mehta: Longitudinal Lipid Trend
  if ((ids.has('rec-rm-lipid-2021') || ids.has('rec-rm-lipid-2022')) && ids.has('rec-lipid-02')) {
    const baselineYear = ids.has('rec-rm-lipid-2021') ? '2021' : '2022';
    const baselineVal = ids.has('rec-rm-lipid-2021') ? '118 mg/dL' : '126 mg/dL';
    const sourceList: InsightSource[] = ids.has('rec-rm-lipid-2021')
      ? [
          { text: 'Baseline recorded', sourceRecordId: 'rec-rm-lipid-2021', sourceLabel: 'Lipid Profile (Baseline)', sourceDate: 'May 2021' },
          { text: 'Current record', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: 'Feb 2026' }
        ]
      : [
          { text: 'Baseline recorded', sourceRecordId: 'rec-rm-lipid-2022', sourceLabel: 'Lipid Profile (Follow-up)', sourceDate: 'Nov 2022' },
          { text: 'Current record', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: 'Feb 2026' }
        ];

    insights.push({
      type: 'lipid_longitudinal_trend',
      title: 'LONGITUDINAL CHANGES: Lipid Profile',
      summary: `The selected records document LDL Cholesterol values of ${baselineVal} in ${baselineYear} and 142 mg/dL in 2026, and Total Cholesterol of sub-200 in ${baselineYear} and 218 mg/dL in 2026.`,
      severity: 'moderate',
      sources: sourceList
    });
  } else if (ids.has('rec-lipid-02')) {
    insights.push({
      type: 'lipid_risk',
      title: 'DOCUMENTED VALUES: Lipid Profile',
      summary: 'LDL Cholesterol is documented as 142 mg/dL and Total Cholesterol as 218 mg/dL in the shared Lipid Profile.',
      severity: 'moderate',
      sources: [{ text: 'Current record', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: 'Feb 2026' }]
    });
  }

  // 2. Rahul Mehta: Longitudinal Cardiac Rhythm Stability
  const selectedEcgs: InsightSource[] = [];
  if (ids.has('rec-rm-ecg-2021')) selectedEcgs.push({ text: '2021 recording', sourceRecordId: 'rec-rm-ecg-2021', sourceLabel: '12-Lead ECG', sourceDate: '2021' });
  if (ids.has('rec-rm-ecg-2022')) selectedEcgs.push({ text: '2022 recording', sourceRecordId: 'rec-rm-ecg-2022', sourceLabel: '12-Lead ECG', sourceDate: '2022' });
  if (ids.has('rec-ecg-01')) selectedEcgs.push({ text: 'Current recording', sourceRecordId: 'rec-ecg-01', sourceLabel: 'ECG Report (12-Lead)', sourceDate: '2025/2026' });

  if (selectedEcgs.length >= 2) {
    insights.push({
      type: 'rhythm_longitudinal',
      title: 'RECORDED OBSERVATIONS: Cardiac Rhythm',
      summary: `The records show heart rates of 72 bpm in 2021, 74 bpm in 2022, and 78 bpm current, with PR intervals documented around 146 ms.`,
      severity: 'routine',
      sources: selectedEcgs
    });
  } else if (ids.has('rec-ecg-01')) {
    insights.push({
      type: 'rhythm_analysis',
      title: 'DOCUMENTED FINDINGS: Resting Rhythm',
      summary: 'The shared 12-lead ECG notes a heart rate of 78 bpm, PR interval of 148 ms, and QTc of 412 ms.',
      severity: 'routine',
      sources: [{ text: 'Current recording', sourceRecordId: 'rec-ecg-01', sourceLabel: 'ECG Report (12-Lead)', sourceDate: 'Aug 2025' }]
    });
  }

  // 3. Rahul Mehta: Left Ventricular Structural Imaging
  if (ids.has('rec-echo-03') || ids.has('rec-rm-echo-2024')) {
    const echoSources: InsightSource[] = [];
    if (ids.has('rec-rm-echo-2024')) echoSources.push({ text: '2024 Echo', sourceRecordId: 'rec-rm-echo-2024', sourceLabel: '2D Echocardiogram', sourceDate: 'Aug 2024' });
    if (ids.has('rec-echo-03')) echoSources.push({ text: 'Current Echo', sourceRecordId: 'rec-echo-03', sourceLabel: '2D Echocardiogram', sourceDate: 'Mar 2026' });

    insights.push({
      type: 'structural_imaging',
      title: 'DOCUMENTED VALUES: LV Systolic Function',
      summary: 'The echocardiogram reports document left ventricular ejection fractions of 58-60% and LVIDd of 4.6 cm.',
      severity: 'routine',
      sources: echoSources
    });
  }

  // 4. Rahul Mehta: Blood Pressure & Troponin
  if (ids.has('rec-rm-bp-2026')) {
    insights.push({
      type: 'vascular_bp',
      title: 'DOCUMENTED VALUES: Blood Pressure',
      summary: 'Blood Pressure is documented as 138/88 mmHg in the shared Blood Pressure Record.',
      severity: 'moderate',
      sources: [{ text: 'Blood Pressure Log', sourceRecordId: 'rec-rm-bp-2026', sourceLabel: 'Blood Pressure Record', sourceDate: 'Jun 2026' }]
    });
  }

  if (ids.has('rec-rm-trop-2026')) {
    insights.push({
      type: 'cardiac_biomarker',
      title: 'DOCUMENTED VALUES: Troponin Assay',
      summary: 'High-sensitivity Troponin I is documented as < 0.01 ng/mL and CK-MB as 1.8 ng/mL in the shared report.',
      severity: 'routine',
      sources: [{ text: 'Lab Report', sourceRecordId: 'rec-rm-trop-2026', sourceLabel: 'Cardiac Biomarker / Troponin I', sourceDate: 'Jun 2026' }]
    });
  }

  // 5. Arjun Desai: Longitudinal Glycemic Trajectory (HbA1c)
  const selectedHba1c: InsightSource[] = [];
  if (ids.has('rec-ad-hba1c-2022')) selectedHba1c.push({ text: '2022 Result', sourceRecordId: 'rec-ad-hba1c-2022', sourceLabel: 'HbA1c', sourceDate: 'Jan 2022 (6.8%)' });
  if (ids.has('rec-ad-hba1c-2024')) selectedHba1c.push({ text: '2024 Result', sourceRecordId: 'rec-ad-hba1c-2024', sourceLabel: 'HbA1c', sourceDate: 'Sep 2024 (7.4%)' });
  if (ids.has('rec-ad-hba1c-2026')) selectedHba1c.push({ text: '2026 Result', sourceRecordId: 'rec-ad-hba1c-2026', sourceLabel: 'HbA1c', sourceDate: 'Jan 2026 (7.9%)' });

  if (selectedHba1c.length >= 2) {
    insights.push({
      type: 'glycemic_trajectory',
      title: 'LONGITUDINAL CHANGES: Glycemic Records',
      summary: 'The selected records document HbA1c values of 6.8% (2022), 7.4% (2024), and 7.9% (2026).',
      severity: 'elevated',
      sources: selectedHba1c
    });
  } else if (ids.has('rec-ad-hba1c-2026')) {
    insights.push({
      type: 'glycemic_control',
      title: 'DOCUMENTED VALUES: HbA1c',
      summary: 'HbA1c is documented at 7.9% in the shared report.',
      severity: 'elevated',
      sources: [{ text: 'Lab Report', sourceRecordId: 'rec-ad-hba1c-2026', sourceLabel: 'HbA1c Glycated Hemoglobin', sourceDate: 'Jan 2026' }]
    });
  }

  // 6. Arjun Desai: Glucose Excursion
  if (ids.has('rec-ad-fbg-2026') || ids.has('rec-ad-ppbg-2026')) {
    const glucSources: InsightSource[] = [];
    if (ids.has('rec-ad-fbg-2026')) glucSources.push({ text: 'Fasting Result', sourceRecordId: 'rec-ad-fbg-2026', sourceLabel: 'Fasting Blood Glucose', sourceDate: 'Jan 2026' });
    if (ids.has('rec-ad-ppbg-2026')) glucSources.push({ text: 'Postprandial Result', sourceRecordId: 'rec-ad-ppbg-2026', sourceLabel: 'Postprandial Blood Glucose', sourceDate: 'Jan 2026' });

    insights.push({
      type: 'acute_glycemia',
      title: 'DOCUMENTED VALUES: Fasting & Postprandial Glucose',
      summary: 'Fasting glucose is documented as 152 mg/dL and 2-hour postprandial glucose is documented as 218 mg/dL.',
      severity: 'elevated',
      sources: glucSources
    });
  }

  // 7. Arjun Desai: Diabetic Dyslipidemia
  if (ids.has('rec-ad-lipid-2026') || ids.has('rec-ad-lipid-2024')) {
    const sourceRecordId = ids.has('rec-ad-lipid-2026') ? 'rec-ad-lipid-2026' : 'rec-ad-lipid-2024';
    const sourceLabel = ids.has('rec-ad-lipid-2026') ? 'Lipid Profile' : 'Lipid Profile';
    const sourceDate = ids.has('rec-ad-lipid-2026') ? 'Jan 2026' : 'Sep 2024';
    insights.push({
      type: 'diabetic_dyslipidemia',
      title: 'DOCUMENTED VALUES: Dyslipidemia Markers',
      summary: 'The shared Lipid Profile documents LDL at 156 mg/dL and Triglycerides at 210 mg/dL.',
      severity: 'elevated',
      sources: [{ text: 'Lab Report', sourceRecordId, sourceLabel, sourceDate }]
    });
  }

  // 8. Aisha Kulkarni: Hematology & Hepatorenal
  if (ids.has('rec-ak-cbc-2026') || ids.has('rec-ak-cbc-2023')) {
    const sourceRecordId = ids.has('rec-ak-cbc-2026') ? 'rec-ak-cbc-2026' : 'rec-ak-cbc-2023';
    const sourceLabel = ids.has('rec-ak-cbc-2026') ? 'Complete Blood Count (CBC)' : 'Complete Blood Count';
    const sourceDate = ids.has('rec-ak-cbc-2026') ? 'Feb 2026' : 'Mar 2023';
    insights.push({
      type: 'hematology',
      title: 'DOCUMENTED VALUES: Hematologic Indices',
      summary: 'Hemoglobin is recorded at 13.2 g/dL, leukocyte count at 7,100 /mcL, and platelets at 265,000 /mcL.',
      severity: 'routine',
      sources: [{ text: 'Lab Report', sourceRecordId, sourceLabel, sourceDate }]
    });
  }

  if (ids.has('rec-ak-lft-2026') && ids.has('rec-ak-kft-2026')) {
    insights.push({
      type: 'hepatorenal',
      title: 'DOCUMENTED VALUES: Hepatorenal Clearance',
      summary: 'Hepatic transaminases (AST 22, ALT 25 U/L) and renal parameters (Serum Creatinine 0.85 mg/dL, eGFR > 90 mL/min) are documented in the shared records.',
      severity: 'routine',
      sources: [
        { text: 'Liver function', sourceRecordId: 'rec-ak-lft-2026', sourceLabel: 'Liver Function Test', sourceDate: 'Feb 2026' },
        { text: 'Kidney function', sourceRecordId: 'rec-ak-kft-2026', sourceLabel: 'Kidney Function Test', sourceDate: 'Feb 2026' }
      ]
    });
  }

  // 9. Prescription Guidance
  if (ids.has('rec-presc-04') || ids.has('rec-ad-presc-2026') || ids.has('rec-ak-presc-2026')) {
    const rxRecord = ids.has('rec-presc-04')
      ? 'rec-presc-04'
      : ids.has('rec-ad-presc-2026')
      ? 'rec-ad-presc-2026'
      : 'rec-ak-presc-2026';
    const sourceLabel = ids.has('rec-presc-04')
      ? 'Cardiology Prescription'
      : ids.has('rec-ad-presc-2026')
      ? 'Diabetes Prescription'
      : 'General Wellness Prescription';

    insights.push({
      type: 'pharmacotherapy',
      title: 'SOURCE RECORDS: Shared Prescription',
      summary: 'A prescription record is included in the shared session.',
      severity: 'routine',
      sources: [{ text: 'Prescription Record', sourceRecordId: rxRecord, sourceLabel, sourceDate: '2026' }]
    });
  }

  return insights;
}

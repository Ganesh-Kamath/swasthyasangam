import { MedicalRecord } from '../types/index';
import { DEMO_RECORDS } from './demoData';

export const CLINICAL_RECORDS_CATALOG: Record<string, MedicalRecord> = {};

DEMO_RECORDS.forEach((rec) => {
  CLINICAL_RECORDS_CATALOG[rec.id] = rec;
});

export type InsightCategory =
  | 'DOCUMENTED VALUE'
  | 'LONGITUDINAL INFORMATION'
  | 'RECORDED OBSERVATION'
  | 'RECORD RELATIONSHIP'
  | 'SOURCE RECORD';

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
  category: InsightCategory;
  severity?: 'routine' | 'moderate' | 'elevated';
  sources: InsightSource[];
}

export function generateAiInsightsForRecords(recordIds: string[]): AiInsight[] {
  const ids = new Set(recordIds || []);
  const insights: AiInsight[] = [];

  // 1. Rahul Mehta: Lipid Profile (Longitudinal or Single Documented Values)
  if ((ids.has('rec-rm-lipid-2021') || ids.has('rec-rm-lipid-2022')) && ids.has('rec-lipid-02')) {
    const has2021 = ids.has('rec-rm-lipid-2021');
    const has2022 = ids.has('rec-rm-lipid-2022');
    const sourceList: InsightSource[] = [];

    let trendLdl = '';
    let trendTc = '';

    if (has2021 && has2022) {
      trendLdl = '118 mg/dL (May 2021) → 126 mg/dL (Nov 2022) → 142 mg/dL (Feb 2026)';
      trendTc = '198 mg/dL (2021) → 206 mg/dL (2022) → 218 mg/dL (2026)';
      sourceList.push(
        { text: 'Baseline report', sourceRecordId: 'rec-rm-lipid-2021', sourceLabel: 'Lipid Profile (Baseline)', sourceDate: '14 May 2021' },
        { text: 'Follow-up report', sourceRecordId: 'rec-rm-lipid-2022', sourceLabel: 'Lipid Profile (Follow-up)', sourceDate: '10 Nov 2022' },
        { text: 'Current report', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: '21 Feb 2026' }
      );
    } else if (has2021) {
      trendLdl = '118 mg/dL (May 2021) → 142 mg/dL (Feb 2026)';
      trendTc = '198 mg/dL (2021) → 218 mg/dL (2026)';
      sourceList.push(
        { text: 'Baseline report', sourceRecordId: 'rec-rm-lipid-2021', sourceLabel: 'Lipid Profile (Baseline)', sourceDate: '14 May 2021' },
        { text: 'Current report', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: '21 Feb 2026' }
      );
    } else {
      trendLdl = '126 mg/dL (Nov 2022) → 142 mg/dL (Feb 2026)';
      trendTc = '206 mg/dL (2022) → 218 mg/dL (2026)';
      sourceList.push(
        { text: 'Follow-up report', sourceRecordId: 'rec-rm-lipid-2022', sourceLabel: 'Lipid Profile (Follow-up)', sourceDate: '10 Nov 2022' },
        { text: 'Current report', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: '21 Feb 2026' }
      );
    }

    insights.push({
      type: 'lipid_longitudinal',
      title: 'LONGITUDINAL INFORMATION: Lipid Profile',
      summary: `LDL values documented across available records: ${trendLdl}. Total Cholesterol values: ${trendTc}.`,
      category: 'LONGITUDINAL INFORMATION',
      sources: sourceList
    });
  } else if (ids.has('rec-lipid-02')) {
    insights.push({
      type: 'lipid_values',
      title: 'DOCUMENTED VALUE: Lipid Panel',
      summary: 'LDL Cholesterol: 142 mg/dL • Total Cholesterol: 218 mg/dL • Triglycerides: 161 mg/dL • HDL: 44 mg/dL.',
      category: 'DOCUMENTED VALUE',
      sources: [
        { text: 'Laboratory report', sourceRecordId: 'rec-lipid-02', sourceLabel: 'Lipid Profile (Comprehensive)', sourceDate: '21 Feb 2026' }
      ]
    });
  }

  // 2. Rahul Mehta: Cardiac Rhythm (12-Lead ECG)
  const selectedEcgs: InsightSource[] = [];
  if (ids.has('rec-rm-ecg-2021')) selectedEcgs.push({ text: '2021 Baseline', sourceRecordId: 'rec-rm-ecg-2021', sourceLabel: '12-Lead ECG (Baseline)', sourceDate: '14 May 2021' });
  if (ids.has('rec-rm-ecg-2022')) selectedEcgs.push({ text: '2022 Review', sourceRecordId: 'rec-rm-ecg-2022', sourceLabel: '12-Lead ECG (Annual Review)', sourceDate: '10 Nov 2022' });
  if (ids.has('rec-ecg-01')) selectedEcgs.push({ text: 'Current ECG', sourceRecordId: 'rec-ecg-01', sourceLabel: 'ECG Report (12-Lead)', sourceDate: '12 Aug 2025' });

  if (selectedEcgs.length >= 2) {
    const hrValues = selectedEcgs.map((e) => {
      if (e.sourceRecordId === 'rec-rm-ecg-2021') return '72 bpm (2021)';
      if (e.sourceRecordId === 'rec-rm-ecg-2022') return '74 bpm (2022)';
      return '78 bpm (2025)';
    }).join(' → ');

    insights.push({
      type: 'rhythm_longitudinal',
      title: 'LONGITUDINAL INFORMATION: Resting Heart Rate & Rhythm',
      summary: `Sinus rhythm is documented across recordings. Heart rate values: ${hrValues}. PR interval range: 144 - 148 ms.`,
      category: 'LONGITUDINAL INFORMATION',
      sources: selectedEcgs
    });
  } else if (ids.has('rec-ecg-01')) {
    insights.push({
      type: 'rhythm_observation',
      title: 'RECORDED OBSERVATION: Resting Rhythm',
      summary: 'Sinus rhythm is documented in the ECG report. Heart rate: 78 bpm, PR interval: 148 ms, QTc: 412 ms.',
      category: 'RECORDED OBSERVATION',
      sources: [
        { text: 'Electrocardiogram', sourceRecordId: 'rec-ecg-01', sourceLabel: 'ECG Report (12-Lead)', sourceDate: '12 Aug 2025' }
      ]
    });
  }

  // 3. Rahul Mehta: 2D Echocardiogram
  if (ids.has('rec-echo-03') || ids.has('rec-rm-echo-2024')) {
    const echoSources: InsightSource[] = [];
    if (ids.has('rec-rm-echo-2024')) echoSources.push({ text: '2024 Study', sourceRecordId: 'rec-rm-echo-2024', sourceLabel: '2D Echocardiogram & Doppler', sourceDate: '18 Aug 2024' });
    if (ids.has('rec-echo-03')) echoSources.push({ text: 'Current Study', sourceRecordId: 'rec-echo-03', sourceLabel: '2D Echocardiogram', sourceDate: '05 Mar 2026' });

    if (echoSources.length >= 2) {
      insights.push({
        type: 'echo_longitudinal',
        title: 'LONGITUDINAL INFORMATION: Left Ventricular Ejection Fraction',
        summary: 'Left Ventricular Ejection Fraction documented across available studies: 60% (18 Aug 2024) → 58% (05 Mar 2026). LVIDd: 4.5 cm → 4.6 cm.',
        category: 'LONGITUDINAL INFORMATION',
        sources: echoSources
      });
    } else {
      const isCurrent = ids.has('rec-echo-03');
      const ef = isCurrent ? '58%' : '60%';
      const lvidd = isCurrent ? '4.6 cm' : '4.5 cm';
      insights.push({
        type: 'echo_values',
        title: 'DOCUMENTED VALUE: 2D Echocardiogram',
        summary: `Left Ventricular Ejection Fraction: ${ef} • LVIDd: ${lvidd} documented in the echocardiogram report.`,
        category: 'DOCUMENTED VALUE',
        sources: echoSources
      });
    }
  }

  // 4. Rahul Mehta: Blood Pressure & Troponin
  if (ids.has('rec-rm-bp-2026')) {
    insights.push({
      type: 'bp_values',
      title: 'DOCUMENTED VALUE: Blood Pressure',
      summary: 'Blood Pressure: 138/88 mmHg documented in Blood Pressure Record.',
      category: 'DOCUMENTED VALUE',
      sources: [
        { text: 'Blood pressure log', sourceRecordId: 'rec-rm-bp-2026', sourceLabel: 'Blood Pressure Record', sourceDate: '10 Jun 2026' }
      ]
    });
  }

  if (ids.has('rec-rm-trop-2026')) {
    insights.push({
      type: 'troponin_values',
      title: 'DOCUMENTED VALUE: Cardiac Biomarkers',
      summary: 'High-sensitivity Troponin I: < 0.01 ng/mL • CK-MB: 1.8 ng/mL documented in laboratory report.',
      category: 'DOCUMENTED VALUE',
      sources: [
        { text: 'Laboratory assay', sourceRecordId: 'rec-rm-trop-2026', sourceLabel: 'Cardiac Biomarker / Troponin I', sourceDate: '10 Jun 2026' }
      ]
    });
  }

  // 5. Arjun Desai: Longitudinal Glycemic Trajectory (HbA1c)
  const selectedHba1c: InsightSource[] = [];
  if (ids.has('rec-ad-hba1c-2022')) selectedHba1c.push({ text: '2022 Result', sourceRecordId: 'rec-ad-hba1c-2022', sourceLabel: 'HbA1c Glycated Hemoglobin', sourceDate: '15 Jan 2022' });
  if (ids.has('rec-ad-hba1c-2024')) selectedHba1c.push({ text: '2024 Result', sourceRecordId: 'rec-ad-hba1c-2024', sourceLabel: 'HbA1c Glycated Hemoglobin', sourceDate: '20 Sep 2024' });
  if (ids.has('rec-ad-hba1c-2026')) selectedHba1c.push({ text: '2026 Result', sourceRecordId: 'rec-ad-hba1c-2026', sourceLabel: 'HbA1c Glycated Hemoglobin', sourceDate: '18 Jan 2026' });

  if (selectedHba1c.length >= 2) {
    insights.push({
      type: 'hba1c_longitudinal',
      title: 'LONGITUDINAL INFORMATION: HbA1c Values',
      summary: 'HbA1c values documented across available records: 6.8% (Jan 2022) → 7.4% (Sep 2024) → 7.9% (Jan 2026).',
      category: 'LONGITUDINAL INFORMATION',
      sources: selectedHba1c
    });
  } else if (ids.has('rec-ad-hba1c-2026')) {
    insights.push({
      type: 'hba1c_values',
      title: 'DOCUMENTED VALUE: HbA1c',
      summary: 'HbA1c: 7.9% documented in laboratory report.',
      category: 'DOCUMENTED VALUE',
      sources: [
        { text: 'Laboratory report', sourceRecordId: 'rec-ad-hba1c-2026', sourceLabel: 'HbA1c Glycated Hemoglobin', sourceDate: '18 Jan 2026' }
      ]
    });
  }

  // 6. Arjun Desai: Blood Glucose Values
  if (ids.has('rec-ad-fbg-2026') || ids.has('rec-ad-ppbg-2026')) {
    const glucSources: InsightSource[] = [];
    if (ids.has('rec-ad-fbg-2026')) glucSources.push({ text: 'Fasting Result', sourceRecordId: 'rec-ad-fbg-2026', sourceLabel: 'Fasting Blood Glucose', sourceDate: '18 Jan 2026' });
    if (ids.has('rec-ad-ppbg-2026')) glucSources.push({ text: 'Postprandial Result', sourceRecordId: 'rec-ad-ppbg-2026', sourceLabel: 'Postprandial Blood Glucose', sourceDate: '18 Jan 2026' });

    insights.push({
      type: 'glucose_values',
      title: 'DOCUMENTED VALUE: Blood Glucose Values',
      summary: 'Fasting Blood Glucose: 152 mg/dL • 2-Hour Postprandial Blood Glucose: 218 mg/dL.',
      category: 'DOCUMENTED VALUE',
      sources: glucSources
    });
  }

  // 7. Arjun Desai: Lipid Profile
  if (ids.has('rec-ad-lipid-2026') || ids.has('rec-ad-lipid-2024')) {
    const sourceRecordId = ids.has('rec-ad-lipid-2026') ? 'rec-ad-lipid-2026' : 'rec-ad-lipid-2024';
    const sourceLabel = 'Lipid Profile';
    const sourceDate = ids.has('rec-ad-lipid-2026') ? '18 Jan 2026' : '20 Sep 2024';
    insights.push({
      type: 'ad_lipid_values',
      title: 'DOCUMENTED VALUE: Lipid Profile',
      summary: 'LDL Cholesterol: 156 mg/dL • Triglycerides: 210 mg/dL documented in Lipid Profile.',
      category: 'DOCUMENTED VALUE',
      sources: [{ text: 'Laboratory report', sourceRecordId, sourceLabel, sourceDate }]
    });
  }

  // 8. Aisha Kulkarni: Hematology & Hepatorenal
  if (ids.has('rec-ak-cbc-2026') || ids.has('rec-ak-cbc-2023')) {
    const sourceRecordId = ids.has('rec-ak-cbc-2026') ? 'rec-ak-cbc-2026' : 'rec-ak-cbc-2023';
    const sourceLabel = 'Complete Blood Count (CBC)';
    const sourceDate = ids.has('rec-ak-cbc-2026') ? '10 Feb 2026' : '12 Mar 2023';
    insights.push({
      type: 'cbc_values',
      title: 'DOCUMENTED VALUE: Complete Blood Count',
      summary: 'Hemoglobin: 13.2 g/dL • Total Leukocyte Count: 7,100 /mcL • Platelet Count: 265,000 /mcL.',
      category: 'DOCUMENTED VALUE',
      sources: [{ text: 'Laboratory report', sourceRecordId, sourceLabel, sourceDate }]
    });
  }

  if (ids.has('rec-ak-lft-2026') && ids.has('rec-ak-kft-2026')) {
    insights.push({
      type: 'lft_kft_values',
      title: 'RECORD RELATIONSHIP: Hepatic & Renal Panels',
      summary: 'Liver Function Test: AST 22 U/L, ALT 25 U/L • Kidney Function Test: Serum Creatinine 0.85 mg/dL, eGFR > 90 mL/min.',
      category: 'RECORD RELATIONSHIP',
      sources: [
        { text: 'Liver function', sourceRecordId: 'rec-ak-lft-2026', sourceLabel: 'Liver Function Test', sourceDate: '10 Feb 2026' },
        { text: 'Kidney function', sourceRecordId: 'rec-ak-kft-2026', sourceLabel: 'Kidney Function Test', sourceDate: '10 Feb 2026' }
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
      type: 'prescription_record',
      title: 'SOURCE RECORD: Active Prescription',
      summary: 'Prescription record is included in the shared session.',
      category: 'SOURCE RECORD',
      sources: [{ text: 'Prescription document', sourceRecordId: rxRecord, sourceLabel, sourceDate: '05 Mar 2026' }]
    });
  }

  return insights;
}

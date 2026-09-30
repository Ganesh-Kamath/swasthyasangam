import { Patient, Doctor, MedicalRecord, DemoScenario } from '../types/index';

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'pat-rahul-01',
    name: 'Rahul Mehta',
    age: 52,
    gender: 'Male',
    bloodGroup: 'B+',
    primaryContext: 'Cardiology',
    abhaId: '91-4820-9921-3412',
    phone: '+91 98765 43210'
  },
  {
    id: 'pat-aisha-02',
    name: 'Aisha Kulkarni',
    age: 34,
    gender: 'Female',
    bloodGroup: 'O+',
    primaryContext: 'General Medicine',
    abhaId: '91-3104-5829-1920',
    phone: '+91 98123 45678'
  },
  {
    id: 'pat-arjun-03',
    name: 'Arjun Desai',
    age: 61,
    gender: 'Male',
    bloodGroup: 'A+',
    primaryContext: 'Diabetes / Cardiology',
    abhaId: '91-7729-1048-6631',
    phone: '+91 97654 32109'
  }
];

export const DEMO_PATIENT: Patient = DEMO_PATIENTS[0];

export const DEMO_DOCTORS: Doctor[] = [
  {
    id: 'doc-ananya-01',
    name: 'Dr. Ananya Shah',
    specialization: 'Cardiology',
    hospital: 'City Heart Centre & Multispeciality Clinic',
    regNumber: 'MCI-2012-08942'
  },
  {
    id: 'doc-rajesh-02',
    name: 'Dr. Rajesh Iyer',
    specialization: 'General Medicine',
    hospital: 'Apex Multispeciality Hospital',
    regNumber: 'MCI-2015-04193'
  },
  {
    id: 'doc-vikram-03',
    name: 'Dr. Vikram Sethi',
    specialization: 'Endocrinology & Diabetology',
    hospital: 'Metro Diabetes Institute',
    regNumber: 'MCI-2009-01124'
  }
];

export const DEMO_DOCTOR: Doctor = DEMO_DOCTORS[0];

export const DEMO_RECORDS: MedicalRecord[] = [
  // ==========================================
  // RAHUL MEHTA (Cardiology Focus, 2021-2026)
  // ==========================================
  {
    id: 'rec-rm-lipid-2021',
    patientId: 'pat-rahul-01',
    title: 'Lipid Profile (Baseline)',
    date: '14 May 2021',
    year: 2021,
    source: 'Apollo Diagnostics',
    department: 'Pathology & Biochemistry',
    doctorName: 'Dr. Ananya Shah',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Baseline lipid evaluation showing borderline Total Cholesterol and acceptable LDL.',
    details: {
      metrics: [
        { label: 'Total Cholesterol', value: '198', unit: 'mg/dL', status: 'normal', refRange: '< 200 mg/dL' },
        { label: 'LDL Cholesterol', value: '118', unit: 'mg/dL', status: 'normal', refRange: '< 100 mg/dL' },
        { label: 'HDL Cholesterol', value: '46', unit: 'mg/dL', status: 'normal', refRange: '> 40 mg/dL' },
        { label: 'Triglycerides', value: '142', unit: 'mg/dL', status: 'normal', refRange: '< 150 mg/dL' }
      ],
      findings: [
        'Total cholesterol within upper normal limits.',
        'Triglycerides in desirable range.',
        'HDL cholesterol levels protective.'
      ],
      clinicalNotes: 'Baseline lipid screen. Patient advised annual cardiovascular lifestyle check.',
      impression: 'Normolipidemic profile with borderline Total Cholesterol.'
    }
  },
  {
    id: 'rec-rm-ecg-2021',
    patientId: 'pat-rahul-01',
    title: '12-Lead ECG (Baseline)',
    date: '14 May 2021',
    year: 2021,
    source: 'City Heart Centre',
    department: 'Cardiac Electrophysiology',
    doctorName: 'Dr. Ananya Shah',
    category: 'Diagnostic',
    filterType: 'Cardiology',
    summary: 'Resting ECG demonstrates normal sinus rhythm with regular rate.',
    details: {
      metrics: [
        { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', refRange: '60 - 100 bpm' },
        { label: 'PR Interval', value: '144', unit: 'ms', status: 'normal', refRange: '120 - 200 ms' },
        { label: 'QRS Duration', value: '86', unit: 'ms', status: 'normal', refRange: '80 - 120 ms' },
        { label: 'QTc Interval', value: '408', unit: 'ms', status: 'normal', refRange: '< 450 ms' }
      ],
      findings: ['Normal sinus rhythm.', 'Normal axis.', 'No ischemic repolarization changes.'],
      clinicalNotes: 'Normal baseline 12-lead electrocardiogram. Regular rhythm.',
      impression: 'Normal resting ECG.'
    }
  },
  {
    id: 'rec-rm-ecg-2022',
    patientId: 'pat-rahul-01',
    title: '12-Lead ECG (Annual Review)',
    date: '10 November 2022',
    year: 2022,
    source: 'City Heart Centre',
    department: 'Cardiac Electrophysiology',
    doctorName: 'Dr. Ananya Shah',
    category: 'Diagnostic',
    filterType: 'Cardiology',
    summary: 'Sinus rhythm intact. Heart rate 74 bpm. Stable comparison with 2021 baseline.',
    details: {
      metrics: [
        { label: 'Heart Rate', value: '74', unit: 'bpm', status: 'normal', refRange: '60 - 100 bpm' },
        { label: 'PR Interval', value: '146', unit: 'ms', status: 'normal', refRange: '120 - 200 ms' },
        { label: 'QRS Duration', value: '88', unit: 'ms', status: 'normal', refRange: '80 - 120 ms' },
        { label: 'QTc Interval', value: '410', unit: 'ms', status: 'normal', refRange: '< 450 ms' }
      ],
      findings: ['Regular sinus rhythm.', 'Stable intervals compared to May 2021.', 'No pathological Q-waves.'],
      clinicalNotes: 'Annual routine cardiac check. Electrocardiographic baseline preserved.',
      impression: 'Normal sinus rhythm with no interval change from 2021.'
    }
  },
  {
    id: 'rec-rm-lipid-2022',
    patientId: 'pat-rahul-01',
    title: 'Lipid Profile (Follow-up)',
    date: '10 November 2022',
    year: 2022,
    source: 'Apollo Diagnostics',
    department: 'Pathology & Biochemistry',
    doctorName: 'Dr. Ananya Shah',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Mild upward creep in Total Cholesterol (206 mg/dL) and LDL (126 mg/dL).',
    details: {
      metrics: [
        { label: 'Total Cholesterol', value: '206', unit: 'mg/dL', status: 'borderline', refRange: '< 200 mg/dL' },
        { label: 'LDL Cholesterol', value: '126', unit: 'mg/dL', status: 'borderline', refRange: '< 100 mg/dL' },
        { label: 'HDL Cholesterol', value: '44', unit: 'mg/dL', status: 'normal', refRange: '> 40 mg/dL' },
        { label: 'Triglycerides', value: '154', unit: 'mg/dL', status: 'borderline', refRange: '< 150 mg/dL' }
      ],
      findings: [
        'Total cholesterol slightly above optimal threshold.',
        'LDL increased by 8 mg/dL compared to 2021.',
        'Triglycerides mildly elevated.'
      ],
      clinicalNotes: 'Dietary guidance provided. Advised reduction in saturated fats and increased aerobic exercise.',
      impression: 'Early borderline dyslipidemia.'
    }
  },
  {
    id: 'rec-rm-echo-2024',
    patientId: 'pat-rahul-01',
    title: '2D Echocardiogram & Doppler',
    date: '18 August 2024',
    year: 2024,
    source: 'City Heart Centre',
    department: 'Echocardiography Laboratory',
    doctorName: 'Dr. Ananya Shah',
    category: 'Imaging',
    filterType: 'Imaging',
    summary: 'Preserved left ventricular systolic performance with estimated LVEF of 60%.',
    details: {
      metrics: [
        { label: 'Estimated LVEF', value: '60', unit: '%', status: 'normal', refRange: '55 - 70%' },
        { label: 'LVIDd (Diastole)', value: '4.5', unit: 'cm', status: 'normal', refRange: '3.8 - 5.2 cm' },
        { label: 'LVIDs (Systole)', value: '3.0', unit: 'cm', status: 'normal', refRange: '2.5 - 3.5 cm' },
        { label: 'Interventricular Septum', value: '0.9', unit: 'cm', status: 'normal', refRange: '0.6 - 1.1 cm' }
      ],
      findings: [
        'Adequate ventricular wall motion.',
        'Estimated ejection fraction 60%.',
        'Normal chamber dimensions without hypertrophy.'
      ],
      clinicalNotes: 'Echocardiographic study demonstrates normal LV dimensions and preserved systolic parameters.',
      impression: 'Normal resting transthoracic echocardiogram.'
    }
  },
  {
    id: 'rec-rm-consult-2024',
    patientId: 'pat-rahul-01',
    title: 'Cardiology Consultation Notes',
    date: '18 August 2024',
    year: 2024,
    source: 'City Heart Centre',
    department: 'Department of Cardiology',
    doctorName: 'Dr. Ananya Shah',
    category: 'Consultation',
    filterType: 'Consultations',
    summary: 'Clinical review of lipid trends, resting blood pressure, and echo findings.',
    details: {
      findings: [
        'Blood pressure reading: 132/84 mmHg.',
        'Asymptomatic with good exercise tolerance.',
        'Advised continued lifestyle adherence.'
      ],
      clinicalNotes: 'Patient counseled on strict dietary lipid moderation. Routine follow-up scheduled in 12-18 months.',
      impression: 'Cardiovascular risk stratification: Low-to-moderate. Lifestyle therapy maintained.'
    }
  },
  // Existing 4 records preserved with their canonical IDs
  {
    id: 'rec-ecg-01',
    patientId: 'pat-rahul-01',
    title: 'ECG Report (12-Lead)',
    date: '12 August 2025',
    year: 2025,
    source: 'City Heart Centre',
    department: 'Cardiac Electrophysiology',
    doctorName: 'Dr. Ananya Shah',
    category: 'Diagnostic',
    filterType: 'Cardiology',
    summary: 'Sinus rhythm with regular rate. No ST-T segment elevation or acute ischemic changes.',
    details: {
      metrics: [
        { label: 'Heart Rate', value: '78', unit: 'bpm', status: 'normal', refRange: '60 - 100 bpm' },
        { label: 'PR Interval', value: '148', unit: 'ms', status: 'normal', refRange: '120 - 200 ms' },
        { label: 'QRS Duration', value: '88', unit: 'ms', status: 'normal', refRange: '80 - 120 ms' },
        { label: 'QTc Interval', value: '412', unit: 'ms', status: 'normal', refRange: '< 450 ms' }
      ],
      findings: [
        'Sinus rhythm.',
        'Heart rate: 78 bpm.',
        'No acute ST-T changes observed.'
      ],
      clinicalNotes: 'Normal resting 12-lead ECG. Baseline rhythm intact with no evidence of acute myocardial ischemia or conduction block.',
      impression: 'Normal 12-lead electrocardiogram.'
    }
  },
  {
    id: 'rec-lipid-02',
    patientId: 'pat-rahul-01',
    title: 'Lipid Profile (Comprehensive)',
    date: '21 February 2026',
    year: 2026,
    source: 'Metro Diagnostics',
    department: 'Pathology & Biochemistry',
    doctorName: 'Dr. Ananya Shah',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Mild dyslipidemia noted with elevated Total Cholesterol (218 mg/dL) and LDL (142 mg/dL).',
    details: {
      metrics: [
        { label: 'Total Cholesterol', value: '218', unit: 'mg/dL', status: 'abnormal', refRange: '< 200 mg/dL' },
        { label: 'LDL Cholesterol', value: '142', unit: 'mg/dL', status: 'abnormal', refRange: '< 100 mg/dL' },
        { label: 'HDL Cholesterol', value: '44', unit: 'mg/dL', status: 'normal', refRange: '> 40 mg/dL' },
        { label: 'Triglycerides', value: '161', unit: 'mg/dL', status: 'borderline', refRange: '< 150 mg/dL' },
        { label: 'VLDL Cholesterol', value: '32', unit: 'mg/dL', status: 'normal', refRange: '< 30 mg/dL' },
        { label: 'Total/HDL Ratio', value: '4.95', unit: '', status: 'borderline', refRange: '< 4.5' }
      ],
      findings: [
        'Elevated LDL-C (142 mg/dL) shows progression over 2021-2022 levels.',
        'Total cholesterol elevated at 218 mg/dL.',
        'Borderline triglycerides.'
      ],
      clinicalNotes: 'Fasting specimen (12 hours). Elevated LDL-C and Total Cholesterol indicate mild hypercholesterolemia. Dietary modifications and lipid management advised.',
      impression: 'Primary dyslipidemia requiring pharmacological statin optimization.'
    }
  },
  {
    id: 'rec-echo-03',
    patientId: 'pat-rahul-01',
    title: '2D Echocardiogram',
    date: '05 March 2026',
    year: 2026,
    source: 'City Heart Centre',
    department: 'Echocardiography Laboratory',
    doctorName: 'Dr. Ananya Shah',
    category: 'Imaging',
    filterType: 'Imaging',
    summary: 'Preserved left ventricular systolic function with estimated ejection fraction of 58%.',
    details: {
      metrics: [
        { label: 'Estimated LVEF', value: '58', unit: '%', status: 'normal', refRange: '55 - 70%' },
        { label: 'LVIDd (Diastole)', value: '4.6', unit: 'cm', status: 'normal', refRange: '3.8 - 5.2 cm' },
        { label: 'LVIDs (Systole)', value: '3.1', unit: 'cm', status: 'normal', refRange: '2.5 - 3.5 cm' },
        { label: 'Interventricular Septum', value: '1.0', unit: 'cm', status: 'normal', refRange: '0.6 - 1.1 cm' }
      ],
      findings: [
        'Left ventricular systolic function preserved.',
        'Estimated LVEF: 58%.',
        'No significant valvular abnormality noted.'
      ],
      clinicalNotes: 'Adequate acoustic window. Symmetrical wall thickening. Aortic, mitral, and tricuspid valves appear structurally normal with physiological regurgitant flow only.',
      impression: 'Preserved LV systolic function with normal chamber sizes.'
    }
  },
  {
    id: 'rec-presc-04',
    patientId: 'pat-rahul-01',
    title: 'Cardiology Prescription',
    date: '05 March 2026',
    year: 2026,
    source: 'City Heart Centre',
    department: 'Department of Cardiology',
    doctorName: 'Dr. Ananya Shah',
    category: 'Prescription',
    filterType: 'Prescriptions',
    summary: 'Post-consultation treatment regimen for lipid control and cardiovascular prophylaxis.',
    details: {
      medications: [
        { name: 'Tab. Atorvastatin', dosage: '20 mg', frequency: 'Once daily (Night)', duration: '30 days', instructions: 'Take after dinner' },
        { name: 'Tab. Metoprolol Succinate PR', dosage: '25 mg', frequency: 'Once daily (Morning)', duration: '30 days', instructions: 'Take post breakfast' },
        { name: 'Tab. Aspirin (Ecosprin)', dosage: '75 mg', frequency: 'Once daily (Afternoon)', duration: '30 days', instructions: 'Take after lunch' }
      ],
      advice: [
        'Strict low-sodium, low-saturated fat diet',
        '30-45 minutes brisk walking at least 5 days a week',
        'Maintain daily blood pressure and pulse log',
        'Repeat fasting Lipid Profile in 4 weeks for therapeutic review'
      ],
      clinicalNotes: 'Diagnosis: Essential Hypertension with mild dyslipidemia. Treatment goal is LDL-C reduction < 100 mg/dL and resting BP < 130/80 mmHg.',
      impression: 'Active cardiovascular management regimen.'
    }
  },
  {
    id: 'rec-rm-bp-2026',
    patientId: 'pat-rahul-01',
    title: 'Blood Pressure Record',
    date: '12 June 2026',
    year: 2026,
    source: 'City Heart Centre',
    department: 'Outpatient Nursing Station',
    doctorName: 'Dr. Ananya Shah',
    category: 'Diagnostic',
    filterType: 'Cardiology',
    summary: 'Resting ambulatory blood pressure reading shows mild systolic elevation (138/88 mmHg).',
    details: {
      metrics: [
        { label: 'Systolic BP', value: '138', unit: 'mmHg', status: 'borderline', refRange: '< 120 mmHg' },
        { label: 'Diastolic BP', value: '88', unit: 'mmHg', status: 'borderline', refRange: '< 80 mmHg' },
        { label: 'Pulse Rate', value: '76', unit: 'bpm', status: 'normal', refRange: '60 - 100 bpm' }
      ],
      findings: ['Mild Stage 1 systolic elevation.', 'Pulse regular and synchronous.'],
      clinicalNotes: 'Recorded in sitting position following 10-minute rest period. Right arm automated cuff.',
      impression: 'Borderline elevated resting blood pressure.'
    }
  },
  {
    id: 'rec-rm-trop-2026',
    patientId: 'pat-rahul-01',
    title: 'Cardiac Biomarker / Troponin I',
    date: '14 June 2026',
    year: 2026,
    source: 'Metro Diagnostics',
    department: 'Critical Care Biochemistry',
    doctorName: 'Dr. Ananya Shah',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'High-sensitivity Troponin I within normal limits, ruling out acute myocardial necrosis.',
    details: {
      metrics: [
        { label: 'High-Sensitivity Troponin I', value: '< 0.01', unit: 'ng/mL', status: 'normal', refRange: '< 0.04 ng/mL' },
        { label: 'Creatine Kinase-MB', value: '1.8', unit: 'ng/mL', status: 'normal', refRange: '< 5.0 ng/mL' }
      ],
      findings: ['Negative cardiac biomarker panel.', 'No biochemical evidence of acute coronary syndrome.'],
      clinicalNotes: 'Serum Troponin I tested post-exertional chest awareness. Normal baseline confirmed.',
      impression: 'Negative troponin assay ruling out acute myocardial injury.'
    }
  },

  // ==========================================
  // AISHA KULKARNI (General Medicine Focus, 2023-2026)
  // ==========================================
  {
    id: 'rec-ak-cbc-2023',
    patientId: 'pat-aisha-02',
    title: 'Complete Blood Count (CBC)',
    date: '12 March 2023',
    year: 2023,
    source: 'Apex Diagnostics',
    department: 'Hematology Laboratory',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Routine baseline hematology profile within normal physiological limits.',
    details: {
      metrics: [
        { label: 'Hemoglobin', value: '12.8', unit: 'g/dL', status: 'normal', refRange: '12.0 - 15.5 g/dL' },
        { label: 'Total Leukocyte Count (WBC)', value: '6800', unit: '/mcL', status: 'normal', refRange: '4,000 - 11,000 /mcL' },
        { label: 'Platelet Count', value: '240000', unit: '/mcL', status: 'normal', refRange: '150,000 - 450,000 /mcL' },
        { label: 'Packed Cell Volume (PCV)', value: '38.4', unit: '%', status: 'normal', refRange: '36 - 46%' }
      ],
      findings: ['Normocytic normochromic red cells.', 'Adequate platelet distribution.', 'Normal white cell count.'],
      clinicalNotes: 'Annual health checkup baseline profile. All hematologic indices within reference limits.',
      impression: 'Normal complete blood count.'
    }
  },
  {
    id: 'rec-ak-consult-2023',
    patientId: 'pat-aisha-02',
    title: 'General Consultation (Annual Check)',
    date: '12 March 2023',
    year: 2023,
    source: 'Apex Multispeciality Hospital',
    department: 'Department of Internal Medicine',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Consultation',
    filterType: 'Consultations',
    summary: 'Comprehensive annual wellness evaluation with unremarkable clinical findings.',
    details: {
      findings: ['Vitals normal: BP 118/76 mmHg, Pulse 72 bpm.', 'Systemic examination unremarkable.'],
      clinicalNotes: 'Patient presents for annual preventive wellness evaluation. Advised routine hydration and balanced nutrition.',
      impression: 'Healthy young adult; preventive checkup satisfactory.'
    }
  },
  {
    id: 'rec-ak-usg-2025',
    patientId: 'pat-aisha-02',
    title: 'Ultrasound Whole Abdomen',
    date: '04 October 2025',
    year: 2025,
    source: 'Apex Diagnostics Imaging',
    department: 'Diagnostic Radiology',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Imaging',
    filterType: 'Imaging',
    summary: 'Transabdominal ultrasound reveals normal liver parenchyma, clear gallbladder, and intact renal margins.',
    details: {
      findings: [
        'Liver is normal in size and echotexture with no focal lesions.',
        'Gallbladder is well-distended with no calculi or wall thickening.',
        'Both kidneys demonstrate normal corticomedullary differentiation.',
        'Spleen and pancreas appear unremarkable.'
      ],
      clinicalNotes: 'Investigated for mild non-specific postprandial dyspepsia. Scan reveals normal abdominal viscera.',
      impression: 'Normal ultrasound examination of whole abdomen.'
    }
  },
  {
    id: 'rec-ak-lft-2025',
    patientId: 'pat-aisha-02',
    title: 'Liver Function Test (LFT)',
    date: '04 October 2025',
    year: 2025,
    source: 'Apex Diagnostics',
    department: 'Clinical Biochemistry',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Hepatic enzymes and bilirubin clearance in pristine physiological range.',
    details: {
      metrics: [
        { label: 'Serum Bilirubin (Total)', value: '0.8', unit: 'mg/dL', status: 'normal', refRange: '0.2 - 1.2 mg/dL' },
        { label: 'SGOT / AST', value: '24', unit: 'U/L', status: 'normal', refRange: '< 35 U/L' },
        { label: 'SGPT / ALT', value: '26', unit: 'U/L', status: 'normal', refRange: '< 35 U/L' },
        { label: 'Alkaline Phosphatase', value: '64', unit: 'U/L', status: 'normal', refRange: '30 - 120 U/L' }
      ],
      findings: ['Normal transaminases.', 'Preserved biliary excretory parameters.'],
      clinicalNotes: 'Enzyme markers normal. Non-alcoholic fatty liver ruled out.',
      impression: 'Normal hepatic function panel.'
    }
  },
  {
    id: 'rec-ak-cbc-2026',
    patientId: 'pat-aisha-02',
    title: 'Complete Blood Count (CBC)',
    date: '15 February 2026',
    year: 2026,
    source: 'Apex Diagnostics',
    department: 'Hematology Laboratory',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Hemoglobin stable at 13.2 g/dL. Leukocytes and platelets in optimal range.',
    details: {
      metrics: [
        { label: 'Hemoglobin', value: '13.2', unit: 'g/dL', status: 'normal', refRange: '12.0 - 15.5 g/dL' },
        { label: 'Total Leukocyte Count (WBC)', value: '7100', unit: '/mcL', status: 'normal', refRange: '4,000 - 11,000 /mcL' },
        { label: 'Platelet Count', value: '265000', unit: '/mcL', status: 'normal', refRange: '150,000 - 450,000 /mcL' },
        { label: 'Packed Cell Volume (PCV)', value: '39.8', unit: '%', status: 'normal', refRange: '36 - 46%' }
      ],
      findings: ['Stable hematologic indicators compared to 2023 baseline.', 'No microcytosis or hypochromia.'],
      clinicalNotes: 'Annual checkup routine profiling.',
      impression: 'Normal hematologic indices.'
    }
  },
  {
    id: 'rec-ak-lft-2026',
    patientId: 'pat-aisha-02',
    title: 'Liver Function Test (Comprehensive)',
    date: '15 February 2026',
    year: 2026,
    source: 'Apex Diagnostics',
    department: 'Clinical Biochemistry',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Normal hepatic transaminases (AST 22, ALT 25 U/L) and albumin synthesis (4.4 g/dL).',
    details: {
      metrics: [
        { label: 'Serum Bilirubin (Total)', value: '0.7', unit: 'mg/dL', status: 'normal', refRange: '0.2 - 1.2 mg/dL' },
        { label: 'SGOT / AST', value: '22', unit: 'U/L', status: 'normal', refRange: '< 35 U/L' },
        { label: 'SGPT / ALT', value: '25', unit: 'U/L', status: 'normal', refRange: '< 35 U/L' },
        { label: 'Serum Albumin', value: '4.4', unit: 'g/dL', status: 'normal', refRange: '3.5 - 5.0 g/dL' }
      ],
      findings: ['Hepatic synthetic and secretory function intact.'],
      clinicalNotes: 'Liver profile reassuring; transaminases steady across 2025 and 2026.',
      impression: 'Unremarkable liver biochemistry.'
    }
  },
  {
    id: 'rec-ak-kft-2026',
    patientId: 'pat-aisha-02',
    title: 'Kidney Function Test (KFT)',
    date: '15 February 2026',
    year: 2026,
    source: 'Apex Diagnostics',
    department: 'Clinical Biochemistry & Nephrology',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Normal renal clearance with serum creatinine 0.85 mg/dL and eGFR > 90 mL/min.',
    details: {
      metrics: [
        { label: 'Serum Creatinine', value: '0.85', unit: 'mg/dL', status: 'normal', refRange: '0.6 - 1.1 mg/dL' },
        { label: 'Blood Urea Nitrogen', value: '14', unit: 'mg/dL', status: 'normal', refRange: '7 - 20 mg/dL' },
        { label: 'Estimated GFR', value: '> 90', unit: 'mL/min/1.73m²', status: 'normal', refRange: '> 90 mL/min' },
        { label: 'Serum Uric Acid', value: '4.2', unit: 'mg/dL', status: 'normal', refRange: '2.5 - 6.0 mg/dL' }
      ],
      findings: ['Preserved glomerular filtration rate.', 'Normal nitrogenous waste clearance.'],
      clinicalNotes: 'Renal parameters optimal.',
      impression: 'Normal renal function.'
    }
  },
  {
    id: 'rec-ak-consult-2026',
    patientId: 'pat-aisha-02',
    title: 'General Medicine Consultation',
    date: '20 February 2026',
    year: 2026,
    source: 'Apex Multispeciality Hospital',
    department: 'Department of Internal Medicine',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Consultation',
    filterType: 'Consultations',
    summary: 'Clinical consultation confirming excellent metabolic, renal, and hepatic wellness.',
    details: {
      findings: ['Vitals: BP 116/74 mmHg, Pulse 70 bpm, BMI 22.4 kg/m².'],
      clinicalNotes: 'Patient reviewed with complete laboratory panels. Prescribed maintenance Vitamin D3 supplement.',
      impression: 'Routine wellness consultation; all panels clear.'
    }
  },
  {
    id: 'rec-ak-presc-2026',
    patientId: 'pat-aisha-02',
    title: 'General Wellness Prescription',
    date: '20 February 2026',
    year: 2026,
    source: 'Apex Multispeciality Hospital',
    department: 'Department of Internal Medicine',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Prescription',
    filterType: 'Prescriptions',
    summary: 'Maintenance supplementation for micronutrient support and bone wellness.',
    details: {
      medications: [
        { name: 'Cap. Cholecalciferol (Vitamin D3)', dosage: '60,000 IU', frequency: 'Once weekly', duration: '8 weeks', instructions: 'Take with milk' },
        { name: 'Tab. Multivitamin & Minerals', dosage: '1 Tab', frequency: 'Once daily (Morning)', duration: '30 days', instructions: 'Take post breakfast' }
      ],
      advice: ['Maintain 2.5 litres daily water intake', 'Continue regular aerobic routine'],
      clinicalNotes: 'Prophylactic supplementation for indoor working professional.',
      impression: 'Preventive micronutrient regimen.'
    }
  },
  {
    id: 'rec-ak-cxr-2026',
    patientId: 'pat-aisha-02',
    title: 'Chest X-Ray (PA View)',
    date: '22 February 2026',
    year: 2026,
    source: 'Apex Diagnostics Imaging',
    department: 'Diagnostic Radiology',
    doctorName: 'Dr. Rajesh Iyer',
    category: 'Imaging',
    filterType: 'Imaging',
    summary: 'Normal cardiac silhouette and clear pulmonary fields without focal consolidation.',
    details: {
      findings: [
        'Both lung fields are clear without evidence of consolidation, effusion, or active Koch’s.',
        'Cardiothoracic ratio is normal (< 0.50).',
        'Costophrenic angles and hemidiaphragms are clearly outlined.'
      ],
      clinicalNotes: 'Screening radiograph performed for annual corporate health review.',
      impression: 'Normal chest radiograph.'
    }
  },

  // ==========================================
  // ARJUN DESAI (Diabetes & Cardiology Focus, 2022-2026)
  // ==========================================
  {
    id: 'rec-ad-fbg-2022',
    patientId: 'pat-arjun-03',
    title: 'Fasting Blood Glucose (Baseline)',
    date: '18 January 2022',
    year: 2022,
    source: 'Metro Diabetes Institute',
    department: 'Department of Diabetology',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Impaired fasting glucose (118 mg/dL) identified during routine metabolic workup.',
    details: {
      metrics: [
        { label: 'Fasting Blood Glucose', value: '118', unit: 'mg/dL', status: 'borderline', refRange: '70 - 100 mg/dL' }
      ],
      findings: ['Impaired fasting glycaemia.'],
      clinicalNotes: 'Baseline screening in 57-year-old male with positive family history of Type 2 Diabetes.',
      impression: 'Pre-diabetes stage with impaired fasting glucose.'
    }
  },
  {
    id: 'rec-ad-hba1c-2022',
    patientId: 'pat-arjun-03',
    title: 'HbA1c Glycated Hemoglobin',
    date: '18 January 2022',
    year: 2022,
    source: 'Metro Diabetes Institute',
    department: 'Clinical Biochemistry',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Glycated hemoglobin elevated at 6.8%, confirming early Type 2 Diabetes mellitus.',
    details: {
      metrics: [
        { label: 'HbA1c', value: '6.8', unit: '%', status: 'abnormal', refRange: '< 5.7%' },
        { label: 'Estimated Average Glucose', value: '148', unit: 'mg/dL', status: 'borderline', refRange: '< 117 mg/dL' }
      ],
      findings: ['Elevated HbA1c indicative of early Type 2 Diabetes.'],
      clinicalNotes: 'Initiated medical nutrition therapy and low-dose Metformin monotherapy.',
      impression: 'Early Type 2 Diabetes Mellitus.'
    }
  },
  {
    id: 'rec-ad-hba1c-2024',
    patientId: 'pat-arjun-03',
    title: 'HbA1c Glycated Hemoglobin',
    date: '09 September 2024',
    year: 2024,
    source: 'Metro Diabetes Institute',
    department: 'Clinical Biochemistry',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Suboptimal glycemic control noted with HbA1c elevation to 7.4%.',
    details: {
      metrics: [
        { label: 'HbA1c', value: '7.4', unit: '%', status: 'abnormal', refRange: '< 5.7%' },
        { label: 'Estimated Average Glucose', value: '166', unit: 'mg/dL', status: 'abnormal', refRange: '< 117 mg/dL' }
      ],
      findings: ['Progressive rise in HbA1c over 2022 baseline (6.8% -> 7.4%).'],
      clinicalNotes: 'Metformin dose titrated to 500mg BD. Reinforced dietary carbohydrate reduction.',
      impression: 'Sub-optimally controlled Type 2 Diabetes.'
    }
  },
  {
    id: 'rec-ad-lipid-2024',
    patientId: 'pat-arjun-03',
    title: 'Lipid Profile (Metabolic Panel)',
    date: '09 September 2024',
    year: 2024,
    source: 'Metro Diabetes Institute',
    department: 'Biochemistry Laboratory',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Atherogenic dyslipidemia typical in diabetic metabolic syndrome (LDL 148, Trig 195).',
    details: {
      metrics: [
        { label: 'Total Cholesterol', value: '224', unit: 'mg/dL', status: 'abnormal', refRange: '< 200 mg/dL' },
        { label: 'LDL Cholesterol', value: '148', unit: 'mg/dL', status: 'abnormal', refRange: '< 100 mg/dL' },
        { label: 'HDL Cholesterol', value: '37', unit: 'mg/dL', status: 'borderline', refRange: '> 40 mg/dL' },
        { label: 'Triglycerides', value: '195', unit: 'mg/dL', status: 'abnormal', refRange: '< 150 mg/dL' }
      ],
      findings: ['Elevated triglycerides and low HDL-C characteristic of diabetic dyslipidemia.'],
      clinicalNotes: 'Combined metabolic risk profile. Statin therapy advised.',
      impression: 'Diabetic atherogenic dyslipidemia.'
    }
  },
  {
    id: 'rec-ad-cxr-2024',
    patientId: 'pat-arjun-03',
    title: 'Chest X-Ray PA View',
    date: '09 September 2024',
    year: 2024,
    source: 'Apex Imaging Centre',
    department: 'Radiodiagnosis',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Imaging',
    filterType: 'Imaging',
    summary: 'Mild cardiomegaly noted without focal pulmonary consolidation or vascular congestion.',
    details: {
      findings: [
        'Transverse cardiac diameter mildly enlarged with cardiothoracic ratio of 0.52.',
        'Pulmonary vasculature within normal limits.',
        'No pleural effusion or active infiltrates.'
      ],
      clinicalNotes: 'Baseline screening for cardiovascular involvement in long-standing metabolic syndrome.',
      impression: 'Mild borderline cardiomegaly.'
    }
  },
  {
    id: 'rec-ad-hba1c-2026',
    patientId: 'pat-arjun-03',
    title: 'HbA1c Glycated Hemoglobin (Current)',
    date: '12 January 2026',
    year: 2026,
    source: 'Metro Diabetes Institute',
    department: 'Clinical Biochemistry',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'HbA1c elevated at 7.9% demonstrating worsening glycemic excursion over 3-year timeline.',
    details: {
      metrics: [
        { label: 'HbA1c', value: '7.9', unit: '%', status: 'abnormal', refRange: '< 5.7%' },
        { label: 'Estimated Average Glucose', value: '180', unit: 'mg/dL', status: 'abnormal', refRange: '< 117 mg/dL' }
      ],
      findings: [
        'Glycated hemoglobin elevated at 7.9%.',
        'Longitudinal progression: 6.8% (2022) -> 7.4% (2024) -> 7.9% (2026).',
        'Dual oral hypoglycemic agent therapy required.'
      ],
      clinicalNotes: 'Patient reviewed for ongoing metabolic monitoring. Dual therapy intensification indicated.',
      impression: 'Uncontrolled Type 2 Diabetes Mellitus.'
    }
  },
  {
    id: 'rec-ad-fbg-2026',
    patientId: 'pat-arjun-03',
    title: 'Fasting Blood Glucose',
    date: '12 January 2026',
    year: 2026,
    source: 'Metro Diabetes Institute',
    department: 'Department of Diabetology',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Fasting glucose elevated at 152 mg/dL after 10-hour overnight fast.',
    details: {
      metrics: [
        { label: 'Fasting Blood Glucose', value: '152', unit: 'mg/dL', status: 'abnormal', refRange: '70 - 100 mg/dL' }
      ],
      findings: ['Marked fasting hyperglycemia.'],
      clinicalNotes: 'Confirmed 10-hour fast. Correlates with elevated HbA1c.',
      impression: 'Fasting hyperglycemia secondary to insulin resistance and impaired hepatic glucose suppression.'
    }
  },
  {
    id: 'rec-ad-ppbg-2026',
    patientId: 'pat-arjun-03',
    title: 'Postprandial Blood Glucose (2-Hour)',
    date: '12 January 2026',
    year: 2026,
    source: 'Metro Diabetes Institute',
    department: 'Department of Diabetology',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: '2-hour postprandial glucose spike to 218 mg/dL following standardized meal.',
    details: {
      metrics: [
        { label: 'Postprandial Glucose (2 hr)', value: '218', unit: 'mg/dL', status: 'abnormal', refRange: '< 140 mg/dL' }
      ],
      findings: ['Significant postprandial glycemic excursion (> 200 mg/dL).'],
      clinicalNotes: 'Tested exactly 2 hours after standard breakfast.',
      impression: 'Pronounced postprandial hyperglycemia.'
    }
  },
  {
    id: 'rec-ad-lipid-2026',
    patientId: 'pat-arjun-03',
    title: 'Lipid Profile (Comprehensive)',
    date: '14 January 2026',
    year: 2026,
    source: 'Metro Diabetes Institute',
    department: 'Biochemistry Laboratory',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Laboratory',
    filterType: 'Blood Tests',
    summary: 'Severe mixed dyslipidemia with elevated LDL (156 mg/dL) and Triglycerides (210 mg/dL).',
    details: {
      metrics: [
        { label: 'Total Cholesterol', value: '236', unit: 'mg/dL', status: 'abnormal', refRange: '< 200 mg/dL' },
        { label: 'LDL Cholesterol', value: '156', unit: 'mg/dL', status: 'abnormal', refRange: '< 100 mg/dL' },
        { label: 'HDL Cholesterol', value: '38', unit: 'mg/dL', status: 'borderline', refRange: '> 40 mg/dL' },
        { label: 'Triglycerides', value: '210', unit: 'mg/dL', status: 'abnormal', refRange: '< 150 mg/dL' }
      ],
      findings: ['Mixed dyslipidemia in high-risk cardiovascular patient.'],
      clinicalNotes: 'Elevated atherogenic index in 61-year-old diabetic patient.',
      impression: 'Mixed hyperlipidemia with high cardiovascular risk.'
    }
  },
  {
    id: 'rec-ad-diab-consult-2026',
    patientId: 'pat-arjun-03',
    title: 'Diabetes Specialist Consultation',
    date: '16 January 2026',
    year: 2026,
    source: 'Metro Diabetes Institute',
    department: 'Diabetology & Endocrinology',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Consultation',
    filterType: 'Consultations',
    summary: 'Clinical consultation addressing worsening glycemic control and initiating SGLT2 inhibitor.',
    details: {
      findings: [
        'Vitals: BP 136/84 mmHg, BMI 28.2 kg/m².',
        'HbA1c increased to 7.9% despite Metformin adherence.',
        'SGLT2 inhibitor (Empagliflozin) added for glycemic and cardiorenal protection.'
      ],
      clinicalNotes: 'Patient counseled on self-monitoring of blood glucose (SMBG). Advised repeat HbA1c in 3 months.',
      impression: 'Type 2 Diabetes requiring dual oral intensification and statin therapy.'
    }
  },
  {
    id: 'rec-ad-presc-2026',
    patientId: 'pat-arjun-03',
    title: 'Diabetes & Metabolic Prescription',
    date: '16 January 2026',
    year: 2026,
    source: 'Metro Diabetes Institute',
    department: 'Diabetology & Endocrinology',
    doctorName: 'Dr. Vikram Sethi',
    category: 'Prescription',
    filterType: 'Prescriptions',
    summary: 'Intensified dual antidiabetic and cardioprotective medication schedule.',
    details: {
      medications: [
        { name: 'Tab. Metformin Sustained Release', dosage: '1000 mg', frequency: 'Twice daily', duration: '90 days', instructions: 'Take with major meals' },
        { name: 'Tab. Empagliflozin (Jardiance)', dosage: '10 mg', frequency: 'Once daily (Morning)', duration: '90 days', instructions: 'Take post breakfast' },
        { name: 'Tab. Rosuvastatin', dosage: '10 mg', frequency: 'Once daily (Night)', duration: '90 days', instructions: 'Take after dinner' }
      ],
      advice: [
        'Low glycemic index diabetic diet',
        'Maintain fasting and post-meal glucose diary',
        'Daily foot examination',
        'Review renal function and HbA1c in 12 weeks'
      ],
      clinicalNotes: 'Dual oral therapy regimen aimed at HbA1c reduction < 7.0% and cardiovascular risk mitigation.',
      impression: 'Optimized metabolic pharmacotherapy.'
    }
  }
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-cardio-followup',
    title: 'Cardiology Follow-up',
    patientId: 'pat-rahul-01',
    purpose: 'Cardiology consultation',
    description: 'Rahul Mehta (52 Y, B+) with recent ECG, Echocardiogram, and Lipid Profile.',
    recommendedRecordIds: ['rec-ecg-01', 'rec-lipid-02', 'rec-echo-03']
  },
  {
    id: 'scenario-cardio-longitudinal',
    title: 'Longitudinal Cardiac History',
    patientId: 'pat-rahul-01',
    purpose: 'Review historical cardiac records',
    description: 'Rahul Mehta (52 Y, B+) tracking ECG, Echo, and Lipid trends from 2021 through 2026.',
    recommendedRecordIds: ['rec-rm-lipid-2021', 'rec-rm-ecg-2021', 'rec-rm-ecg-2022', 'rec-rm-echo-2024', 'rec-ecg-01', 'rec-lipid-02']
  },
  {
    id: 'scenario-diabetes-review',
    title: 'Diabetes & Metabolic Review',
    patientId: 'pat-arjun-03',
    purpose: 'Endocrinology & diabetes review',
    description: 'Arjun Desai (61 Y, A+) with HbA1c trajectory, Fasting/PPBG, and metabolic panel.',
    recommendedRecordIds: ['rec-ad-hba1c-2026', 'rec-ad-fbg-2026', 'rec-ad-ppbg-2026', 'rec-ad-lipid-2026', 'rec-ad-diab-consult-2026']
  },
  {
    id: 'scenario-general-checkup',
    title: 'General Wellness Consultation',
    patientId: 'pat-aisha-02',
    purpose: 'General medical consultation',
    description: 'Aisha Kulkarni (34 Y, O+) with Complete Blood Count, Liver and Kidney panels.',
    recommendedRecordIds: ['rec-ak-cbc-2026', 'rec-ak-lft-2026', 'rec-ak-kft-2026', 'rec-ak-consult-2026']
  }
];

export const DEFAULT_SESSION_CODE = 'SS-DEMO-4821';

export function getRecordsByPatientId(patientId: string): MedicalRecord[] {
  return DEMO_RECORDS.filter((r) => r.patientId === patientId || (!r.patientId && patientId === 'pat-rahul-01'));
}

export function getPatientById(patientId: string): Patient {
  return DEMO_PATIENTS.find((p) => p.id === patientId) || DEMO_PATIENTS[0];
}

export function getSuggestedRecordsForPurpose(patientId: string, purpose: string): string[] {
  const patientRecords = getRecordsByPatientId(patientId);
  const pLower = (purpose || '').toLowerCase();

  if (pLower.includes('cardio') || pLower.includes('heart')) {
    return patientRecords
      .filter((r) => r.filterType === 'Cardiology' || r.filterType === 'Blood Tests' || r.filterType === 'Imaging')
      .slice(0, 4)
      .map((r) => r.id);
  }

  if (pLower.includes('diabet') || pLower.includes('metabol') || pLower.includes('sugar')) {
    return patientRecords
      .filter((r) => r.title.includes('Glucose') || r.title.includes('HbA1c') || r.title.includes('Lipid') || r.filterType === 'Consultations')
      .map((r) => r.id);
  }

  if (pLower.includes('general') || pLower.includes('wellness') || pLower.includes('annual')) {
    return patientRecords
      .filter((r) => r.filterType === 'Blood Tests' || r.filterType === 'Consultations')
      .slice(0, 4)
      .map((r) => r.id);
  }

  // Default: return top 3 most recent records
  return patientRecords.slice(0, 3).map((r) => r.id);
}

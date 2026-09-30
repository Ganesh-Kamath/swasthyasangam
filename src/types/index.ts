export interface MedicalRecord {
  id: string;
  patientId?: string;
  title: string;
  date: string;
  year?: number;
  source: string;
  department?: string;
  doctorName?: string;
  category: 'Diagnostic' | 'Laboratory' | 'Imaging' | 'Prescription' | 'Consultation' | string;
  filterType?: 'Cardiology' | 'Blood Tests' | 'Imaging' | 'Prescriptions' | 'Consultations' | string;
  summary: string;
  details: {
    findings?: string[];
    metrics?: { label: string; value: string; unit?: string; status?: 'normal' | 'borderline' | 'abnormal'; refRange?: string }[];
    medications?: { name: string; dosage: string; frequency: string; duration: string; instructions: string }[];
    clinicalNotes?: string;
    impression?: string;
    advice?: string[];
  };
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  primaryContext?: string;
  abhaId?: string;
  phone?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  regNumber: string;
}

export type SessionStatus = 'active' | 'expired' | 'revoked';

export interface AccessSession {
  id: string;
  sessionId: string; // e.g. "SS-DEMO-4821"
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  recordIds: string[];
  selectedRecordIds?: string[];
  purpose: string;
  durationMinutes: number;
  createdAt: number;
  expiresAt: number;
  status: SessionStatus;
  accessCount?: number;
  lastAccessedAt?: number;
}

export interface DemoScenario {
  id: string;
  title: string;
  patientId: string;
  purpose: string;
  description: string;
  recommendedRecordIds: string[];
}

export type ViewMode = 'patient' | 'doctor';
export type DemoStep = 'landing' | 'select_records' | 'create_access' | 'qr_access' | 'doctor_scan' | 'doctor_access';


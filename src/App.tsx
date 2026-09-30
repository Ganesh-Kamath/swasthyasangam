import React, { useState, useEffect } from 'react';
import {
  MedicalRecord,
  Patient,
  Doctor,
  AccessSession,
  ViewMode,
  DemoStep,
  DemoScenario
} from './types';
import {
  DEMO_PATIENT,
  DEMO_DOCTOR,
  DEMO_RECORDS,
  DEMO_PATIENTS,
  DEMO_SCENARIOS,
  getPatientById,
  getRecordsByPatientId,
  getSuggestedRecordsForPurpose,
  DEFAULT_SESSION_CODE
} from './data/demoData';

import {
  getStoredSession,
  saveStoredSession,
  saveStoredSessionLocally,
  getStoredSelectedRecords,
  saveStoredSelectedRecords,
  resetDemoState,
  getSessionById,
  getSessionByIdAsync,
  simulateServerExpiry,
  parseUrlRoute
} from './utils/sessionManager';

import { DemoTopBar } from './components/DemoTopBar';
import { Header } from './components/Header';
import { WorkflowStepper } from './components/WorkflowStepper';
import { DocumentViewer } from './components/DocumentViewer';
import { RevokeModal } from './components/RevokeModal';
import { SimulateExpiryModal } from './components/SimulateExpiryModal';
import { DemoScenarioModal } from './components/DemoScenarioModal';

import { Landing } from './pages/Landing';
import { PatientRecords } from './pages/PatientRecords';
import { CreateAccess } from './pages/CreateAccess';
import { QRAccess } from './pages/QRAccess';
import { DoctorScan } from './pages/DoctorScan';
import { DoctorAccess } from './pages/DoctorAccess';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('patient');
  const [currentStep, setCurrentStep] = useState<DemoStep>('landing');
  const [sessionNotFoundId, setSessionNotFoundId] = useState<string | null>(null);
  const [testDurationOverrideMs, setTestDurationOverrideMs] = useState<number | undefined>(undefined);

  // Active Patient for Demo Library
  const [activePatientId, setActivePatientId] = useState<string>('pat-rahul-01');
  const [consultationPurpose, setConsultationPurpose] = useState<string>('Cardiology consultation');
  const [showScenarioModal, setShowScenarioModal] = useState<boolean>(false);

  // Selected records by patient (persisted in localStorage)
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>(() => {
    return getStoredSelectedRecords();
  });

  // Access Session state (persisted in localStorage + remote backend)
  const [session, setSession] = useState<AccessSession>(() => {
    return getStoredSession();
  });

  // Active Document Viewer Modal
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);

  // Revoke Confirmation Modal
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);

  // Demo: Simulate Expiry Modal
  const [showSimulateExpiryModal, setShowSimulateExpiryModal] = useState<boolean>(false);

  // Route and URL Initialization
  useEffect(() => {
    const init = async () => {
      const route = parseUrlRoute();
      if (route.testDurationMs) {
        setTestDurationOverrideMs(route.testDurationMs);
      }

      if (route.routeSessionId) {
        // Query remote shared store first (for cross-device phone access), then local fallbacks
        let foundSession = await getSessionByIdAsync(route.routeSessionId);

        if (!foundSession) {
          foundSession = getSessionById(route.routeSessionId, {
            records: route.urlRecords,
            expiresAt: route.urlExpiresAt,
            purpose: route.urlPurpose
          });
        }

        // Sync with dev server in-memory store for multi-context E2E tests
        try {
          const res = await fetch(`/api/sync-session?id=${encodeURIComponent(route.routeSessionId)}`);
          if (res.ok) {
            const serverSession = await res.json();
            if (serverSession && serverSession.sessionId) {
              foundSession = serverSession;
              saveStoredSession(serverSession);
            }
          }
        } catch (e) {
          // ignore
        }

        if (foundSession) {
          setSession(foundSession);
          setViewMode('doctor');
          setCurrentStep('doctor_access');
          setSessionNotFoundId(null);
        } else {
          setViewMode('doctor');
          setCurrentStep('doctor_scan');
          setSessionNotFoundId(route.routeSessionId);
        }
      } else if (route.view) {
        setViewMode(route.view);
        if (route.view === 'doctor') {
          setCurrentStep('doctor_scan');
        } else if (route.view === 'patient') {
          setCurrentStep('select_records');
        }
      }
    };

    init();
  }, []);

  // Cross-tab and local event synchronization
  useEffect(() => {
    const handleStorageOrCustom = () => {
      const current = getStoredSession();
      setSession(current);
      // If session got revoked or expired while document is open, close document
      if (current.status !== 'active') {
        setViewingRecord(null);
      }
    };

    window.addEventListener('storage', handleStorageOrCustom);
    window.addEventListener('swasthyasangam:session_update' as any, handleStorageOrCustom);

    return () => {
      window.removeEventListener('storage', handleStorageOrCustom);
      window.removeEventListener('swasthyasangam:session_update' as any, handleStorageOrCustom);
    };
  }, []);

  // Cross-device remote session sync (polls server /api/session/:code so doctor phone immediately gets revocation, expiry, or simulated expiry timestamp)
  useEffect(() => {
    if (viewMode === 'doctor' && session?.sessionId) {
      const code = session.sessionId.toUpperCase();
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/session/${encodeURIComponent(code)}`);
          if (res.status === 410) {
            setSession((prev) => {
              if (prev.status === 'expired') return prev;
              const exp = { ...prev, status: 'expired' as const, recordIds: [] };
              saveStoredSessionLocally(exp);
              return exp;
            });
            setViewingRecord(null);
            return;
          }
          if (res.status === 403) {
            setSession((prev) => {
              if (prev.status === 'revoked') return prev;
              const rev = { ...prev, status: 'revoked' as const, recordIds: [] };
              saveStoredSessionLocally(rev);
              return rev;
            });
            setViewingRecord(null);
            return;
          }
          if (res.ok) {
            const data = await res.json();
            if (data && data.status) {
              setSession((prev) => {
                const statusChanged = prev.status !== data.status;
                const serverExpiresAt = Number(data.expiresAt);
                const expiresAtChanged = Boolean(serverExpiresAt) && Math.abs(prev.expiresAt - serverExpiresAt) > 2000;
                const recordsChanged = prev.recordIds.length !== (data.selectedRecordIds || data.recordIds || []).length;

                if (statusChanged || expiresAtChanged || recordsChanged) {
                  if (data.status !== 'active') {
                    setViewingRecord(null);
                  }
                  return {
                    ...prev,
                    status: data.status,
                    expiresAt: serverExpiresAt || prev.expiresAt,
                    recordIds: data.status === 'active' ? (data.selectedRecordIds || data.recordIds || prev.recordIds) : []
                  };
                }
                return prev;
              });
            }
          }
        } catch (e) {
          // ignore network hiccups
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [viewMode, session?.sessionId]);

  // Strict Revalidation: Re-verify against server on tab switch, window focus, browser back-button, or pageshow
  useEffect(() => {
    const revalidate = async () => {
      if (session?.sessionId && viewMode === 'doctor') {
        const code = session.sessionId.toUpperCase();
        try {
          const res = await fetch(`/api/session/${encodeURIComponent(code)}`);
          if (res.status === 410) {
            setSession((prev) => {
              const exp = { ...prev, status: 'expired' as const, recordIds: [] };
              saveStoredSessionLocally(exp);
              return exp;
            });
            setViewingRecord(null);
          } else if (res.status === 403) {
            setSession((prev) => {
              const rev = { ...prev, status: 'revoked' as const, recordIds: [] };
              saveStoredSessionLocally(rev);
              return rev;
            });
            setViewingRecord(null);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('visibilitychange', revalidate);
    window.addEventListener('focus', revalidate);
    window.addEventListener('popstate', revalidate);
    window.addEventListener('pageshow', revalidate);

    return () => {
      window.removeEventListener('visibilitychange', revalidate);
      window.removeEventListener('focus', revalidate);
      window.removeEventListener('popstate', revalidate);
      window.removeEventListener('pageshow', revalidate);
    };
  }, [session?.sessionId, viewMode]);

  // Derived patient & records state
  const activePatient = getPatientById(activePatientId) || DEMO_PATIENT;
  const patientRecords = getRecordsByPatientId(activePatient.id);
  const suggestedRecordIds = getSuggestedRecordsForPurpose(activePatient.id, consultationPurpose);

  // Update localStorage when selected records change
  const handleToggleRecord = (id: string) => {
    setSelectedRecordIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id];
      saveStoredSelectedRecords(updated);
      return updated;
    });
  };

  const handleSelectAll = () => {
    const allIds = patientRecords.map((r) => r.id);
    setSelectedRecordIds(allIds);
    saveStoredSelectedRecords(allIds);
  };

  const handleClearSelection = () => {
    setSelectedRecordIds([]);
    saveStoredSelectedRecords([]);
  };

  // Switch Active Demo Patient
  const handleSelectPatient = (patientId: string) => {
    setActivePatientId(patientId);
    const newPatient = getPatientById(patientId);
    const newRecords = getRecordsByPatientId(patientId);
    const newPurpose = newPatient?.primaryContext
      ? `${newPatient.primaryContext} consultation`
      : 'General Consultation';
    setConsultationPurpose(newPurpose);
    const suggested = getSuggestedRecordsForPurpose(patientId, newPurpose);
    const newSelected = suggested.length > 0 ? suggested : newRecords.slice(0, 3).map((r) => r.id);
    setSelectedRecordIds(newSelected);
    saveStoredSelectedRecords(newSelected);
  };

  // 1-Click Load Demo Scenario
  const handleSelectScenario = (scenario: DemoScenario) => {
    setActivePatientId(scenario.patientId);
    setConsultationPurpose(scenario.purpose);
    setSelectedRecordIds(scenario.recommendedRecordIds);
    saveStoredSelectedRecords(scenario.recommendedRecordIds);
    setShowScenarioModal(false);
    setViewMode('patient');
    setCurrentStep('select_records');
  };

  // 1-Click Apply Suggested Records for current consultation purpose
  const handleApplySuggestedRecords = () => {
    if (suggestedRecordIds.length > 0) {
      setSelectedRecordIds(suggestedRecordIds);
      saveStoredSelectedRecords(suggestedRecordIds);
    }
  };

  // Generate QR Access Session
  const handleGenerateQR = async (durationMinutes: number, purpose: string) => {
    const now = Date.now();
    const durationMs = testDurationOverrideMs ? testDurationOverrideMs : durationMinutes * 60 * 1000;

    const updatedSession: AccessSession = {
      id: `session-${Date.now()}`,
      sessionId: DEFAULT_SESSION_CODE,
      patientId: activePatient.id,
      patientName: activePatient.name,
      doctorId: DEMO_DOCTOR.id,
      recordIds: [...selectedRecordIds],
      purpose: purpose || consultationPurpose || 'Cardiology consultation',
      durationMinutes,
      createdAt: now,
      expiresAt: now + durationMs,
      status: 'active'
    };
    setSession(updatedSession);
    await saveStoredSession(updatedSession);

    setCurrentStep('qr_access');
  };

  // Simulate Doctor Scanning QR
  const handleSimulateDoctorScan = () => {
    setViewMode('doctor');
    setCurrentStep('doctor_access');
  };

  // Doctor Scan Verification Complete
  const handleScanVerificationComplete = () => {
    setCurrentStep('doctor_access');
  };

  // Revoke Session
  const handleRevokeSession = async () => {
    const updated: AccessSession = {
      ...session,
      status: 'revoked'
    };
    setSession(updated);
    saveStoredSessionLocally(updated);
    setViewingRecord(null);

    // Call server-side revoke endpoint
    try {
      await fetch(`/api/session/${encodeURIComponent(session.sessionId)}/revoke`, {
        method: 'POST'
      });
    } catch (e) {
      // ignore
    }
  };

  // Demo Control: Open Simulate Expiry Modal (15s or 30s selection)
  const handleOpenSimulateExpiry = () => {
    setShowSimulateExpiryModal(true);
  };

  // Demo Control: Execute server-side authoritative expiry timestamp update
  const handleExecuteSimulateExpiry = async (seconds: 15 | 30) => {
    setShowSimulateExpiryModal(false);
    const newExpiresAt = await simulateServerExpiry(session.sessionId, seconds);
    setSession((prev) => ({
      ...prev,
      expiresAt: newExpiresAt,
      status: 'active'
    }));
  };

  // Authoritative countdown reached zero (00:00)
  const handleSessionExpired = () => {
    setSession((prev) => {
      if (prev.status === 'expired') return prev;
      const updated: AccessSession = {
        ...prev,
        status: 'expired'
      };
      saveStoredSessionLocally(updated);
      return updated;
    });
    setViewingRecord(null);
  };

  // Reset entire demo to pristine state
  const handleResetDemo = () => {
    const { session: freshSession, selectedRecords: freshRecords } = resetDemoState();
    setSession(freshSession);
    setActivePatientId('pat-rahul-01');
    setConsultationPurpose('Cardiology consultation');
    setSelectedRecordIds(freshRecords);
    setViewMode('patient');
    setCurrentStep('select_records');
    setViewingRecord(null);
    setShowRevokeModal(false);
    setShowSimulateExpiryModal(false);
    setShowScenarioModal(false);
    setSessionNotFoundId(null);
  };

  // Switch between Patient and Doctor views
  const handleViewChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    if (newMode === 'doctor') {
      if (session.status === 'active') {
        setCurrentStep('doctor_access');
      } else {
        setCurrentStep('doctor_scan');
      }
    } else {
      if (currentStep === 'doctor_scan' || currentStep === 'doctor_access') {
        setCurrentStep('qr_access');
      }
    }
  };

  // Protected document viewing: Verify session authorization against server before opening
  const handleDoctorViewRecord = async (record: MedicalRecord) => {
    if (!session || session.status !== 'active') {
      handleSessionExpired();
      return;
    }
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(session.sessionId)}/report/${encodeURIComponent(record.id)}`);
      if (res.status === 410) {
        handleSessionExpired();
        return;
      }
      if (res.status === 403) {
        setViewingRecord(null);
        return;
      }
      if (res.ok) {
        setViewingRecord(record);
      }
    } catch (e) {
      if (session.status === 'active' && Date.now() < session.expiresAt) {
        setViewingRecord(record);
      } else {
        handleSessionExpired();
      }
    }
  };

  const selectedRecords = patientRecords.filter((r) => selectedRecordIds.includes(r.id));
  const doctorPatient = getPatientById(session.patientId) || DEMO_PATIENTS.find((p) => p.id === session.patientId) || activePatient;
  const doctorPatientRecords = getRecordsByPatientId(doctorPatient.id);

  return (
    <div className="app-container" data-testid="app-root">
      {/* Top Demo Bar */}
      <DemoTopBar
        viewMode={viewMode}
        onViewChange={handleViewChange}
        onResetDemo={handleResetDemo}
        onSimulateExpiry={session.status === 'active' ? handleOpenSimulateExpiry : undefined}
        sessionStatus={session.status}
      />

      {/* Main SaaS Navigation Header */}
      <Header
        viewMode={viewMode}
        currentStep={currentStep}
        onNavigate={(step) => {
          if (step === 'select_records' || step === 'create_access' || step === 'qr_access') {
            setViewMode('patient');
          } else if (step === 'doctor_scan' || step === 'doctor_access') {
            setViewMode('doctor');
          }
          setCurrentStep(step);
        }}
        patient={activePatient}
        doctor={DEMO_DOCTOR}
        hasActiveSession={Boolean(session)}
      />

      <main className="main-content">
        {/* 5-Stage Visual Workflow Stepper */}
        <WorkflowStepper
          currentStep={currentStep}
          sessionStatus={session.status}
          onStepClick={(step) => {
            if (['select_records', 'create_access', 'qr_access'].includes(step)) {
              setViewMode('patient');
            } else {
              setViewMode('doctor');
            }
            setCurrentStep(step);
          }}
        />

        {/* View Routing */}
        {currentStep === 'landing' && (
          <Landing onStartDemo={() => setCurrentStep('select_records')} />
        )}

        {currentStep === 'select_records' && (
          <PatientRecords
            patient={activePatient}
            allPatients={DEMO_PATIENTS}
            onSelectPatient={handleSelectPatient}
            records={patientRecords}
            selectedRecordIds={selectedRecordIds}
            onToggleRecord={handleToggleRecord}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onCreateAccess={() => setCurrentStep('create_access')}
            onPreviewRecord={(rec) => setViewingRecord(rec)}
            onOpenScenarios={() => setShowScenarioModal(true)}
            consultationPurpose={consultationPurpose}
            onChangePurpose={(purpose) => setConsultationPurpose(purpose)}
            onApplySuggestedRecords={handleApplySuggestedRecords}
            suggestedRecordIds={suggestedRecordIds}
          />
        )}

        {currentStep === 'create_access' && (
          <CreateAccess
            doctor={DEMO_DOCTOR}
            selectedRecords={selectedRecords}
            onBack={() => setCurrentStep('select_records')}
            onGenerateQR={handleGenerateQR}
          />
        )}

        {currentStep === 'qr_access' && (
          <QRAccess
            session={session}
            doctor={DEMO_DOCTOR}
            records={patientRecords}
            onSimulateScan={handleSimulateDoctorScan}
            onRevokeSession={handleRevokeSession}
            onSimulateExpiry={handleOpenSimulateExpiry}
            onExpire={handleSessionExpired}
            onRestart={() => setCurrentStep('select_records')}
          />
        )}

        {currentStep === 'doctor_scan' && (
          <DoctorScan
            session={session}
            doctor={DEMO_DOCTOR}
            initialNotFoundId={sessionNotFoundId}
            onScanComplete={handleScanVerificationComplete}
            onResetToDemo={() => setSessionNotFoundId(null)}
          />
        )}

        {currentStep === 'doctor_access' && (
          <DoctorAccess
            session={session}
            patient={doctorPatient}
            doctor={DEMO_DOCTOR}
            allRecords={doctorPatientRecords}
            onViewRecord={handleDoctorViewRecord}
            onSimulateExpiry={handleOpenSimulateExpiry}
            onRevokeAccess={() => setShowRevokeModal(true)}
            onExpire={handleSessionExpired}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Clinical Document Viewer Modal */}
      {viewingRecord && (
        <DocumentViewer
          record={viewingRecord}
          patient={viewingRecord.patientId ? (getPatientById(viewingRecord.patientId) || activePatient) : activePatient}
          onClose={() => setViewingRecord(null)}
        />
      )}

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <RevokeModal
          doctor={DEMO_DOCTOR}
          onCancel={() => setShowRevokeModal(false)}
          onConfirm={() => {
            setShowRevokeModal(false);
            handleRevokeSession();
          }}
        />
      )}

      {/* Demo: Simulate Expiry Modal */}
      {showSimulateExpiryModal && (
        <SimulateExpiryModal
          sessionCode={session.sessionId}
          onSelectSeconds={handleExecuteSimulateExpiry}
          onCancel={() => setShowSimulateExpiryModal(false)}
        />
      )}

      {/* Demo: Scenario Quick Loader Modal */}
      {showScenarioModal && (
        <DemoScenarioModal
          scenarios={DEMO_SCENARIOS}
          patients={DEMO_PATIENTS}
          onSelectScenario={handleSelectScenario}
          onClose={() => setShowScenarioModal(false)}
        />
      )}
    </div>
  );
};

export default App;

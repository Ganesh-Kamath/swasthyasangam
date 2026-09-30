import React, { useState, useEffect } from 'react';
import { AccessSession, Doctor } from '../types';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Camera
} from 'lucide-react';

interface DoctorScanProps {
  session: AccessSession | null;
  doctor: Doctor;
  initialNotFoundId?: string | null;
  onScanComplete: () => void;
  onResetToDemo?: () => void;
}

export const DoctorScan: React.FC<DoctorScanProps> = ({
  session,
  doctor,
  initialNotFoundId = null,
  onScanComplete,
  onResetToDemo
}) => {
  const [sessionCodeInput, setSessionCodeInput] = useState<string>(
    initialNotFoundId || session?.sessionId || 'SS-DEMO-4821'
  );
  const [transitionState, setTransitionState] = useState<'idle' | 'verifying' | 'granted' | 'not_found'>(
    initialNotFoundId ? 'not_found' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    initialNotFoundId
      ? `Session identifier "${initialNotFoundId}" was not found or has invalid authorization.`
      : ''
  );

  useEffect(() => {
    if (initialNotFoundId) {
      setSessionCodeInput(initialNotFoundId);
      setTransitionState('not_found');
      setErrorMessage(`Session identifier "${initialNotFoundId}" was not found or has invalid authorization.`);
    }
  }, [initialNotFoundId]);

  const startVerification = () => {
    setTransitionState('verifying');

    setTimeout(() => {
      // Validate session ID against active session
      if (!session || sessionCodeInput.trim().toUpperCase() !== session.sessionId.toUpperCase()) {
        setTransitionState('not_found');
        setErrorMessage(`Session "${sessionCodeInput}" was not recognized. Please scan the QR code again or check the session identifier.`);
        return;
      }

      setTransitionState('granted');
      setTimeout(() => {
        onScanComplete();
      }, 700);
    }, 1100);
  };

  if (transitionState === 'verifying') {
    return (
      <div className="scan-transition-overlay" data-testid="verifying-transition">
        <div className="scan-spinner" />
        <h2 className="scan-trans-title">VERIFYING ACCESS</h2>
        <p className="scan-trans-desc">
          Validating temporary consent token for session <strong>{sessionCodeInput}</strong>...
        </p>
        <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Session token validation in progress
        </div>
      </div>
    );
  }

  if (transitionState === 'granted') {
    return (
      <div className="scan-transition-overlay" data-testid="granted-transition">
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--emerald-subtle)',
            color: 'var(--emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 className="scan-trans-title" style={{ color: 'var(--emerald-dark)' }}>ACCESS GRANTED</h2>
        <p className="scan-trans-desc">
          Patient authorization verified. Loading permitted clinical records...
        </p>
      </div>
    );
  }

  if (transitionState === 'not_found') {
    return (
      <div className="scan-transition-overlay" data-testid="access-not-found-card">
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--danger-subtle)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
        >
          <AlertTriangle size={32} />
        </div>
        <h2 className="scan-trans-title" style={{ color: 'var(--danger-dark)' }}>ACCESS NOT FOUND</h2>
        <p className="scan-trans-desc" style={{ marginBottom: '24px' }}>
          {errorMessage}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="reset-session-code-btn"
            onClick={() => {
              if (onResetToDemo) {
                onResetToDemo();
              }
              setSessionCodeInput(session?.sessionId || 'SS-DEMO-4821');
              setTransitionState('idle');
            }}
          >
            <RotateCcw size={14} />
            <span>Reset to Demo Session ({session?.sessionId || 'SS-DEMO-4821'})</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card clinical-scanner-card">
        <h1 className="clinical-page-heading" style={{ textAlign: 'center', marginBottom: '6px' }}>
          Access Patient Records
        </h1>
        <p className="clinical-page-subheading" style={{ textAlign: 'center', marginBottom: '24px' }}>
          Scan the patient's QR code to continue consultation with <strong>{doctor.name}</strong>
        </p>

        {/* Viewfinder Mock */}
        <div className="clinical-viewfinder-box">
          <div className="viewfinder-corner top-left" />
          <div className="viewfinder-corner top-right" />
          <div className="viewfinder-corner bottom-left" />
          <div className="viewfinder-corner bottom-right" />

          <QrCode size={72} color="var(--text-subtle)" style={{ opacity: 0.6 }} />
          <span className="viewfinder-status-tag">Optical Scanner Active</span>
        </div>

        {/* Manual Session Identifier Fallback */}
        <div className="manual-session-entry-block">
          <label className="section-micro-label" style={{ textAlign: 'center' }}>
            Session Identifier
          </label>
          <input
            type="text"
            className="form-input-display"
            data-testid="session-code-input"
            value={sessionCodeInput}
            onChange={(e) => setSessionCodeInput(e.target.value)}
            style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '1px' }}
          />
        </div>

        {/* Primary Simulation Fallback Button */}
        <div className="scanner-fallback-prompt-block">
          <span className="fallback-prompt-text">Having trouble with camera scanning in venue?</span>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            data-testid="simulate-scan-connect-btn"
            onClick={startVerification}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            <Camera size={16} />
            <span>Simulate Scan & Connect</span>
          </button>
        </div>

        <div className="scanner-security-disclaimer">
          <ShieldCheck size={14} color="var(--emerald)" />
          <span>Zero health data transmitted over optical QR channel</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ViewMode, DemoStep, Patient, Doctor } from '../types';
import { Stethoscope, User, FileText, QrCode } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  currentStep: DemoStep;
  onNavigate: (step: DemoStep) => void;
  patient: Patient;
  doctor: Doctor;
  hasActiveSession: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  currentStep,
  onNavigate,
  patient,
  doctor,
  hasActiveSession
}) => {
  return (
    <header className="main-header" role="banner">
      <div className="header-inner">
        {/* Refined Abstract Wordmark & Logo */}
        <div className="logo-block" onClick={() => onNavigate('landing')} title="SwasthyaSangam Home">
          <div className="logo-icon-abstract">
            <img src="/logo.png" alt="SwasthyaSangam Logo" className="logo-img" />
          </div>
          <div>
            <div className="logo-title">SwasthyaSangam</div>
            <div className="logo-tagline">Controlled Clinical Access</div>
          </div>
        </div>

        {/* Minimal Navigation */}
        <nav className="header-nav" aria-label="Main Navigation">
          {viewMode === 'patient' ? (
            <>
              <button
                type="button"
                className={`nav-link-btn ${['landing', 'select_records'].includes(currentStep) ? 'active' : ''}`}
                onClick={() => onNavigate('select_records')}
              >
                <FileText size={15} />
                <span>Records</span>
              </button>

              <button
                type="button"
                className={`nav-link-btn ${['create_access', 'qr_access'].includes(currentStep) ? 'active' : ''}`}
                onClick={() => onNavigate(hasActiveSession ? 'qr_access' : 'create_access')}
              >
                <QrCode size={15} />
                <span>Access</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`nav-link-btn ${currentStep === 'doctor_scan' ? 'active' : ''}`}
                onClick={() => onNavigate('doctor_scan')}
              >
                <QrCode size={15} />
                <span>Scan</span>
              </button>

              <button
                type="button"
                className={`nav-link-btn ${currentStep === 'doctor_access' ? 'active' : ''}`}
                onClick={() => onNavigate('doctor_access')}
              >
                <Stethoscope size={15} />
                <span>Consultation</span>
              </button>
            </>
          )}
        </nav>

        {/* User Identity Pill */}
        <div className="user-identity-badge">
          {viewMode === 'patient' ? (
            <>
              <div className="user-avatar-circle">
                <User size={14} />
              </div>
              <div className="user-info-text">
                <div className="user-info-name">{patient.name}</div>
                <div className="user-info-meta">52 Y • {patient.bloodGroup}</div>
              </div>
            </>
          ) : (
            <>
              <div className="user-avatar-circle" style={{ background: 'var(--cyan-dark)' }}>
                <Stethoscope size={14} />
              </div>
              <div className="user-info-text">
                <div className="user-info-name">{doctor.name}</div>
                <div className="user-info-meta">{doctor.specialization}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

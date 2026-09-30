import React from 'react';
import { AccessSession, Patient, Doctor, MedicalRecord } from '../types';
import { AccessTimer } from '../components/AccessTimer';
import { SmartInsights } from '../components/SmartInsights';
import {
  ShieldCheck,
  ShieldOff,
  Clock,
  Building2,
  Eye,
  RotateCcw,
  Lock,
  Activity,
  TestTubes,
  Heart,
  Pill,
  FileText
} from 'lucide-react';

interface DoctorAccessProps {
  session: AccessSession;
  patient: Patient;
  doctor: Doctor;
  allRecords: MedicalRecord[];
  onViewRecord: (record: MedicalRecord) => void;
  onSimulateExpiry: () => void;
  onRevokeAccess: () => void;
  onExpire?: () => void;
  onResetDemo: () => void;
}

export const DoctorAccess: React.FC<DoctorAccessProps> = ({
  session,
  patient,
  doctor,
  allRecords,
  onViewRecord,
  onSimulateExpiry,
  onRevokeAccess,
  onExpire,
  onResetDemo
}) => {
  // If session is revoked
  if (session.status === 'revoked') {
    return (
      <div className="session-status-card" data-testid="access-revoked-card">
        <div className="status-icon-circle danger">
          <ShieldOff size={34} />
        </div>
        <h1 className="status-title" data-testid="status-title-revoked" style={{ color: 'var(--danger)' }}>
          ACCESS REVOKED
        </h1>
        <p className="status-desc">
          The patient has ended this consultation access. No medical records are available through this link. The patient's health records remain safely in their account.
        </p>

        <div className="status-meta-card">
          <div><strong>Session Identifier:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{session.sessionId}</span></div>
          <div><strong>Status:</strong> Immediate revocation enforced by patient</div>
        </div>

        <button type="button" className="btn btn-secondary" data-testid="restart-demo-btn" onClick={onResetDemo}>
          <RotateCcw size={15} />
          <span>Restart Demonstration</span>
        </button>
      </div>
    );
  }

  // If session is expired
  if (session.status === 'expired') {
    return (
      <div className="session-status-card" data-testid="access-expired-card">
        <div className="status-icon-circle amber">
          <Clock size={34} />
        </div>
        <h1 className="status-title" data-testid="status-title-expired" style={{ color: 'var(--amber)' }}>
          🔒 ACCESS EXPIRED
        </h1>
        <p className="status-desc" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          This temporary sharing session has ended.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Records are no longer accessible to the doctor through this link. The patient's medical records remain safely in their account. Only this temporary access session expires.
        </p>

        <div className="status-meta-card">
          <div><strong>Session Identifier:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{session.sessionId}</span></div>
          <div><strong>Duration:</strong> {session.durationMinutes} minutes elapsed</div>
        </div>

        <button type="button" className="btn btn-secondary" data-testid="restart-demo-btn" onClick={onResetDemo}>
          <RotateCcw size={15} />
          <span>Restart Demonstration</span>
        </button>
      </div>
    );
  }

  // Filter records: show strictly the records authorized in the session!
  const sharedRecords = allRecords.filter((rec) => session.recordIds.includes(rec.id));
  const withheldRecords = allRecords.filter((rec) => !session.recordIds.includes(rec.id));

  const getRecordIcon = (category: string) => {
    switch (category) {
      case 'Diagnostic':
        return <Activity size={16} />;
      case 'Laboratory':
        return <TestTubes size={16} />;
      case 'Imaging':
        return <Heart size={16} />;
      case 'Prescription':
        return <Pill size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  // Source-record click handler: match evidence chip label to a record title
  const handleInsightSourceClick = (sourceLabel: string) => {
    const match = sharedRecords.find((r) =>
      sourceLabel.toLowerCase().includes(r.title.toLowerCase().split('(')[0].trim().toLowerCase()) ||
      r.title.toLowerCase().includes(sourceLabel.toLowerCase().split('—')[0].trim().toLowerCase())
    );
    if (match) {
      onViewRecord(match);
    }
  };

  return (
    <div className="doctor-access-container" data-testid="doctor-access-view">
      {/* Persistent Elegant Patient-Controlled Access Banner */}
      <div className="doctor-persistent-banner" data-testid="doctor-view-banner">
        <div className="banner-left-content">
          <span className="banner-security-pill" data-testid="patient-granted-badge">
            <Lock size={12} /> Patient-Controlled Access
          </span>
          <span className="banner-description-text">
            <strong>{patient.name}</strong> shared these records for this consultation.
          </span>
        </div>

        <div className="banner-right-timer" data-testid="doctor-timer-wrap">
          <AccessTimer expiresAt={session.expiresAt} onExpire={onExpire} isCompact={true} prefix="ACCESS ACTIVE •" suffix="remaining" />
        </div>
      </div>

      {/* Patient Identity & Consultation Header */}
      <div className="card doctor-patient-header-card" data-testid="doctor-patient-context-card">
        <div className="doc-patient-top-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <div className="doc-access-verified-tag" data-testid="access-granted-pill">
                <ShieldCheck size={13} color="var(--emerald)" /> ACCESS GRANTED
              </div>
              <AccessTimer expiresAt={session.expiresAt} onExpire={onExpire} isCompact={true} prefix="Expires in:" />
            </div>
            <h1 className="doc-patient-name" data-testid="doctor-patient-name">{patient.name}</h1>
            <div className="doc-patient-vitals" data-testid="doctor-patient-age-gender">
              <span>{patient.age} years</span>
              <span className="vital-sep">·</span>
              <span data-testid="doctor-patient-blood-group">{patient.bloodGroup}</span>
              <span className="vital-sep">·</span>
              <span data-testid="doctor-consultation-purpose">{session.purpose || 'Cardiology consultation'}</span>
            </div>
          </div>

          <div className="doc-physician-col">
            <div className="doc-col-label">Authorized Physician</div>
            <div className="doc-physician-val" data-testid="doctor-physician-name">{doctor.name}</div>
            <div className="doc-hospital-val">{doctor.specialization} • {doctor.hospital.split('&')[0]}</div>
          </div>
        </div>

        {/* Counts & Withheld Records Indicator */}
        <div className="doc-records-count-strip">
          <div className="shared-count-info" data-testid="doctor-shared-records-count">
            Patient-shared records: <strong>{sharedRecords.length} of {allRecords.length} reports ({sharedRecords.length} documents)</strong>
          </div>

          {withheldRecords.length > 0 && (
            <div
              className="withheld-badge-pill"
              data-testid="withheld-records-badge"
              title="Privacy boundary: Unselected records are withheld by patient"
            >
              <Lock size={13} color="var(--emerald)" />
              <span>
                <strong>{withheldRecords.length} withheld</strong> ({withheldRecords.map((r) => r.title).join(', ')})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Smart Clinical Insights — using dedicated SmartInsights component */}
      <SmartInsights
        sessionId={session.sessionId}
        onExpire={onExpire}
        onClickSource={handleInsightSourceClick}
      />

      {/* Medical Evidence Section Header */}
      <div className="doc-section-header">
        <h2 className="doc-section-title">Longitudinal Medical Evidence Timeline</h2>
        <span className="doc-section-sub">Chronological diagnostic history authorized for this consult</span>
      </div>

      {/* Medical Timeline Layout */}
      <div className="clinical-timeline" data-testid="doctor-shared-records-list">
        {sharedRecords.length === 0 ? (
          <div className="timeline-empty-card">
            No records were authorized by the patient for this session.
          </div>
        ) : (
          sharedRecords.map((record, idx) => (
            <div
              key={record.id}
              className="timeline-item"
              data-testid={`doctor-record-card-${record.id}`}
            >
              {/* Timeline Stem & Node */}
              <div className="timeline-spine">
                <div className={`timeline-marker ${record.category}`}>
                  {getRecordIcon(record.category)}
                </div>
                {idx < sharedRecords.length - 1 && <div className="timeline-connector-line" />}
              </div>

              {/* Timeline Content Card */}
              <div className="timeline-content-card">
                <div className="timeline-card-header">
                  <div>
                    <div className="timeline-date-label">{record.date.toUpperCase()}</div>
                    <h3 className="timeline-record-title" data-testid={`doctor-record-name-${record.id}`}>
                      {record.title}
                    </h3>
                  </div>

                  <span className={`clinical-type-pill ${record.category}`}>
                    {record.category}
                  </span>
                </div>

                <div className="timeline-meta-row">
                  <span className="timeline-source">
                    <Building2 size={13} /> {record.source}
                  </span>
                  {record.doctorName && (
                    <>
                      <span className="timeline-meta-dot">•</span>
                      <span>{record.doctorName}</span>
                    </>
                  )}
                </div>

                <p className="timeline-summary-snippet">
                  {record.summary}
                </p>

                <div className="timeline-card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    data-testid={`view-report-btn-${record.id}`}
                    onClick={() => onViewRecord(record)}
                  >
                    <Eye size={13} />
                    <span>View Report</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Presentation Demonstration Controls Strip */}
      <div className="doctor-demo-controls-strip">
        <span className="controls-label">
          <strong>Demonstration Controls:</strong> Test live privacy mechanisms during judging
        </span>

        <div className="controls-btn-group">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            data-testid="doctor-revoke-access-btn"
            onClick={onRevokeAccess}
            title="Simulate patient immediately revoking session"
          >
            <ShieldOff size={13} />
            <span>Revoke Access</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            data-testid="doctor-simulate-expiry-btn"
            onClick={onSimulateExpiry}
            title="Fast-forward timer to verify access cutoff"
          >
            <Clock size={13} />
            <span>Simulate Expiry</span>
          </button>
        </div>
      </div>
    </div>
  );
};

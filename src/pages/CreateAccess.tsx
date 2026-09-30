import React, { useState } from 'react';
import { Doctor, MedicalRecord } from '../types';
import { Stethoscope, ShieldCheck, ArrowLeft, ArrowRight, QrCode, Lock, Clock } from 'lucide-react';

interface CreateAccessProps {
  doctor: Doctor;
  selectedRecords: MedicalRecord[];
  onBack: () => void;
  onGenerateQR: (durationMinutes: number, purpose: string) => void;
}

export const CreateAccess: React.FC<CreateAccessProps> = ({
  doctor,
  selectedRecords,
  onBack,
  onGenerateQR
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [purpose, setPurpose] = useState<string>('Cardiology consultation');

  const durationOptions = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' }
  ];

  return (
    <div className="create-access-container" data-testid="create-access-view">
      <div className="card clinical-form-card">
        {/* Back Link */}
        <button
          type="button"
          data-testid="back-to-records-btn"
          className="btn-back-link"
          onClick={onBack}
        >
          <ArrowLeft size={15} />
          <span>Back to Record Selection</span>
        </button>

        {/* Primary Page Heading */}
        <h1 className="clinical-page-heading">Create Consultation Access</h1>

        {/* Focused Context Statement */}
        <div className="access-context-statement">
          You're sharing <strong>{selectedRecords.length} records</strong> with <strong>{doctor.name}</strong> for a {purpose.toLowerCase()}.
        </div>

        {/* Doctor Summary & Scope */}
        <div className="doctor-context-summary-strip">
          <div className="doctor-badge-avatar">
            <Stethoscope size={20} />
          </div>
          <div>
            <div className="doctor-display-name" data-testid="doctor-name-display">{doctor.name}</div>
            <div className="doctor-display-spec">{doctor.specialization} • {doctor.hospital.split('&')[0]}</div>
          </div>
        </div>

        {/* Selected Records List */}
        <div className="form-section-block">
          <div className="section-micro-label">Authorized Clinical Records ({selectedRecords.length})</div>
          <div className="selected-chips-row" data-testid="selected-records-chips">
            {selectedRecords.map((r) => (
              <span key={r.id} className="selected-chip-badge" data-testid={`selected-chip-${r.id}`}>
                ✓ {r.title}
              </span>
            ))}
          </div>
        </div>

        {/* Duration Segmented Control */}
        <div className="form-section-block">
          <div className="section-micro-label">Access Duration</div>
          <div className="segmented-control-group">
            {durationOptions.map((opt) => {
              const isSelected = durationMinutes === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`segmented-control-btn ${isSelected ? 'active' : ''}`}
                  data-testid={`duration-option-${opt.value}`}
                  onClick={() => setDurationMinutes(opt.value)}
                >
                  <Clock size={14} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Compact Panel */}
        <div className="clinical-security-panel">
          <div className="security-panel-header">
            <Lock size={16} color="var(--emerald-dark)" />
            <span className="security-panel-title">Temporary patient-controlled access</span>
          </div>
          <p className="security-panel-body">
            Only the records you selected will be available. Access automatically ends after the selected duration.
          </p>
        </div>

        {/* Action Row with Obvious Primary CTA */}
        <div className="access-form-actions-row">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            data-testid="generate-qr-access-btn"
            onClick={() => onGenerateQR(durationMinutes, purpose)}
          >
            <QrCode size={18} />
            <span>Generate Secure QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

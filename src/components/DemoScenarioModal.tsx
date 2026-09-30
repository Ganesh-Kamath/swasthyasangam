import React from 'react';
import { DemoScenario, Patient } from '../types';
import { Sparkles, X, Check, ArrowRight, User, Stethoscope, Heart, Activity } from 'lucide-react';

interface DemoScenarioModalProps {
  scenarios: DemoScenario[];
  patients: Patient[];
  onSelectScenario: (scenario: DemoScenario) => void;
  onClose: () => void;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({
  scenarios,
  patients,
  onSelectScenario,
  onClose
}) => {
  const getPatient = (patientId: string) => {
    return patients.find((p) => p.id === patientId) || patients[0];
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" data-testid="demo-scenario-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--cyan-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan-dark)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div className="modal-title">Load Demo Scenario</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Preconfigured clinical demonstration setups for presentation speed
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            data-testid="close-scenario-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scenarios.map((sc) => {
              const p = getPatient(sc.patientId);
              return (
                <div
                  key={sc.id}
                  className="scenario-card"
                  data-testid={`scenario-card-${sc.id}`}
                  onClick={() => onSelectScenario(sc)}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--cyan)';
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>{sc.title}</strong>
                      <span className="demo-pill" style={{ fontSize: '10px' }}>
                        {p.name} ({p.age} Y, {p.bloodGroup})
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {sc.description}
                    </p>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--cyan-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Stethoscope size={12} />
                      <span><strong>Purpose:</strong> {sc.purpose} • <strong>{sc.recommendedRecordIds.length} records</strong> pre-selected</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    data-testid={`select-scenario-btn-${sc.id}`}
                    style={{ flexShrink: 0, padding: '6px 12px', fontSize: '12px' }}
                  >
                    <span>Load</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            You can still manually modify selections after loading a scenario.
          </span>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

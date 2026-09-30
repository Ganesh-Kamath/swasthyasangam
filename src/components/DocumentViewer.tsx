import React from 'react';
import { MedicalRecord, Patient } from '../types';
import {
  X,
  FileText,
  Building2,
  Calendar,
  User,
  Stethoscope,
  ShieldAlert,
  Tag,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface DocumentViewerProps {
  record: MedicalRecord | null;
  patient: Patient;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ record, patient, onClose }) => {
  if (!record) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" data-testid="doc-viewer-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <div className="modal-title" data-testid="modal-doc-title">{record.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span className="doc-watermark-badge" data-testid="demo-watermark-badge">
                  <ShieldAlert size={12} />
                  DEMO DATA — NOT REAL MEDICAL RECORD
                </span>
                <span className={`record-category-badge ${record.category}`}>
                  {record.category} Report
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            data-testid="close-doc-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Prominent Provenance & Source Metadata Bar */}
          <div
            data-testid="provenance-metadata-bar"
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                Source Facility & Dept
              </div>
              <div data-testid="doc-source-facility" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <Building2 size={14} color="var(--cyan-dark)" />
                {record.source} {record.department ? `• ${record.department}` : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                Document Date
              </div>
              <div data-testid="doc-record-date" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <Calendar size={14} color="var(--cyan-dark)" />
                {record.date} {record.year ? `(${record.year})` : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                Document Type
              </div>
              <div data-testid="doc-category-type" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <Tag size={14} color="var(--cyan-dark)" />
                {record.category} {record.filterType ? `(${record.filterType})` : ''}
              </div>
            </div>
          </div>

          {/* Clinical Patient Identity Grid */}
          <div className="clinical-patient-grid" data-testid="clinical-patient-grid">
            <div>
              <span className="patient-item-label">Patient Name</span>
              <span className="patient-item-value" data-testid="doc-patient-name">{patient.name}</span>
            </div>
            <div>
              <span className="patient-item-label">Age / Gender</span>
              <span className="patient-item-value">{patient.age} Y / {patient.gender}</span>
            </div>
            <div>
              <span className="patient-item-label">Blood Group</span>
              <span className="patient-item-value">{patient.bloodGroup}</span>
            </div>
            <div>
              <span className="patient-item-label">Document ID</span>
              <span className="patient-item-value" data-testid="doc-id-display" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {record.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Structured Clinical Findings */}
          {record.details.findings && record.details.findings.length > 0 && (
            <div className="clinical-findings-box" data-testid="clinical-findings-box">
              <div className="doc-section-title">Clinical Findings & Summary</div>
              {record.details.findings.map((f, i) => (
                <div key={i} className="finding-item" data-testid={`finding-item-${i}`}>
                  <span className="finding-bullet">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quantitative Lab Metrics with Status Badges & Biological Reference Ranges */}
          {record.details.metrics && record.details.metrics.length > 0 && (
            <div style={{ marginBottom: '20px' }} data-testid="metrics-table-wrapper">
              <div className="doc-section-title">Quantitative Parameters & Reference Intervals</div>
              <table className="metrics-table" data-testid="doc-metrics-table">
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Measured Result</th>
                    <th>Biological Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {record.details.metrics.map((m, i) => (
                    <tr key={i} data-testid={`metric-row-${i}`}>
                      <td><strong>{m.label}</strong></td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                          {m.value} {m.unit || ''}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{m.refRange || '—'}</td>
                      <td>
                        {m.status && (
                          <span className={`metric-status-tag ${m.status}`}>
                            {m.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Prescription Medications if applicable */}
          {record.details.medications && record.details.medications.length > 0 && (
            <div style={{ marginBottom: '20px' }} data-testid="medications-table-wrapper">
              <div className="doc-section-title">Prescribed Medication Regimen</div>
              <table className="rx-table" data-testid="doc-rx-table">
                <thead>
                  <tr>
                    <th>Medication / Salt</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {record.details.medications.map((med, i) => (
                    <tr key={i} data-testid={`med-row-${i}`}>
                      <td className="rx-med-name">{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Doctor Advice / Lifestyle Recommendations */}
          {record.details.advice && record.details.advice.length > 0 && (
            <div style={{ marginBottom: '20px' }} data-testid="doc-advice-box">
              <div className="doc-section-title">Physician Advice & Follow-Up</div>
              <div className="clinical-findings-box" style={{ background: '#F8FAFC' }}>
                {record.details.advice.map((adv, i) => (
                  <div key={i} className="finding-item">
                    <CheckCircle size={14} color="var(--emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Diagnostic Notes & Impression */}
          {record.details.impression && (
            <div className="clinical-notes-box" data-testid="doc-impression-box" style={{ marginBottom: '16px', background: '#F0FDF4', borderColor: 'var(--emerald)' }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--emerald-dark)' }}>
                Clinical Diagnostic Impression:
              </strong>
              {record.details.impression}
            </div>
          )}

          {record.details.clinicalNotes && (
            <div className="clinical-notes-box" data-testid="doc-notes-box">
              <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary)' }}>
                Clinical Findings & Physician Notes:
              </strong>
              {record.details.clinicalNotes}
            </div>
          )}

          {/* Footer Provenance Stamp */}
          <div className="doc-footer-source" data-testid="doc-footer-provenance">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="var(--text-muted)" />
              <span><strong>Preserved Source:</strong> {record.source}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <span><strong>Document Date:</strong> {record.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Stethoscope size={14} color="var(--text-muted)" />
              <span><strong>Signing Clinician:</strong> {record.doctorName || 'Laboratory Consultant'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-testid="modal-close-bottom-btn" onClick={onClose}>
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};

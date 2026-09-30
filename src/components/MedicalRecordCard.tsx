import React from 'react';
import { MedicalRecord } from '../types';
import { Check, Calendar, Building2, Stethoscope, Eye, FileText, Activity, TestTubes, Heart, Pill } from 'lucide-react';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  selected: boolean;
  onToggle: (id: string) => void;
  onPreview: (record: MedicalRecord) => void;
}

export const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  selected,
  onToggle,
  onPreview
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Diagnostic':
        return <Activity size={18} />;
      case 'Laboratory':
        return <TestTubes size={18} />;
      case 'Imaging':
        return <Heart size={18} />;
      case 'Prescription':
        return <Pill size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div
      className={`clinical-record-card ${selected ? 'is-selected selected' : ''}`}
      data-testid={`record-card-${record.id}`}
      onClick={() => onToggle(record.id)}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle(record.id);
        }
      }}
    >
      <div className="record-card-main-body">
        {/* Top: Document Icon, Category Badge & Checkbox */}
        <div className="record-header-strip">
          <div className="record-identity-group">
            <div className={`record-doc-icon-frame ${record.category}`}>
              {getCategoryIcon(record.category)}
            </div>
            <div>
              <span className={`clinical-type-pill ${record.category}`}>
                {record.category} Report
              </span>
              <h3 className="record-card-title" data-testid={`record-title-${record.id}`}>
                {record.title}
              </h3>
            </div>
          </div>

          <div
            className={`record-select-checkbox ${selected ? 'checked' : ''}`}
            data-testid={`record-checkbox-${record.id}`}
            aria-label={selected ? 'Deselect record' : 'Select record'}
          >
            {selected ? <Check size={14} strokeWidth={3} /> : null}
          </div>
        </div>

        {/* Middle Metadata: Date & Preserved Source Facility */}
        <div className="record-meta-line">
          <div className="record-meta-chunk">
            <Calendar size={13} color="var(--text-muted)" />
            <span>{record.date}</span>
          </div>
          <span className="record-meta-sep">•</span>
          <div className="record-meta-chunk">
            <Building2 size={13} color="var(--text-muted)" />
            <span>{record.source}</span>
          </div>
        </div>

        {/* Clinical Summary Note */}
        <p className="record-snippet-text">
          {record.summary}
        </p>
      </div>

      {/* Footer: Selection Status & View Details Modal Trigger */}
      <div className="record-card-actions-bar">
        <div className="record-selected-status-label">
          {selected ? (
            <span className="selected-indicator-text">
              <span className="selected-dot" /> Selected for sharing
            </span>
          ) : (
            <span className="withheld-indicator-text">Not selected (private)</span>
          )}
        </div>

        <button
          type="button"
          className="btn-preview-record"
          data-testid={`record-preview-btn-${record.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(record);
          }}
          title="Preview complete clinical report"
        >
          <Eye size={13} />
          <span>View Report</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { MedicalRecord, Patient, DemoScenario } from '../types';
import { MedicalRecordCard } from '../components/MedicalRecordCard';
import {
  Shield,
  ArrowRight,
  CheckSquare,
  Square,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  User,
  Stethoscope,
  Clock,
  ChevronDown,
  Layers,
  ShieldAlert
} from 'lucide-react';

interface PatientRecordsProps {
  patient: Patient;
  allPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  records: MedicalRecord[];
  selectedRecordIds: string[];
  onToggleRecord: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCreateAccess: () => void;
  onPreviewRecord: (record: MedicalRecord) => void;
  onOpenScenarios: () => void;
  consultationPurpose: string;
  onChangePurpose: (purpose: string) => void;
  onApplySuggestedRecords: () => void;
  suggestedRecordIds: string[];
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  patient,
  allPatients,
  onSelectPatient,
  records,
  selectedRecordIds,
  onToggleRecord,
  onSelectAll,
  onClearSelection,
  onCreateAccess,
  onPreviewRecord,
  onOpenScenarios,
  consultationPurpose,
  onChangePurpose,
  onApplySuggestedRecords,
  suggestedRecordIds
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'category'>('newest');

  const filterCategories = [
    'All',
    'Cardiology',
    'Blood Tests',
    'Imaging',
    'Prescriptions',
    'Consultations'
  ];

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Category filter
      if (activeFilter !== 'All') {
        const matchesCategory =
          rec.filterType === activeFilter ||
          rec.category === activeFilter ||
          (activeFilter === 'Blood Tests' && (rec.category === 'Laboratory' || rec.title.includes('Blood') || rec.title.includes('Lipid') || rec.title.includes('Glucose') || rec.title.includes('HbA1c') || rec.title.includes('LFT') || rec.title.includes('KFT') || rec.title.includes('CBC'))) ||
          (activeFilter === 'Cardiology' && (rec.category === 'Diagnostic' || rec.filterType === 'Cardiology' || rec.title.includes('ECG') || rec.title.includes('Echocardiogram') || rec.title.includes('Lipid') || rec.title.includes('Cardiology') || rec.title.includes('Blood Pressure') || rec.title.includes('Troponin'))) ||
          (activeFilter === 'Imaging' && (rec.category === 'Imaging' || rec.title.includes('Echo') || rec.title.includes('Ultrasound') || rec.title.includes('X-Ray'))) ||
          (activeFilter === 'Prescriptions' && rec.category === 'Prescription') ||
          (activeFilter === 'Consultations' && (rec.category === 'Consultation' || rec.title.includes('Consultation')));

        if (!matchesCategory) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = rec.title.toLowerCase().includes(query);
        const inSource = rec.source.toLowerCase().includes(query);
        const inDoctor = (rec.doctorName || '').toLowerCase().includes(query);
        const inSummary = rec.summary.toLowerCase().includes(query);
        const inFindings = (rec.details?.findings || []).some((f) => f.toLowerCase().includes(query));
        const inMetrics = (rec.details?.metrics || []).some((m) => m.label.toLowerCase().includes(query));

        if (!inTitle && !inSource && !inDoctor && !inSummary && !inFindings && !inMetrics) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeFilter, searchQuery]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (sortBy === 'newest') {
        const yearDiff = (b.year || 2026) - (a.year || 2026);
        if (yearDiff !== 0) return yearDiff;
        return b.date.localeCompare(a.date);
      }
      if (sortBy === 'oldest') {
        const yearDiff = (a.year || 2026) - (b.year || 2026);
        if (yearDiff !== 0) return yearDiff;
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'category') {
        return (a.filterType || a.category).localeCompare(b.filterType || b.category);
      }
      return 0;
    });
  }, [filteredRecords, sortBy]);

  const selectedCount = selectedRecordIds.length;
  const allSelected = selectedCount === records.length && records.length > 0;
  const selectedRecords = records.filter((r) => selectedRecordIds.includes(r.id));

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: records.length };
    filterCategories.slice(1).forEach((cat) => {
      counts[cat] = records.filter((r) => {
        if (cat === 'Blood Tests') return r.filterType === 'Blood Tests' || r.category === 'Laboratory';
        if (cat === 'Cardiology') return r.filterType === 'Cardiology' || r.title.includes('ECG') || r.title.includes('Echo') || r.title.includes('Lipid');
        if (cat === 'Imaging') return r.category === 'Imaging' || r.filterType === 'Imaging';
        if (cat === 'Prescriptions') return r.category === 'Prescription';
        if (cat === 'Consultations') return r.category === 'Consultation';
        return r.filterType === cat || r.category === cat;
      }).length;
    });
    return counts;
  }, [records]);

  return (
    <div className="patient-records-view-container" data-testid="patient-records-view">
      {/* Demo Data Alert Strip & Quick Controls */}
      <div
        className="demo-strip-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#F8FAFC',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="doc-watermark-badge" data-testid="demo-data-indicator" style={{ background: '#EFF6FF', color: 'var(--primary)', borderColor: 'var(--border)' }}>
            <ShieldAlert size={12} color="var(--primary)" />
            DEMO MEDICAL RECORDS LIBRARY • 100% FICTIONAL DATA
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Choose fictional patients, explore longitudinal timelines, and test selective sharing.
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          data-testid="load-demo-scenario-btn"
          onClick={onOpenScenarios}
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan-dark)',
            background: '#FFFFFF',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} color="var(--cyan)" />
          <span>Load Demo Scenario</span>
        </button>
      </div>

      {/* Patient Profile Card & Patient Switcher */}
      <div
        className="card patient-profile-card"
        data-testid="patient-profile-card"
        style={{
          padding: '18px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(to right, #FFFFFF, #F8FAFC)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.6px', marginBottom: '4px' }}>
              Active Patient Profile
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px'
                }}
              >
                {patient.name.charAt(0)}
              </div>
              <div>
                <h1 className="records-main-title" data-testid="patient-title" style={{ margin: 0, fontSize: '22px' }}>
                  {patient.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <span>{patient.age} Y • {patient.gender}</span>
                  <span>•</span>
                  <span>Blood Group: <strong>{patient.bloodGroup}</strong></span>
                  <span>•</span>
                  <span style={{ color: 'var(--cyan-dark)', fontWeight: 600 }}>Primary: {patient.primaryContext}</span>
                  {patient.abhaId && (
                    <>
                      <span>•</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-muted)' }}>ABHA: {patient.abhaId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Switch Patient Pills */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.6px', marginBottom: '6px' }}>
              Switch Fictional Patient:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} data-testid="patient-switcher-pills">
              {allPatients.map((p) => {
                const isActive = p.id === patient.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    data-testid={`switch-patient-btn-${p.id}`}
                    onClick={() => onSelectPatient(p.id)}
                    style={{
                      fontSize: '12px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ opacity: 0.75, fontSize: '10.5px' }}>({p.primaryContext?.split(' ')[0]})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Purpose & Smart Suggestion Bar */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: '20px',
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <Stethoscope size={18} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              Consultation Purpose
            </div>
            <select
              className="consultation-purpose-select"
              data-testid="consultation-purpose-select"
              value={consultationPurpose}
              onChange={(e) => onChangePurpose(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--primary)',
                padding: '2px 0',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="Remote Cardiology Consultation">Remote Cardiology Consultation</option>
              <option value="Review historical cardiac records">Longitudinal Cardiac Review</option>
              <option value="Endocrinology & diabetes review">Diabetes & Metabolic Review</option>
              <option value="General medical consultation">General Medicine Consultation</option>
              <option value="Pre-operative clearance">Pre-operative Diagnostic Clearance</option>
            </select>
          </div>
        </div>

        {/* Smart Record Suggestions */}
        <div
          data-testid="suggested-records-prompt"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#F0FDF4',
            border: '1px solid #DCFCE7',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12.5px'
          }}
        >
          <span style={{ color: '#166534' }}>
            <strong>Suggested:</strong> {suggestedRecordIds.length} relevant records for {consultationPurpose.split(' ')[0].toLowerCase()}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            data-testid="apply-suggested-btn"
            onClick={onApplySuggestedRecords}
            style={{ fontSize: '11.5px', padding: '3px 8px', background: '#FFFFFF', borderColor: '#BBF7D0', color: '#15803D' }}
          >
            Select Suggested
          </button>
        </div>
      </div>

      {/* Search, Filter Tabs & Sorting Toolbar */}
      <div
        className="records-toolbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {/* Row 1: Search Input & Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search records by title, doctor, facility, findings, or metrics..."
              data-testid="records-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                fontSize: '13px',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Sort:</span>
              <select
                data-testid="records-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 10px',
                  fontSize: '12px',
                  color: 'var(--primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First (Longitudinal)</option>
                <option value="category">Record Type</option>
              </select>
            </div>

            {/* Select All / Clear Selection Controls */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              data-testid="toggle-select-all-btn"
              onClick={allSelected ? onClearSelection : onSelectAll}
            >
              {allSelected ? <Square size={13} /> : <CheckSquare size={13} />}
              <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
            </button>

            {selectedCount > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                data-testid="clear-selection-btn"
                onClick={onClearSelection}
                title="Deselect all records"
                style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filterCategories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isCatActive = activeFilter === cat;
            const pillId = `filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <button
                type="button"
                key={cat}
                data-testid={pillId}
                className={`category-filter-pill ${isCatActive ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
                style={{
                  background: isCatActive ? 'var(--primary)' : '#FFFFFF',
                  color: isCatActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${isCatActive ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{cat}</span>
                <span style={{ fontSize: '10.5px', opacity: isCatActive ? 0.9 : 0.6, background: isCatActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)', padding: '1px 6px', borderRadius: '10px' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Medical Records */}
      {sortedRecords.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: '#FFFFFF',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Filter size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>No medical records match your filter criteria</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Try clearing the search query or selecting "All"</div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
            style={{ marginTop: '12px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="clinical-records-grid" data-testid="patient-records-grid">
          {sortedRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              selected={selectedRecordIds.includes(record.id)}
              onToggle={onToggleRecord}
              onPreview={onPreviewRecord}
            />
          ))}
        </div>
      )}

      {/* Persistent Selection Summary Bar */}
      <div className="persistent-selection-bar" data-testid="selection-action-bar">
        <div className="selection-summary-details">
          <div className="selection-count-badge">
            <span className="count-num" data-testid="selection-count-indicator">
              {selectedCount} of {records.length} records selected
            </span>
          </div>

          <div className="selected-titles-preview" data-testid="selection-status-subtext">
            {selectedCount === 0 ? (
              <span className="selection-warning-text">
                <AlertCircle size={14} /> Select at least one record to continue.
              </span>
            ) : (
              <span className="selected-names-list">
                {selectedRecords.map((r) => r.title).join(' • ')}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          data-testid="create-temporary-access-btn"
          disabled={selectedCount === 0}
          onClick={onCreateAccess}
          title={selectedCount === 0 ? 'Select at least one record to continue' : 'Proceed to access configuration'}
        >
          <span>Create Temporary Access</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

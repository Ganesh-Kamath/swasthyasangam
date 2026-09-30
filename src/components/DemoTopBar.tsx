import React from 'react';
import { ViewMode, SessionStatus } from '../types';
import { User, Stethoscope, RotateCcw, Clock, Shield } from 'lucide-react';

interface DemoTopBarProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onResetDemo: () => void;
  onSimulateExpiry?: () => void;
  sessionStatus?: SessionStatus;
}

export const DemoTopBar: React.FC<DemoTopBarProps> = ({
  viewMode,
  onViewChange,
  onResetDemo,
  onSimulateExpiry,
  sessionStatus
}) => {
  return (
    <div className="demo-top-bar" data-testid="demo-top-bar">
      <div className="demo-badge-wrap">
        <span className="demo-pill" data-testid="demo-mode-pill">
          <Shield size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
          DEMO ENVIRONMENT
        </span>
        <span className="demo-not-real-badge" data-testid="demo-data-badge">
          Fictional Clinical Dataset
        </span>
      </div>

      <div className="demo-controls">
        <div className="view-switcher-group" title="Toggle between Patient and Doctor perspectives">
          <button
            type="button"
            className={`view-switch-btn ${viewMode === 'patient' ? 'active' : ''}`}
            data-testid="switch-patient-view-btn"
            onClick={() => onViewChange('patient')}
          >
            <User size={13} />
            <span>Patient View</span>
          </button>
          <button
            type="button"
            className={`view-switch-btn ${viewMode === 'doctor' ? 'active' : ''}`}
            data-testid="switch-doctor-view-btn"
            onClick={() => onViewChange('doctor')}
          >
            <Stethoscope size={13} />
            <span>Doctor View</span>
          </button>
        </div>

        {sessionStatus === 'active' && onSimulateExpiry && (
          <button
            type="button"
            className="btn-demo-action"
            data-testid="top-simulate-expiry-btn"
            onClick={onSimulateExpiry}
            title="Fast-forward countdown to test expired access behavior"
          >
            <Clock size={13} />
            <span>Demo: Simulate Expiry</span>
          </button>
        )}

        <button
          type="button"
          className="btn-demo-action"
          data-testid="top-reset-demo-btn"
          onClick={onResetDemo}
          title="Reset demo to initial starting state"
        >
          <RotateCcw size={13} />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
};

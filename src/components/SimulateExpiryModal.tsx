import React from 'react';
import { Clock, Zap, X, ShieldAlert } from 'lucide-react';

interface SimulateExpiryModalProps {
  onSelectSeconds: (seconds: 15 | 30) => void;
  onCancel: () => void;
  sessionCode?: string;
}

export const SimulateExpiryModal: React.FC<SimulateExpiryModalProps> = ({
  onSelectSeconds,
  onCancel,
  sessionCode
}) => {
  return (
    <div className="modal-backdrop" data-testid="simulate-expiry-modal" onClick={onCancel}>
      <div
        className="modal-box"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="demo-pill" style={{ fontSize: '10px', padding: '2px 8px' }}>
                DEMO CONTROL
              </span>
              <h2 className="modal-title" style={{ margin: 0, fontSize: '18px' }}>
                Simulate Expiry
              </h2>
            </div>
            <p className="modal-subtitle" style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Updates server-side expiration timestamp for session <strong>{sessionCode || 'SS-4821'}</strong>.
            </p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onCancel} title="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              marginBottom: '16px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            <ShieldAlert size={14} style={{ color: 'var(--amber)', verticalAlign: '-2px', marginRight: '6px' }} />
            The actual session expiry timestamp will be modified server-side. Medical records remain safe in the patient account; only the access permission window expires.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              data-testid="expire-15s-btn"
              onClick={() => onSelectSeconds(15)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                textAlign: 'left',
                borderColor: '#E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3F2',
                    color: '#D92D20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  15s
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>15 Seconds</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fast stage demonstration</div>
                </div>
              </div>
              <Zap size={16} color="var(--amber)" />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              data-testid="expire-30s-btn"
              onClick={() => onSelectSeconds(30)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                textAlign: 'left',
                borderColor: '#E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFBEB',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  30s
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>30 Seconds</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Allows phone scanning before expiry</div>
                </div>
              </div>
              <Clock size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', padding: '14px 24px', background: '#F8FAFC' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

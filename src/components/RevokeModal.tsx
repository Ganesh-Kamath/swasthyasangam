import React from 'react';
import { Doctor } from '../types';
import { AlertTriangle, ShieldOff } from 'lucide-react';

interface RevokeModalProps {
  doctor: Doctor;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RevokeModal: React.FC<RevokeModalProps> = ({ doctor, onCancel, onConfirm }) => {
  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" data-testid="revoke-modal">
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="modal-title" data-testid="revoke-modal-title">Revoke access?</div>
          </div>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>{doctor.name}</strong> ({doctor.specialization}) will immediately lose all access to the records shared in this session.
          </p>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
            Your medical records remain safely stored in your account. Only this temporary consultation permission will be ended.
          </p>
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--danger-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldOff size={16} />
            <span>The QR code will become instantly invalid.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="cancel-revoke-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            data-testid="confirm-revoke-btn"
            onClick={onConfirm}
          >
            Revoke Access
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AccessSession, Doctor, MedicalRecord } from '../types';
import { QRAccessCard } from '../components/QRAccessCard';
import { RevokeModal } from '../components/RevokeModal';
import { AccessHistory } from '../components/AccessHistory';
import { ShieldOff, Clock, ArrowRight, RotateCcw } from 'lucide-react';


interface QRAccessProps {
  session: AccessSession;
  doctor: Doctor;
  records: MedicalRecord[];
  onSimulateScan: () => void;
  onRevokeSession: () => void;
  onSimulateExpiry: () => void;
  onExpire?: () => void;
  onRestart: () => void;
}

export const QRAccess: React.FC<QRAccessProps> = ({
  session,
  doctor,
  records,
  onSimulateScan,
  onRevokeSession,
  onSimulateExpiry,
  onExpire,
  onRestart
}) => {
  const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);

  const selectedCount = session.recordIds.length;
  const totalCount = records.length;

  if (session.status === 'revoked') {
    return (
      <div className="session-status-card">
        <div className="status-icon-circle danger">
          <ShieldOff size={34} />
        </div>
        <h1 className="status-title" style={{ color: 'var(--danger)' }}>Access Revoked</h1>
        <p className="status-desc">
          This consultation access has been revoked. The temporary QR code is now invalid and no medical records can be accessed through this link. Your medical records remain safely preserved in your account.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            <RotateCcw size={16} />
            Create New Session
          </button>
        </div>
      </div>
    );
  }

  if (session.status === 'expired') {
    return (
      <div className="session-status-card" data-testid="patient-access-expired-card">
        <div className="status-icon-circle amber">
          <Clock size={34} />
        </div>
        <h1 className="status-title" data-testid="status-title-expired" style={{ color: 'var(--amber)' }}>Access Expired</h1>
        <p className="status-desc">
          This temporary sharing session has ended. Your medical records remain safely in your account. Only this temporary access session expires.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-primary" data-testid="create-new-session-btn" onClick={onRestart}>
            <RotateCcw size={16} />
            Generate New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-view-container">
      <QRAccessCard
        session={session}
        doctor={doctor}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSimulateScan={onSimulateScan}
        onRequestRevoke={() => setShowRevokeModal(true)}
        onSimulateExpiry={onSimulateExpiry}
        onExpire={onExpire}
      />

      {/* Access History: patient sees real-time server-verified audit trail */}
      <AccessHistory sessionId={session.sessionId} />

      {showRevokeModal && (
        <RevokeModal
          doctor={doctor}
          onCancel={() => setShowRevokeModal(false)}
          onConfirm={() => {
            setShowRevokeModal(false);
            onRevokeSession();
          }}
        />
      )}
    </div>
  );
};


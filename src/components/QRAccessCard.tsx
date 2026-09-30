import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AccessSession, Doctor } from '../types';
import { AccessTimer } from './AccessTimer';
import { getDoctorAccessUrl } from '../utils/sessionManager';
import {
  Stethoscope,
  ShieldCheck,
  Copy,
  Check,
  ShieldOff,
  Sparkles,
  Clock,
  Lock,
  Camera,
  Info,
  ExternalLink
} from 'lucide-react';

interface QRAccessCardProps {
  session: AccessSession;
  doctor: Doctor;
  selectedCount: number;
  totalCount: number;
  onSimulateScan: () => void;
  onRequestRevoke: () => void;
  onSimulateExpiry: () => void;
  onExpire?: () => void;
}

export const QRAccessCard: React.FC<QRAccessCardProps> = ({
  session,
  doctor,
  selectedCount,
  totalCount,
  onSimulateScan,
  onRequestRevoke,
  onSimulateExpiry,
  onExpire
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Pure session pointer URL: Zero health data, pure authenticated access token
  const qrPayload = getDoctorAccessUrl(session.sessionId);

  const copySessionId = () => {
    navigator.clipboard?.writeText(session.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDoctorUrl = () => {
    navigator.clipboard?.writeText(qrPayload);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="hero-qr-surface" data-testid="qr-access-card">
      {/* Top Heading Hierarchy */}
      <div className="hero-qr-header">
        <h1 className="hero-qr-title">ACCESS READY</h1>
        <div className="hero-qr-doctor-meta">
          <span className="hero-qr-doctor-name" data-testid="qr-target-doctor">{doctor.name}</span>
          <span className="hero-qr-meta-dot">•</span>
          <span className="hero-qr-purpose-text">{session.purpose || 'Remote Cardiology Consultation'}</span>
        </div>
        <div className="hero-qr-shared-badge-row">
          <span className="meta-records-count-pill" data-testid="qr-shared-count-badge">
            {selectedCount} of {totalCount} records shared
          </span>
        </div>
      </div>

      {/* Hero QR Card Container */}
      <div className="hero-qr-card-plate">
        <div className="qr-hero-frame" data-testid="qr-frame-box" aria-label="Temporary Consultation QR Code">
          <QRCodeSVG
            value={qrPayload}
            size={228}
            level="H"
            fgColor="#101828"
            bgColor="#FFFFFF"
            includeMargin={false}
            imageSettings={{
              src: "/logo.png",
              x: undefined,
              y: undefined,
              height: 42,
              width: 42,
              excavate: true
            }}
          />
        </div>

        {/* Scan Instruction Copy */}
        <p className="qr-scan-instruction">
          Doctor can scan this code to access the selected records.
        </p>

        {/* Live Timer: ACCESS ACTIVE */}
        <div className="qr-timer-wrapper" data-testid="qr-timer-container">
          <AccessTimer expiresAt={session.expiresAt} onExpire={onExpire} prefix="Expires in" />
        </div>

        {/* Revoke Action */}
        <div className="qr-revoke-action-slot">
          <button
            type="button"
            className="btn btn-outline-danger btn-md"
            data-testid="revoke-access-btn"
            onClick={onRequestRevoke}
            title="Terminate consultation access immediately"
          >
            <ShieldOff size={15} />
            <span>Revoke Access</span>
          </button>
        </div>

        {/* Subtle Explanation of QR Mechanism & Record Ownership */}
        <div className="qr-mechanism-note" data-testid="qr-security-note">
          <Lock size={14} color="var(--cyan-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Zero Health Data in QR.</strong> The QR code contains only a temporary session identifier, not medical records. Your records remain in your account. Only this consultation access expires.
          </span>
        </div>

        {/* Session Identifier & Copy Trigger */}
        <div className="qr-session-id-row">
          <span className="session-id-prefix">SESSION CODE:</span>
          <span className="session-id-code" data-testid="session-id-display">{session.sessionId}</span>
          <button
            type="button"
            className="btn-copy-code"
            data-testid="copy-session-id-btn"
            onClick={copySessionId}
            title="Copy Session Code"
          >
            {copied ? (
              <span className="copied-text"><Check size={13} /> Copied</span>
            ) : (
              <Copy size={13} color="var(--text-muted)" />
            )}
          </button>
        </div>

        {/* Public Doctor Access URL Row */}
        <div className="qr-direct-url-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }} title={qrPayload}>
            {qrPayload}
          </span>
          <button
            type="button"
            className="btn-copy-code"
            onClick={copyDoctorUrl}
            title="Copy Public Access URL"
            style={{ padding: '2px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            {copiedUrl ? (
              <span className="copied-text" style={{ color: 'var(--emerald)' }}><Check size={12} /> Copied</span>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator & Presentation Controls */}
      <div className="qr-action-panel-footer">
        <div className="simulate-scan-box">
          <div className="simulate-scan-prompt">Having trouble with camera scanning in venue?</div>
          <button
            type="button"
            className="btn btn-primary btn-md"
            data-testid="simulate-doctor-scan-btn"
            onClick={onSimulateScan}
            title="Simulate scanning this QR code in clinic"
          >
            <Camera size={15} />
            <span>Simulate Doctor Scan</span>
          </button>
        </div>

        <div className="qr-secondary-actions-row">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            data-testid="simulate-expiry-btn"
            onClick={onSimulateExpiry}
            title="Simulate session expiry for judges"
          >
            <Clock size={13} />
            <span>Demo: Simulate Expiry</span>
          </button>
        </div>
      </div>
    </div>
  );
};

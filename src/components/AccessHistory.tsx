import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  ShieldCheck,
  ShieldOff,
  Clock,
  Eye,
  Sparkles,
  RefreshCw,
  User,
  Bot,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

interface AuditEvent {
  event: string;
  timestamp: number;
  detail: string;
  actor: 'patient' | 'doctor' | 'system';
}

interface AuditData {
  sessionCode: string;
  patientId: string;
  sessionStatus: string;
  createdAt: number;
  expiresAt: number;
  revokedAt: number | null;
  auditLog: AuditEvent[];
}

interface AccessHistoryProps {
  sessionId: string;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' · ' + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getEventMeta(event: string): {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
} {
  switch (event) {
    case 'SESSION_CREATED':
      return {
        label: 'Session Created',
        icon: <CheckCircle size={14} />,
        color: '#15803D',
        bg: '#F0FDF4'
      };
    case 'SESSION_ACCESSED':
      return {
        label: 'Doctor Accessed Records',
        icon: <Eye size={14} />,
        color: '#1D4ED8',
        bg: '#EFF6FF'
      };
    case 'RECORD_VIEWED':
      return {
        label: 'Record Viewed',
        icon: <FileText size={14} />,
        color: '#6D28D9',
        bg: '#F5F3FF'
      };
    case 'INSIGHTS_GENERATED':
      return {
        label: 'AI Clinical Summary Requested',
        icon: <Sparkles size={14} />,
        color: '#0E7490',
        bg: '#ECFEFF'
      };
    case 'SESSION_REVOKED':
      return {
        label: 'Access Revoked',
        icon: <ShieldOff size={14} />,
        color: '#B91C1C',
        bg: '#FEF2F2'
      };
    case 'SESSION_EXPIRED':
      return {
        label: 'Session Expired',
        icon: <Clock size={14} />,
        color: '#B45309',
        bg: '#FFFBEB'
      };
    case 'EXPIRY_SIMULATED':
      return {
        label: 'Expiry Simulated (Demo)',
        icon: <Clock size={14} />,
        color: '#7C3AED',
        bg: '#F5F3FF'
      };
    default:
      return {
        label: event.replace(/_/g, ' '),
        icon: <AlertCircle size={14} />,
        color: '#475569',
        bg: '#F8FAFC'
      };
  }
}

function getActorIcon(actor: string) {
  if (actor === 'patient') return <User size={11} style={{ display: 'inline', marginRight: '3px' }} />;
  if (actor === 'doctor') return <ShieldCheck size={11} style={{ display: 'inline', marginRight: '3px' }} />;
  return <Bot size={11} style={{ display: 'inline', marginRight: '3px' }} />;
}

export const AccessHistory: React.FC<AccessHistoryProps> = ({ sessionId }) => {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number>(0);

  const fetchAuditLog = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(sessionId.toUpperCase())}/audit`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefreshed(Date.now());
      } else {
        setError('Could not fetch access history.');
      }
    } catch {
      setError('Network error fetching access history.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const events = data?.auditLog ? [...data.auditLog].reverse() : [];

  return (
    <div
      data-testid="access-history-panel"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(to right, #F8FAFC, #FFFFFF)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
            Access History
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Server-Verified Audit Trail
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          data-testid="refresh-audit-log-btn"
          onClick={fetchAuditLog}
          disabled={loading}
          style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px' }}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px',
              color: '#B91C1C',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              padding: '10px 12px'
            }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {!error && events.length === 0 && !loading && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No access events recorded yet.
          </div>
        )}

        {events.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.map((evt, idx) => {
              const meta = getEventMeta(evt.event);
              return (
                <div
                  key={idx}
                  data-testid={`audit-event-${evt.event.toLowerCase()}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: meta.bg,
                    border: `1px solid ${meta.color}22`,
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}
                >
                  {/* Event Icon */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: `${meta.color}18`,
                      border: `1.5px solid ${meta.color}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: meta.color,
                      marginTop: '1px'
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: meta.color }}>
                        {meta.label}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          background: `${meta.color}18`,
                          color: meta.color,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        {getActorIcon(evt.actor)}
                        {evt.actor}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: 1.4 }}>
                      {evt.detail}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatTimestamp(evt.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {lastRefreshed > 0 && (
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>
            Last refreshed: {formatTimestamp(lastRefreshed)}
          </div>
        )}
      </div>
    </div>
  );
};

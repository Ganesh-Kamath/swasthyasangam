import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Lock
} from 'lucide-react';

export interface AiInsight {
  type: string;
  title: string;
  summary: string;
  severity: 'routine' | 'moderate' | 'elevated';
  sources: string[];
}

interface SmartInsightsProps {
  sessionId: string;
  onExpire?: () => void;
  onClickSource?: (source: string) => void;
}

function getSeverityMeta(severity: string) {
  switch (severity) {
    case 'elevated':
      return {
        label: 'Elevated',
        color: '#B91C1C',
        bg: '#FEF2F2',
        border: '#FECACA',
        icon: <AlertTriangle size={12} />
      };
    case 'moderate':
      return {
        label: 'Moderate',
        color: '#B45309',
        bg: '#FFFBEB',
        border: '#FDE68A',
        icon: <TrendingUp size={12} />
      };
    default:
      return {
        label: 'Routine',
        color: '#15803D',
        bg: '#F0FDF4',
        border: '#BBF7D0',
        icon: <CheckCircle size={12} />
      };
  }
}

function getTypeIcon(type: string): React.ReactNode {
  if (type.includes('lipid') || type.includes('glycemic') || type.includes('glucose') || type.includes('hyperglycemia')) {
    return <TrendingUp size={14} />;
  }
  if (type.includes('rhythm') || type.includes('cardiac') || type.includes('structural') || type.includes('vascular')) {
    return <CheckCircle size={14} />;
  }
  if (type.includes('hematology') || type.includes('hepatorenal')) {
    return <Shield size={14} />;
  }
  return <FileText size={14} />;
}

const InsightCard: React.FC<{
  insight: AiInsight;
  index: number;
  onClickSource?: (source: string) => void;
}> = ({ insight, index, onClickSource }) => {
  const [expanded, setExpanded] = useState(index === 0);
  const sev = getSeverityMeta(insight.severity);

  return (
    <div
      data-testid={`ai-insight-item-${index}`}
      style={{
        border: `1px solid ${sev.border}`,
        borderLeft: `4px solid ${sev.color}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#FFFFFF'
      }}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          background: sev.bg,
          border: 'none',
          borderBottom: expanded ? `1px solid ${sev.border}` : 'none',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ color: sev.color, flexShrink: 0 }}>
            {getTypeIcon(insight.type)}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              flex: 1
            }}
          >
            {insight.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: sev.color,
              background: `${sev.color}18`,
              border: `1px solid ${sev.color}44`,
              padding: '2px 7px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {sev.icon}
            {sev.label}
          </span>
          {expanded ? (
            <ChevronUp size={14} color="var(--text-muted)" />
          ) : (
            <ChevronDown size={14} color="var(--text-muted)" />
          )}
        </div>
      </button>

      {/* Expanded Body */}
      {expanded && (
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
            {insight.summary}
          </p>

          {/* Source Evidence Chips */}
          {insight.sources && insight.sources.length > 0 && (
            <div
              data-testid={`ai-insight-sources-${index}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  paddingTop: '3px',
                  whiteSpace: 'nowrap'
                }}
              >
                Evidence:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {insight.sources.map((src, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    data-testid={`evidence-chip-${index}-${sIdx}`}
                    onClick={() => onClickSource?.(src)}
                    title={onClickSource ? `View source record: ${src}` : src}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      borderRadius: '5px',
                      padding: '3px 8px',
                      cursor: onClickSource ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (onClickSource) {
                        (e.currentTarget as HTMLButtonElement).style.background = '#DBEAFE';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF';
                    }}
                  >
                    <FileText size={10} />
                    {src}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  sessionId,
  onExpire,
  onClickSource
}) => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(0);
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setFetchFailed(false);
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(sessionId.toUpperCase())}/insights`);
      if (res.status === 410) {
        onExpire?.();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
        setLastFetched(Date.now());
      } else {
        setFetchFailed(true);
      }
    } catch {
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  }, [sessionId, onExpire]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const severityOrder = { elevated: 0, moderate: 1, routine: 2 };
  const sortedInsights = [...insights].sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );

  return (
    <div
      data-testid="doctor-ai-insights-panel"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, #F0F9FF 0%, #ECFEFF 100%)',
          borderLeft: '4px solid var(--cyan)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--cyan)" />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Clinical Insights
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Structured summary of documented findings — not a diagnosis
            </div>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              background: '#ECFEFF',
              color: '#0E7490',
              border: '1px solid #A5F3FC',
              padding: '2px 7px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Lock size={9} />
            Protected Endpoint
          </span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          data-testid="refresh-insights-btn"
          onClick={fetchInsights}
          disabled={loading}
          style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '8px 18px',
          background: '#FAFAFA',
          borderBottom: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }}
      >
        <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '1px', color: '#B45309' }} />
        <span>
          These insights organize and summarize information <strong>explicitly present</strong> in the
          patient-authorized records. They do not constitute a diagnosis, treatment recommendation, or
          clinical decision. All evidence chips are traceable to the source record.
        </span>
      </div>

      {/* Insights Content */}
      <div style={{ padding: '14px 18px' }}>
        {fetchFailed && (
          <div
            style={{
              fontSize: '12.5px',
              color: '#B45309',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '6px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={14} />
            <span>Could not load insights. The session may have expired or is unreachable.</span>
          </div>
        )}

        {!fetchFailed && sortedInsights.length === 0 && !loading && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            No clinical insights available for the selected records.
          </div>
        )}

        {sortedInsights.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{sortedInsights.length} finding{sortedInsights.length !== 1 ? 's' : ''} identified</span>
              <span>·</span>
              <span>sorted by clinical priority</span>
              {lastFetched > 0 && (
                <>
                  <span>·</span>
                  <span>Updated {new Date(lastFetched).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                </>
              )}
            </div>

            {sortedInsights.map((ins, i) => (
              <InsightCard
                key={`${ins.type}-${i}`}
                insight={ins}
                index={i}
                onClickSource={onClickSource}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

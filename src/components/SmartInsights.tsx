import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  TrendingUp,
  Shield,
  Lock,
  AlertCircle
} from 'lucide-react';
import { InsightCategory } from '../data/clinicalCatalog';

export interface InsightSource {
  text: string;
  sourceRecordId: string;
  sourceLabel: string;
  sourceDate: string;
}

export interface AiInsight {
  type: string;
  title: string;
  summary: string;
  category: InsightCategory;
  severity?: 'routine' | 'moderate' | 'elevated';
  sources: InsightSource[];
}

interface SmartInsightsProps {
  sessionId: string;
  sharedRecords?: Array<{ id: string; title: string }>;
  onExpire?: () => void;
  onClickSource?: (source: string) => void;
}

function getCategoryMeta(category: string) {
  switch (category) {
    case 'LONGITUDINAL INFORMATION':
      return {
        label: 'LONGITUDINAL INFORMATION',
        color: '#4F46E5', // Indigo
        bg: '#EEF2FF',
        border: '#C7D2FE',
        icon: <TrendingUp size={12} />
      };
    case 'RECORDED OBSERVATION':
      return {
        label: 'RECORDED OBSERVATION',
        color: '#0D9488', // Teal
        bg: '#F0FDFA',
        border: '#99F6E4',
        icon: <CheckCircle size={12} />
      };
    case 'RECORD RELATIONSHIP':
      return {
        label: 'RECORD RELATIONSHIP',
        color: '#B45309', // Amber
        bg: '#FFFBEB',
        border: '#FDE68A',
        icon: <FileText size={12} />
      };
    case 'SOURCE RECORD':
      return {
        label: 'SOURCE RECORD',
        color: '#475569', // Slate
        bg: '#F8FAFC',
        border: '#E2E8F0',
        icon: <FileText size={12} />
      };
    case 'DOCUMENTED VALUE':
    default:
      return {
        label: 'DOCUMENTED VALUE',
        color: '#0284C7', // Sky / Cyan
        bg: '#F0F9FF',
        border: '#BAE6FD',
        icon: <CheckCircle size={12} />
      };
  }
}

function getTypeIcon(type: string): React.ReactNode {
  if (type.includes('lipid') || type.includes('glycemic') || type.includes('glucose') || type.includes('hba1c')) {
    return <TrendingUp size={14} />;
  }
  if (type.includes('rhythm') || type.includes('cardiac') || type.includes('structural') || type.includes('echo') || type.includes('bp') || type.includes('troponin')) {
    return <CheckCircle size={14} />;
  }
  if (type.includes('cbc') || type.includes('hematology') || type.includes('hepatorenal') || type.includes('lft')) {
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
  const cat = getCategoryMeta(insight.category || 'DOCUMENTED VALUE');

  return (
    <div
      data-testid={`ai-insight-item-${index}`}
      style={{
        border: `1px solid ${cat.border}`,
        borderLeft: `4px solid ${cat.color}`,
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
          background: cat.bg,
          border: 'none',
          borderBottom: expanded ? `1px solid ${cat.border}` : 'none',
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
          <span style={{ color: cat.color, flexShrink: 0 }}>
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
              color: cat.color,
              background: `${cat.color}14`,
              border: `1px solid ${cat.color}33`,
              padding: '2px 7px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {cat.icon}
            {cat.label}
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
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap'
                }}
              >
                Source:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {insight.sources.map((src, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    data-testid={`evidence-chip-${index}-${sIdx}`}
                    onClick={() => onClickSource?.(src.sourceRecordId)}
                    title={onClickSource ? `Open original document: ${src.sourceLabel}` : src.sourceLabel}
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
                    <span>
                      {src.sourceLabel}{src.sourceDate ? ` • ${src.sourceDate}` : ''} →
                    </span>
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
  sharedRecords,
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

  // Derived scope presentation
  const displayRecordCount = sharedRecords?.length ?? (
    insights.reduce((acc, curr) => {
      curr.sources.forEach(s => acc.add(s.sourceRecordId));
      return acc;
    }, new Set<string>()).size || 3
  );

  const displayRecordNames = sharedRecords && sharedRecords.length > 0
    ? sharedRecords.map(r => r.title.replace(/Report/i, '').split('(')[0].trim()).join(' • ')
    : Array.from(
        new Set(insights.flatMap(ins => ins.sources.map(s => s.sourceLabel.replace(/Report/i, '').split('(')[0].trim())))
      ).join(' • ');

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="var(--cyan)" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan-dark)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SMART INSIGHTS
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Based on {displayRecordCount} shared record{displayRecordCount !== 1 ? 's' : ''}
            </div>
            {displayRecordNames && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                {displayRecordNames}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              background: '#ECFEFF',
              color: '#0E7490',
              border: '1px solid #A5F3FC',
              padding: '3px 8px',
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
      </div>

      {/* AI Disclaimer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          background: '#F8FAFC',
          borderBottom: '1px solid var(--border)',
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          lineHeight: 1.4
        }}
      >
        <Shield size={13} style={{ flexShrink: 0, color: 'var(--cyan-dark)' }} />
        <span>
          AI-assisted organization of information documented in the shared records. It does not diagnose conditions or recommend treatment.
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
            <AlertCircle size={14} />
            <span>Could not load insights. The session may have expired or is unreachable.</span>
          </div>
        )}

        {!fetchFailed && insights.length === 0 && !loading && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            No clinical insights available for the selected records.
          </div>
        )}

        {insights.length > 0 && (
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
              <span>{insights.length} documented observation{insights.length !== 1 ? 's' : ''} organized</span>
              {lastFetched > 0 && (
                <>
                  <span>·</span>
                  <span>Updated {new Date(lastFetched).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                </>
              )}
            </div>

            {insights.map((ins, i) => (
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

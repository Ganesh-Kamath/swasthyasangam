import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeRemaining } from '../utils/sessionManager';

interface AccessTimerProps {
  expiresAt: number;
  onExpire?: () => void;
  isCompact?: boolean;
  prefix?: string;
  suffix?: string;
}

export const AccessTimer: React.FC<AccessTimerProps> = ({
  expiresAt,
  onExpire,
  isCompact = false,
  prefix = 'Expires in:',
  suffix = ''
}) => {
  const [msRemaining, setMsRemaining] = useState<number>(() => {
    return Math.max(0, expiresAt - Date.now());
  });

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const hasExpiredFiredRef = useRef(false);

  useEffect(() => {
    hasExpiredFiredRef.current = false;
    const calculateAndCheck = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setMsRemaining(remaining);

      if (remaining <= 0 && !hasExpiredFiredRef.current) {
        hasExpiredFiredRef.current = true;
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    };

    // Calculate immediately on mount or expiresAt change
    calculateAndCheck();

    const timer = setInterval(calculateAndCheck, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatted = formatTimeRemaining(msRemaining);
  const isCritical = msRemaining > 0 && msRemaining <= 10 * 1000;
  const isUrgent = msRemaining > 0 && msRemaining <= 60 * 1000;
  const isExpired = msRemaining <= 0;

  if (isCompact) {
    return (
      <span
        data-testid="compact-access-timer"
        className={`timer-countdown-badge ${isCritical ? 'critical' : isUrgent ? 'urgent' : ''} ${isExpired ? 'expired' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          margin: 0,
          padding: '4px 10px',
          fontSize: '12px',
          borderRadius: '6px',
          border: '1px solid',
          fontWeight: isCritical ? 700 : 600,
          backgroundColor: isExpired ? '#FEF3F2' : isCritical ? '#FEF3F2' : isUrgent ? '#FFFBEB' : '#ECFDF5',
          borderColor: isExpired ? '#FECDCA' : isCritical ? '#FDA29B' : isUrgent ? '#FDE68A' : '#A7F3D0',
          color: isExpired ? '#B42318' : isCritical ? '#D92D20' : isUrgent ? '#B45309' : '#065F46',
          transition: 'all 0.3s ease'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isExpired ? '#D92D20' : isCritical ? '#D92D20' : isUrgent ? '#F59E0B' : '#10B981',
            display: 'inline-block'
          }}
        />
        <Clock size={12} />
        {prefix && <span>{prefix}</span>}
        <strong
          data-testid="timer-value-display"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.5px'
          }}
        >
          {isExpired ? '00:00' : formatted}
        </strong>
        {suffix && <span>{suffix}</span>}
      </span>
    );
  }

  return (
    <div
      data-testid="access-timer"
      className={`timer-display-box ${isCritical ? 'critical' : isUrgent ? 'urgent' : 'active'} ${isExpired ? 'expired' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 18px',
        borderRadius: '10px',
        backgroundColor: isExpired ? '#FEF3F2' : isCritical ? '#FEF3F2' : isUrgent ? '#FFFBEB' : '#F0FDF4',
        border: `1.5px solid ${isExpired ? '#FECDCA' : isCritical ? '#FDA29B' : isUrgent ? '#FDE68A' : '#BBF7D0'}`,
        color: isExpired ? '#B42318' : isCritical ? '#D92D20' : isUrgent ? '#B45309' : '#15803D',
        transition: 'all 0.3s ease',
        margin: '10px 0',
        width: '100%',
        maxWidth: '320px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isExpired ? '#D92D20' : isCritical ? '#D92D20' : isUrgent ? '#F59E0B' : '#16A34A',
            display: 'inline-block'
          }}
        />
        <span>{isExpired ? 'ACCESS EXPIRED' : 'ACCESS ACTIVE'}</span>
      </div>
      <div style={{ fontSize: '11px', color: isCritical ? '#B42318' : 'var(--text-secondary)', marginBottom: '4px' }}>
        {isExpired ? 'Temporary access ended' : isCritical ? 'Urgent • Temporary access expires in' : 'Temporary access • Expires in'}
      </div>
      <div
        data-testid="timer-value-display"
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: isExpired ? '#B42318' : isCritical ? '#D92D20' : isUrgent ? '#B45309' : '#0F172A'
        }}
      >
        {isExpired ? '00:00' : formatted}
      </div>
    </div>
  );
};


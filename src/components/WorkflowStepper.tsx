import React from 'react';
import { DemoStep, SessionStatus } from '../types';
import { Check, ShieldCheck, ShieldOff, Clock } from 'lucide-react';

interface WorkflowStepperProps {
  currentStep: DemoStep;
  sessionStatus?: SessionStatus;
  onStepClick?: (step: DemoStep) => void;
}

interface StepItem {
  id: DemoStep;
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { id: 'select_records', number: 1, label: 'SELECT RECORDS' },
  { id: 'create_access', number: 2, label: 'CREATE ACCESS' },
  { id: 'qr_access', number: 3, label: 'QR READY' },
  { id: 'doctor_access', number: 4, label: 'DOCTOR ACCESS' },
  { id: 'doctor_scan', number: 5, label: 'SESSION ENDS' }
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  sessionStatus = 'active',
  onStepClick
}) => {
  // Map internal steps to the 5 numbered pipeline stages
  const getStepStage = (): number => {
    if (sessionStatus === 'revoked' || sessionStatus === 'expired') {
      return 5;
    }
    switch (currentStep) {
      case 'landing':
      case 'select_records':
        return 1;
      case 'create_access':
        return 2;
      case 'qr_access':
        return 3;
      case 'doctor_scan':
      case 'doctor_access':
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = getStepStage();

  const handleStepClick = (stageNum: number) => {
    if (!onStepClick) return;
    if (stageNum === 1) onStepClick('select_records');
    else if (stageNum === 2) onStepClick('create_access');
    else if (stageNum === 3) onStepClick('qr_access');
    else if (stageNum === 4) onStepClick('doctor_access');
  };

  return (
    <div className="stepper-container" aria-label="Workflow progress">
      <div className="stepper-header">
        <div className="stepper-title-wrap">
          <ShieldCheck size={16} color="var(--cyan)" />
          <span className="stepper-title">Temporary QR Access Pipeline</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {sessionStatus === 'revoked' ? (
            <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldOff size={12} /> Status: Revoked
            </span>
          ) : sessionStatus === 'expired' ? (
            <span style={{ color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Status: Expired
            </span>
          ) : (
            <span style={{ color: 'var(--emerald-dark)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px' }} /> Status: Active
            </span>
          )}
        </div>
      </div>

      <div className="stepper-steps">
        {STEPS.map((step) => {
          const isCompleted = step.number < currentStage || (currentStage === 5 && step.number <= 4);
          const isCurrent = step.number === currentStage;
          const isUpcoming = step.number > currentStage;
          const isInteractive = isCompleted || isCurrent;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isUpcoming ? 'upcoming' : ''}`}
                style={{ cursor: isInteractive ? 'pointer' : 'default' }}
                onClick={() => isInteractive && handleStepClick(step.number)}
                title={isInteractive ? `Jump to ${step.label}` : undefined}
              >
                <div className="step-indicator">
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="step-label-group">
                  <span className="step-num-text">Stage {step.number}</span>
                  <span className="step-name-text">{step.label}</span>
                </div>
              </div>
              {step.number < STEPS.length && (
                <div className={`step-divider ${step.number < currentStage ? 'filled' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

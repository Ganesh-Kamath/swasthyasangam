import React from 'react';
import { ArrowRight, ShieldCheck, Check, Clock, QrCode, Stethoscope, Lock } from 'lucide-react';

interface LandingProps {
  onStartDemo: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartDemo }) => {
  return (
    <div className="landing-container" data-testid="landing-view">
      <div className="landing-hero-card">
        {/* Subtle environment pill */}
        <div className="hero-env-badge">
          <span className="hero-env-dot" />
          <span>Clinical Infrastructure Prototype</span>
        </div>

        {/* Wordmark & Tagline */}
        <h1 className="hero-product-title">SwasthyaSangam</h1>
        <div className="hero-product-tagline">
          Your health records.<br />
          Your control.
        </div>

        <p className="hero-mission-statement">
          Share the medical records you choose, with the doctor you choose, for only as long as you choose.
        </p>

        {/* Primary CTA */}
        <div className="hero-action-row">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            data-testid="start-demo-btn"
            onClick={onStartDemo}
          >
            <span>Start Demo</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Subtle Workflow Timeline Below */}
        <div className="subtle-workflow-strip">
          <div className="workflow-step-node">
            <span className="step-node-number">1</span>
            <span className="step-node-label">Select</span>
          </div>
          <span className="workflow-step-arrow">→</span>

          <div className="workflow-step-node">
            <span className="step-node-number">2</span>
            <span className="step-node-label">Share</span>
          </div>
          <span className="workflow-step-arrow">→</span>

          <div className="workflow-step-node">
            <span className="step-node-number">3</span>
            <span className="step-node-label">Scan</span>
          </div>
          <span className="workflow-step-arrow">→</span>

          <div className="workflow-step-node">
            <span className="step-node-number">4</span>
            <span className="step-node-label">Consult</span>
          </div>
          <span className="workflow-step-arrow">→</span>

          <div className="workflow-step-node">
            <span className="step-node-number">5</span>
            <span className="step-node-label">Expire</span>
          </div>
        </div>
      </div>

      {/* 3 Core Architectural Pillars */}
      <div className="landing-pillars-row">
        <div className="pillar-item">
          <div className="pillar-header">
            <ShieldCheck size={18} color="var(--cyan-dark)" />
            <span className="pillar-title">Selective Authorization</span>
          </div>
          <p className="pillar-desc">
            Patients authorize specific diagnostic records for a consultation rather than opening full health history.
          </p>
        </div>

        <div className="pillar-item">
          <div className="pillar-header">
            <Lock size={18} color="var(--emerald-dark)" />
            <span className="pillar-title">Ephemeral QR Token</span>
          </div>
          <p className="pillar-desc">
            Optical QR codes transmit zero patient data—only an encrypted, bounded session identifier verified on scan.
          </p>
        </div>

        <div className="pillar-item">
          <div className="pillar-header">
            <Clock size={18} color="var(--primary)" />
            <span className="pillar-title">Guaranteed Expiry</span>
          </div>
          <p className="pillar-desc">
            Physician access terminates automatically when consultation time expires, or immediately upon patient revocation.
          </p>
        </div>
      </div>
    </div>
  );
};

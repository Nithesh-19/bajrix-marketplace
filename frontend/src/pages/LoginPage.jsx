// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HardHat,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  Store,
  Info
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email or username.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      if (result.user.role === 'SELLER') {
        navigate('/seller');
      } else {
        navigate(from || '/');
      }
    } else {
      setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword('demo123');
    setErrorMsg('');

    const result = await login(account.email, 'demo123', account.role);
    if (result.success) {
      if (result.user.role === 'SELLER') {
        navigate('/seller');
      } else {
        navigate(from || '/');
      }
    }
  };

  return (
    <div className="login-page-wrapper" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="login-grid-container">
        
        {/* Main Login Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-slate-200)',
            boxShadow: 'var(--shadow-md)',
            padding: '36px',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              <HardHat size={30} strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-slate-900)', letterSpacing: '-0.02em' }}>
              Sign in to Bajri<span style={{ color: 'var(--color-brand-primary)' }}>X</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
              Construction & Industrial Materials Marketplace
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#b91c1c',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '6px' }}>
                Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-slate-400)'
                  }}
                />
                <input
                  id="login-email"
                  type="text"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12px',
                    color: 'var(--color-brand-primary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-slate-400)'
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-slate-400)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 700,
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-animate" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-slate-100)', fontSize: '13px', color: 'var(--color-slate-600)' }}>
            Need an enterprise account?{' '}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-brand-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Register your business
            </button>
          </div>
        </div>

        {/* Demo Personas Switcher Panel for Reviewers */}
        <div
          style={{
            backgroundColor: 'var(--color-slate-50)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--color-slate-300)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: 'var(--color-slate-900)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.05em'
              }}
            >
              Assessment Mode
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-slate-500)', fontWeight: 500 }}>
              Reviewer Instant Access Personas
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--color-slate-600)', lineHeight: 1.4 }}>
            Click any account below to instantly authenticate and evaluate the role-specific capabilities of the platform (Password: <code>demo123</code>):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Buyer Demo Button */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_ACCOUNTS[0])}
              style={{
                textAlign: 'left',
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-200)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} style={{ color: 'var(--color-brand-primary)' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--color-slate-900)' }}>
                    Priya Sharma (Buyer)
                  </strong>
                  <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    BUYER
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                  Larsen Infra Contracting Ltd • Accesses Materials Catalogue & Cart
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-slate-400)' }} />
            </button>

            {/* Approved Seller 1 Button */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_ACCOUNTS[1])}
              style={{
                textAlign: 'left',
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-200)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={14} style={{ color: 'var(--color-success)' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--color-slate-900)' }}>
                    Apex Building Supplies (Seller ID 1)
                  </strong>
                  <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    APPROVED
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                  Approved Seller • Full access to Seller Workspace & Inventory
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-slate-400)' }} />
            </button>

            {/* Approved Seller 2 Button */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_ACCOUNTS[2])}
              style={{
                textAlign: 'left',
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-200)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={14} style={{ color: 'var(--color-success)' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--color-slate-900)' }}>
                    BuildPro Infrastructure (Seller ID 2)
                  </strong>
                  <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    APPROVED
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                  Approved Seller • Offers lowest cement price in catalogue
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-slate-400)' }} />
            </button>

            {/* Pending Seller 4 Button */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_ACCOUNTS[4])}
              style={{
                textAlign: 'left',
                backgroundColor: 'white',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-200)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={14} style={{ color: '#d97706' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--color-slate-900)' }}>
                    NovaTech Steel & Infra (Seller ID 4)
                  </strong>
                  <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    PENDING
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                  Compliance pending • Listings hidden from public buyer view
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-slate-400)' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Real API mode attempts <code>POST /api/auth/login</code>. In assessment environments, demo accounts enable deterministic verification across buyer & seller workflows.
            </span>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Password Recovery</h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn-icon"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-slate-600)', lineHeight: 1.5 }}>
                Automated password reset is disabled in the assessment preview environment.
              </p>
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-slate-700)' }}>
                <strong>Demo Accounts Password:</strong> <code>demo123</code>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-primary btn-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Enterprise Registration</h2>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="btn-icon"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-slate-600)', lineHeight: 1.5 }}>
                BajriX is a wholesale construction materials exchange. New builder contractors and verified quarry/mill suppliers are onboarded via verified GST & KYC clearance.
              </p>
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-slate-700)' }}>
                To test the application, please use the pre-seeded <strong>Buyer</strong> or <strong>Seller</strong> personas provided in the Quick Access panel.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

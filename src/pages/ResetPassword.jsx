import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function ResetPassword({ setPage }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("error=access_denied") || hash.includes("otp_expired")) {
      setLinkError("This password reset link has expired or has already been used. Please request a new one.");
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => setPage("login"), 2500);
    }
    setLoading(false);
  };

  // SUCCESS SCREEN - with SVG icon
  if (success) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #eff0ea 0%, #f5f1f1 40%, #e4e4e0 75%, #f0eee5 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Password Updated</h2>
          <p style={{ color: '#666', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>Your password has been changed successfully.<br />Redirecting you to login...</p>
          <button onClick={() => setPage("login")} style={{ padding: 14, width: '100%', borderRadius: 12, border: 'none', background: '#f3d807f1', color: 'black', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Continue to Login</button>
        </div>
      </div>
    );
  }

  // EXPIRED LINK SCREEN - with SVG icon
  if (linkError) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #eff0ea 0%, #f5f1f1 40%, #e4e4e0 75%, #f0eee5 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Link Expired</h2>
          <p style={{ color: '#666', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>{linkError}</p>
          <button onClick={() => setPage("login")} style={{ padding: 14, width: '100%', borderRadius: 12, border: 'none', background: '#f3d807f1', color: 'black', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Back to Login to Request a New Link</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #eff0ea 0%, #f5f1f1 40%, #e4e4e0 75%, #f0eee5 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 20, width: '100%', maxWidth: 380 }}>
        <h2 style={{ textAlign: 'center', fontSize: 18 }}>VezaPay</h2>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>Set New Password</p>
        {error && <div style={{ background: '#fee2e2', color: '#b00', padding: 8, borderRadius: 8, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="password" placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f6f7f8', fontSize: 13 }} required />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f6f7f8', fontSize: 13 }} required />
          <button disabled={loading} style={{ padding: 14, borderRadius: 10, border: 'none', background: '#f3d807f1', color: 'black', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{loading ? "Updating..." : "Update Password"}</button>
        </form>
      </div>
    </div>
  );
}
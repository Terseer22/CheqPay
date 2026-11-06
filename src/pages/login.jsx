import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- FORGOT PASSWORD STATES ---
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      if (error) throw error;
      if (data.user) {
        setPage("mobileHome"); // FIXED: go direct
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD - SEND RESET LINK TO EMAIL ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) { setForgotError("Please enter your email"); return; }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #eff0ea 0%, #f5f1f1 40%, #e4e4e0 75%, #f0eee5 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 16, width: '100%', maxWidth: 380, minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: '15px 0 5px 0', fontSize: 18 }}>VezaPay</h2>
          <p style={{ color: '#888', fontSize: 12, margin: '0 0 20px 0' }}>Welcome Back</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b00', padding: 8, borderRadius: 8, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input  placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f6f7f8', outline: 'none', fontSize: 13 }} required />
          <input placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #f5f6f6', background: '#f6f7f8', outline: 'none', fontSize: 13 }} required />

          {/* FORGOT PASSWORD LINK */}
          <p 
            onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotSent(false); setForgotError(""); }}
            style={{ textAlign: 'right', fontSize: 12, margin: '0', color: '#f3d807f1', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Forgot Password?
          </p>

          <button disabled={loading} style={{ padding: 14, borderRadius: 10, border: 'none', background: '#f3d807f1', color: 'black', fontWeight: 800, fontSize: 13 }}>
            {loading ? "Authorising..." : "Sign in"}
          </button>
          <p style={{textAlign:'center', fontSize:12, margin: '4px 0 0 0'}}>No account yet? <span onClick={()=>setPage("signup")} style={{color:'#f3d807f1', fontWeight:800, cursor:'pointer',fontSize:14}}>Sign Up</span></p>
        </form>
      </div>

      {/* --- FORGOT PASSWORD POPUP --- */}
      {showForgot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Reset Password</h3>
              <span onClick={() => setShowForgot(false)} style={{ cursor: 'pointer', fontSize: 18, fontWeight: 800 }}>✕</span>
            </div>

            {forgotSent ? (
              <>
                <div style={{ background: '#dcfce7', color: '#166534', padding: 12, borderRadius: 10, fontSize: 13, marginTop: 16, lineHeight: 1.5, textAlign: 'center' }}>
                  ✅ Reset link don go to <b>{forgotEmail}</b><br/>Check your email / spam and click the link to set new password.
                </div>
                <button onClick={() => setShowForgot(false)} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: '#f3d807f1', color: 'black', fontWeight: 800, fontSize: 13, marginTop: 14 }}>Done</button>
              </>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Enter your registered email, we go send you reset link.</p>
                {forgotError && <div style={{ background: '#fee2e2', color: '#b00', padding: 8, borderRadius: 8, fontSize: 12, textAlign: 'center' }}>{forgotError}</div>}
                <input placeholder="you@email.com" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f6f7f8', outline: 'none', fontSize: 13 }} required />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowForgot(false)} style={{ flex: 1, padding: 14, borderRadius: 10, border: '1px solid #ddd', background: '#fff', fontWeight: 700, fontSize: 13 }}>Cancel</button>
                  <button disabled={forgotLoading} style={{ flex: 1, padding: 14, borderRadius: 10, border: 'none', background: '#000', color: '#FFEB3B', fontWeight: 800, fontSize: 13 }}>
                    {forgotLoading ? "Sending..." : "Send Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
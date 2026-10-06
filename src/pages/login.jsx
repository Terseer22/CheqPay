import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      setLoading(false);
      return setError(error.message);
    }
    setLoading(false);
    setPage("home");
  };

  const getStyle = (name) => ({
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1px solid ${focusedInput === name ? '#08d17d' : '#e6ecea'}`,
    background: '#f8faf9', outline: 'none',
    boxShadow: focusedInput === name ? '0 0 0 1px #08d17d' : 'none',
    boxSizing: 'border-box', transition: '0.2s', fontSize: 13
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #14fa9a 0%, #14e58e 40%, #0d6b37 75%, #0c3e1e 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>

   
      {loading && (
        <>
          <style>{`
            @keyframes pump {
              0% { transform: scale(1); }
              50% { transform: scale(1.35); }
              100% { transform: scale(1); }
            }
          `}</style>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999,
            
          }}>
            <img src="/logo.png" style={{ width: 75, height: 75, borderRadius:37.5 , animation: 'pump 0.7s ease-in-out infinite',  padding: 5 }} />
          </div>
        </>
      )}

      <div style={{ background: 'white', borderRadius: 20, padding: 16, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img src="/logo2.png" style={{ width: 42, height: 42, margin: '0 auto 8px auto', display: 'block', borderRadius: 12 }} />
          <h2 style={{ margin: '4px 0 0 0', fontSize: 18 }}>CheqPay</h2>
          <p style={{ color: '#888', fontSize: 11, margin: 0 }}>Welcome Back</p>
        </div>

        {error && <div style={{ background: '#f8faf9', color: '#b00', padding: 8, borderRadius: 8, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocusedInput('email')} onBlur={()=>setFocusedInput(null)} style={getStyle('email')} />
          <input placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} onFocus={()=>setFocusedInput('password')} onBlur={()=>setFocusedInput(null)} style={getStyle('password')} />
          <button disabled={loading} style={{ padding: 11, borderRadius: 10, border: 'none', background: '#08d17d', color: 'white', fontWeight: 700, fontSize: 13 }}>Login</button>
          <p style={{textAlign:'center', fontSize:11, margin: '4px 0 0 0'}}>No account? <span onClick={()=>setPage("signup")} style={{color:'#08d17d', fontWeight:700, cursor:'pointer'}}>Sign Up</span></p>
        </form>
      </div>
    </div>
  );
}
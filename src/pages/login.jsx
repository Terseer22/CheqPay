import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div style={{ background: 'linear-gradient(135deg, #14fa9a 0%, #14e58e 40%, #0d6b37 75%, #0c3e1e 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 16, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img src="/logo2.png" style={{ width: 42, height: 42, margin: '0 auto 8px', display: 'block', borderRadius: 12 }} alt="logo" />
          <h2 style={{ margin: '4px 0 0 0', fontSize: 18 }}>CheqPay</h2>
          <p style={{ color: '#888', fontSize: 11, margin: 0 }}>Welcome Back</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b00', padding: 8, borderRadius: 8, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f8faf9', outline: 'none', fontSize: 13 }} required />
          <input placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f8faf9', outline: 'none', fontSize: 13 }} required />
          <button disabled={loading} style={{ padding: 11, borderRadius: 10, border: 'none', background: '#08d17d', color: 'white', fontWeight: 700, fontSize: 13 }}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p style={{textAlign:'center', fontSize:11, margin: '4px 0 0 0'}}>No account? <span onClick={()=>setPage("signup")} style={{color:'#08d17d', fontWeight:700, cursor:'pointer'}}>Sign Up</span></p>
        </form>
      </div>
    </div>
  );
}
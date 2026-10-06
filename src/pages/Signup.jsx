import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Signup({ setPage }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "", email: "", phone: "", password: "", confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const isStrongPassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);
  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.firstName ||!form.lastName ||!form.username ||!form.email ||!form.phone ||!form.password) return setError("Abeg fill all fields");
    if (form.password !== form.confirm) return setError("Passwords no match");
    if (!isStrongPassword(form.password)) return setError("Password weak! Use 8+ chars with UPPER, lower, number & @");

    setLoading(true);
    setError("");

    const { data, error: signUpErr } = await supabase.auth.signUp({ 
      email: form.email.trim().toLowerCase(), 
      password: form.password 
    });

    if (signUpErr) { 
      setLoading(false); 
      if(signUpErr.message.includes("already registered")) return setError("This Gmail don already exist, abeg go login");
      return setError(signUpErr.message); 
    }

    let userId = data.user?.id;

    if (!userId) {
      const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ 
        email: form.email.trim().toLowerCase(), 
        password: form.password 
      });
      if(loginErr){ setLoading(false); return setError("Signup success but login failed. Go login page."); }
      userId = loginData.user.id;
    }

    if (userId) {
      const { error: profErr } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      }, { onConflict: 'id' });

      if (profErr) { 
        setLoading(false); 
        if(profErr.message.includes("duplicate") || profErr.message.includes("pkey")){
          return setError("User already exists, go login jare");
        }
        if(profErr.message.includes("username")) return setError("Username don already exist, change am");
        if(profErr.message.includes("phone")) return setError("Phone number don already exist");
        return setError(profErr.message); 
      }
    }

    setLoading(false);
    setPage("home");
  };

  const getStyle = (name) => ({
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: `1px solid ${focusedInput === name ? '#08d17d' : '#e6ecea'}`,
    background: '#f8faf9',
    outline: 'none',
    boxShadow: focusedInput === name ? '0 0 0 0.2px #08d17d' : 'none',
    boxSizing: 'border-box',
    transition: '0.2s',
    fontSize: 13
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #14fa9a 0%, #14e58e 40%, #0d6b37 75%, #0c3e1e 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 30, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img src="/logo2.png" style={{ width: 42, height: 42, margin: '0 auto 8px auto', display: 'block', borderRadius: 12 }} />
          <h2 style={{ margin: '4px 0 0 0', fontSize: 18 }}>CheqPay</h2>
          <p style={{ color: '#888', fontSize: 11, margin: 0 }}>Create Account</p>
        </div>

        {error && <div style={{ background: '#ffeaea', color: '#b00', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} onFocus={()=>setFocusedInput('firstName')} onBlur={()=>setFocusedInput(null)} style={getStyle('firstName')} />
            <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} onFocus={()=>setFocusedInput('lastName')} onBlur={()=>setFocusedInput(null)} style={getStyle('lastName')} />
          </div>
          <input name="username" placeholder="Username e.g terfa01" value={form.username} onChange={handleChange} onFocus={()=>setFocusedInput('username')} onBlur={()=>setFocusedInput(null)} style={getStyle('username')} />
          <input name="email" placeholder="Gmail" value={form.email} onChange={handleChange} onFocus={()=>setFocusedInput('email')} onBlur={()=>setFocusedInput(null)} style={getStyle('email')} />
          <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} onFocus={()=>setFocusedInput('phone')} onBlur={()=>setFocusedInput(null)} style={getStyle('phone')} />
          <input name="password" type="password" placeholder="Strong Password" value={form.password} onChange={handleChange} onFocus={()=>setFocusedInput('password')} onBlur={()=>setFocusedInput(null)} style={getStyle('password')} />
          <input name="confirm" type="password" placeholder="Confirm Password" value={form.confirm} onChange={handleChange} onFocus={()=>setFocusedInput('confirm')} onBlur={()=>setFocusedInput(null)} style={getStyle('confirm')} />
          
          <button disabled={loading} style={{ padding: 12, borderRadius: 10, border: 'none', background: '#08d17d', color: 'white', fontWeight: 700, fontSize: 13, marginTop: 4 }}>Sign Up</button>
          
          <p style={{textAlign:'center', fontSize:11, margin: '4px 0 0 0'}}>Already get account? <span onClick={()=>setPage("login")} style={{color:'#08d17d', fontWeight:700, cursor:'pointer'}}>Login</span></p>
        </form>
      </div>

      {/* PUMPING LOGO - MIDDLE OF PAGE */}
      {loading && (
        <>
          <style>{`@keyframes pump{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}`}</style>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <img src="/logo.png" style={{ width: 80, height: 80, borderRadius: 18, animation: 'pump 0.7s ease-in-out infinite' }} />
          </div>
        </>
      )}
    </div>
  );
}
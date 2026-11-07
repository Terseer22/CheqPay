import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Signup({ setPage }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // PROFESSIONAL PASSWORD STRENGTH - Industry standard
  const getPasswordAnalysis = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const isAllNumbers = /^[0-9]+$/.test(pwd) && pwd.length > 0;

    if (isAllNumbers) return { label: "Weak", score: 1, color: "#ef4444", checks, isAllNumbers: true };
    if (!pwd) return { label: "", score: 0, color: "#e5e7eb", checks, isAllNumbers: false };
    if (pwd.length < 6) return { label: "Weak", score: 1, color: "#ef4444", checks, isAllNumbers: false };
    if (score <= 2) return { label: "Weak", score: 1, color: "#ef4444", checks, isAllNumbers: false };
    if (score === 3) return { label: "Fair", score: 2, color: "#f59e0b", checks, isAllNumbers: false };
    if (score === 4) return { label: "Strong", score: 3, color: "#3b82f6", checks, isAllNumbers: false };
    if (score === 5) return { label: "Very Strong", score: 4, color: "#10b981", checks, isAllNumbers: false };
  };

  const analysis = getPasswordAnalysis(password);

  const handleSignUp = async () => {
    setError("");
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (!terms) {
      setError("You must accept Terms & Privacy Policy");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (analysis.score < 3 || analysis.isAllNumbers) {
      setError("Password must be at least Strong: 8+ chars with uppercase, lowercase, number & symbol");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { first_name: firstName, last_name: lastName, username, full_name: `${firstName} ${lastName}` } },
      });
      if (signUpError) throw signUpError;

      const user = data.user;
      if (user) {
        await supabase.from("wallets").upsert({ user_id: user.id, balance: 0 }, { onConflict: "user_id" });
        await supabase.from("profiles").upsert({ id: user.id, email: email.toLowerCase(), full_name: `${firstName} ${lastName}`, username }, { onConflict: "id" });
        await supabase.auth.signOut();
      }

      // SHOW SUCCESS MESSAGE BEFORE REDIRECT
      setSuccess(true);
      setTimeout(() => setPage("login"), 2000);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ background: " background: 'linear-gradient(135deg, #f2f7f5 0%, #e0e8e4 40%, #f4f7f5 75%, #f0f7f3 100%)", padding: "40px", borderRadius: "16px", textAlign: "center", maxWidth: "400px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ width: "60px", height: "60px", background: "#FFEB3B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "30px", color: "#fff" }}>✓</div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Account successfully created</h2>
          <p style={{ fontSize: "13px", color: "#666" }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "440px", borderRadius: "16px", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", boxSizing: "border-box", overflow: "hidden" }}>
        <h2 style={{ fontSize: "25px", fontWeight: 800, marginBottom: "4px", color: "#f3d807f1", alignSelf:"center", textAlign:"center"}}>Register</h2>
        <p style={{ fontSize: "12px", color: "#7e7c7c", marginBottom: "20px" }}>Create your account. It's  only takes a minute</p>

        {/* FIXED: First + Last no go push outside again */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", width: "100%", boxSizing: "border-box" }}>
          <input placeholder="First Name " value={firstName} onChange={e=>setFirstName(e.target.value)} style={inputStyles} />
          <input placeholder="Last Name " value={lastName} onChange={e=>setLastName(e.target.value)} style={inputStyles} />
        </div>

        <input placeholder="Username " value={username} onChange={e=>setUsername(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"12px"}} />
        <input placeholder="Email " type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"12px"}} />
        <input placeholder="Password *" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"8px"}} />

        {/* PROFESSIONAL STRENGTH METER */}
        {password && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: "4px", flex: 1, borderRadius: "10px", background: i <= analysis.score ? analysis.color : "#e5e7eb", transition: "0.3s" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: analysis.color }}>{analysis.label}</span>
              {analysis.isAllNumbers && <span style={{ fontSize: "10px", color: "#ef4444" }}>Numbers only is not allowed</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "8px" }}>
              <Check text="8+ characters" ok={analysis.checks.length} />
              <Check text="Uppercase" ok={analysis.checks.upper} />
              <Check text="Lowercase" ok={analysis.checks.lower} />
              <Check text="Number" ok={analysis.checks.number} />
              <Check text="Special (!@#$)" ok={analysis.checks.special} />
            </div>
          </div>
        )}

        <input placeholder="Confirm Password *" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"14px"}} />

        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#1bc010", marginBottom: "16px", cursor: "pointer" }}>
          <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} required /><a href="#">

<span  style={{ color: "#f3d807f1", fontSize: "12px",}}>I accept the <b>Terms of Use</b> & <b style={{ color: "#f3d807f1" }}>Privacy Policy </b></span>

          </a>
          
        </label>

        {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", border: "1px solid #fecaca" }}>{error}</div>}

        <button onClick={handleSignUp} disabled={loading} style={{ width: "100%", padding: "12px", background: "#FFEB3B", color: "black", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1, boxSizing: "border-box" }}>
          {loading ? "Creating..." : "Register Now"}
        </button>

        <p style={{ fontSize: "12px", color: "#8f8f8f", textAlign: "center", marginTop: "14px", fontWeight: 800 }}>
          Already have account? <span onClick={()=>setPage("login")} style={{ color: "#f3d807f1",fontSize: "15px", fontWeight: 800, cursor: "pointer" }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const Check = ({ text, ok }) => (
  <span style={{ fontSize: "10px", color: ok ? "#10b981" : "#9ca3af", display: "flex", alignItems: "center", gap: "3px" }}>
    <span style={{ fontWeight: 700 }}>{ok ? "✓" : "○"}</span> {text}
  </span>
);

const inputStyle = {
  padding: "14px 18px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "13px",
  outline: "none",
  background: "#f9fafb",
  flex: 1,
  boxSizing: "border-box",
  minWidth: 0,
};
const inputStyles = {
  padding: "13px 10px",
  border: "1px solid #ebebe5",
  borderRadius: "8px",
  fontSize: "13px",
  outline: "none",
  background: "#f9fafb",
  flex: "1 1 0",
  width: "0",
  minWidth: 0,
  boxSizing: "border-box",
};
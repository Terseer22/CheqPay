import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

function getFriendlyError(err) {
  const raw = err?.message || "";
  const msg = raw.toLowerCase();
  const isNetworkError =
    !navigator.onLine ||
    msg.includes("failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("networkerror") ||
    msg.includes("timeout") ||
    msg.includes("connection");
  if (isNetworkError) {
    return "No internet connection. Please check your network and try again.";
  }
  if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("already in use") || msg.includes("duplicate")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (msg.includes("invalid email") || msg.includes("email address is invalid") || msg.includes("invalid login") || msg.includes("must be a valid email")) {
    return "Please enter a valid email address. Example: you@gmail.com";
  }
  if (msg.includes("password") && (msg.includes("short") || msg.includes("least") || msg.includes("6 character"))) {
    return "Password is too short. Use at least 8 characters with uppercase, lowercase, number and symbol.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  return raw || "Something went wrong. Please try again.";
}

export default function Signup({ setPage }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    // Normalize phone: remove spaces, dashes - keep +234 / 080... as user type am
    const cleanPhone = phone.replace(/[\s-]/g, "").trim();

    if (!cleanFirst || !cleanLast || !cleanUsername || !cleanEmail || !cleanPhone || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (cleanUsername.includes("@")) {
      setError("Username cannot be an email address. Please enter a username, e.g. john_doe.");
      return;
    }
    if (cleanFirst.includes("@") || cleanLast.includes("@")) {
      setError("First name and last name cannot be an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address. Example: you@gmail.com");
      return;
    }
    if (cleanEmail === cleanUsername.toLowerCase()) {
      setError("Email and username cannot be the same. Please use a different username.");
      return;
    }
    // PHONE VALIDATION - allow +234..., 080..., 234...
    if (!/^(\+?234|0)[0-9]{10}$/.test(cleanPhone) && !/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number. Example: 08012345678");
      return;
    }
    if (!terms) {
      setError("Please accept the Terms & Privacy Policy to continue.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (analysis.score < 3 || analysis.isAllNumbers) {
      setError("Password must be at least Strong: 8+ characters with uppercase, lowercase, number & symbol.");
      return;
    }

    setLoading(true);
    try {
      // CHECK IF USERNAME ALREADY EXISTS
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (existingUsername) {
        setError("This username is already taken. Please try another one.");
        setLoading(false);
        return;
      }

      // CHECK IF PHONE ALREADY EXISTS
      const { data: existingPhone } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existingPhone) {
        setError("This phone number is already registered. Please sign in or use another number.");
        setLoading(false);
        return;
      }

      // CHECK IF EMAIL ALREADY EXISTS IN PROFILES TOO (faster friendly message)
      const { data: existingEmail } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { first_name: cleanFirst, last_name: cleanLast, username: cleanUsername, phone: cleanPhone, full_name: `${cleanFirst} ${cleanLast}` } },
      });
      if (signUpError) throw signUpError;

      const user = data.user;
      if (user) {
        await supabase.from("wallets").upsert({ user_id: user.id, balance: 0 }, { onConflict: "user_id" });
        await supabase.from("profiles").upsert({ id: user.id, email: cleanEmail, full_name: `${cleanFirst} ${cleanLast}`, username: cleanUsername, phone: cleanPhone }, { onConflict: "id" });
        await supabase.auth.signOut();
      }
      setSuccess(true);
      setTimeout(() => setPage("login"), 2000);
    } catch (e) {
      setError(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f2f7f5 0%, #e0e8e4 40%, #f4f7f5 75%, #f0f7f3 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", textAlign: "center", maxWidth: "400px", width: "100%", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "64px", height: "64px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Account successfully created</h2>
          <p style={{ fontSize: "13px", color: "#666" }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "440px", borderRadius: "16px", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", boxSizing: "border-box", overflow: "hidden" }}>
        <h2 style={{ fontSize: "25px", fontWeight: 800, marginBottom: "4px", color: "#0a0a0af1", alignSelf:"center", textAlign:"center"}}>Create an account</h2>
        <p style={{ fontSize: "12px", color: "#7e7c7c", marginBottom: "20px",textAlign:"center" }}>Start your journey with VezaPay today</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", width: "100%", boxSizing: "border-box" }}>
          <input placeholder="First Name " value={firstName} onChange={e=>setFirstName(e.target.value)} style={inputStyles} />
          <input placeholder="Last Name " value={lastName} onChange={e=>setLastName(e.target.value)} style={inputStyles} />
        </div>
        <input placeholder="Username " value={username} onChange={e=>setUsername(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"12px"}} />
        <input placeholder="Email " type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"12px"}} />
        <input placeholder="Phone Number e.g. 08012345678" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"12px"}} />
        <input placeholder="Password *" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{...inputStyle, width:"100%", marginBottom:"8px"}} />
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
          <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} required />
          <span style={{ color: "#f3d807f1", fontSize: "12px" }}>I accept the <b>Terms of Use</b> & <b style={{ color: "#f3d807f1" }}>Privacy Policy</b></span>
        </label>
        {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          {error}
        </div>}
        <button onClick={handleSignUp} disabled={loading} style={{ width: "100%", padding: "12px", background: "#FFEB3B", color: "black", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1, boxSizing: "border-box" }}>
          {loading ? "Checking..." : "Register Now"}
        </button>
        <p style={{ fontSize: "12px", color: "#8f8f8f", textAlign: "center", marginTop: "14px", fontWeight: 800 }}>
          Already have account? <span onClick={()=>setPage("login")} style={{ color: "#f3d807f1",fontSize: "15px", fontWeight: 800, cursor: "pointer" }}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const Check = ({ text, ok }) => (
  <span style={{ fontSize: "10px", color: ok ? "#10b981" : "#9ca3af", display: "flex", alignItems: "center", gap: "4px" }}>
    {ok ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /></svg>
    )}
    {text}
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
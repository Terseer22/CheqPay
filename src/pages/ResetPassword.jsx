import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function ResetPassword({ setPage }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else {
      alert("Password changed! Login with new password");
      setPage("login");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #eff0ea 0%, #f5f1f1 40%, #e4e4e0 75%, #f0eee5 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 20, width: '100%', maxWidth: 380 }}>
        <h2 style={{ textAlign: 'center', fontSize: 18 }}>VezaPay</h2>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>Set New Password</p>
        {error && <div style={{ background: '#fee2e2', color: '#b00', padding: 8, borderRadius: 8, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="password" placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f6f7f8', fontSize: 13 }} required />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid #e6ecea', background: '#f6f7f8', fontSize: 13 }} required />
          <button disabled={loading} style={{ padding: 14, borderRadius: 10, border: 'none', background: '#f3d807f1', color: 'black', fontWeight: 800, fontSize: 13 }}>{loading ? "Updating..." : "Update Password"}</button>
        </form>
      </div>
    </div>
  );
}
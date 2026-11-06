import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function ProfilePin({ setPage }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkHasPin();
  }, []);

  const checkHasPin = async () => {
    const { data } = await supabase.rpc("has_user_pin");
    setHasPin(data);
  };

  const handleSet = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4) { alert("Enter 4 digits"); return; }
    if (pin !== confirmPin) { alert("PINs don't match"); return; }
    setLoading(true);
    const { data, error } = await supabase.rpc("set_user_pin", { p_pin: pin });
    setLoading(false);
    if (error) { alert(error.message); return; }
    if (!data.success) { alert(data.message); return; }
    alert("Transaction PIN set! You can now pay securely.");
    setPin(""); setConfirmPin("");
    checkHasPin();
  };

  return (
    <div style={{ padding: 20, background: '#FCEEF2', minHeight: '100vh' }}>
      <button onClick={() => setPage("mobileHome")} style={{ background: '#000', color: '#fff', padding: '10px 18px', borderRadius: 20, border: 'none' }}>← Back</button>
      <h2 style={{ marginTop: 20 }}>{hasPin ? "Change Transaction PIN" : "Set Transaction PIN"}</h2>
      <p style={{ fontSize: 13, color: '#666' }}>Required for all payments. Like bank PIN.</p>

      <div style={{ background: '#fff', padding: 20, borderRadius: 16, marginTop: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700 }}>NEW PIN</label>
        <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="••••" style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #000', fontSize: 24, letterSpacing: 12, textAlign: 'center', marginBottom: 16, marginTop: 6 }} />

        <label style={{ fontSize: 12, fontWeight: 700 }}>CONFIRM PIN</label>
        <input type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="••••" style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #000', fontSize: 24, letterSpacing: 12, textAlign: 'center', marginBottom: 20, marginTop: 6 }} />

        <button onClick={handleSet} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#000', color: '#fff', fontWeight: 700, border: 'none' }}>{loading ? "..." : hasPin ? "Update PIN" : "Set PIN"}</button>
      </div>
    </div>
  );
}
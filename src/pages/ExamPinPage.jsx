import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

const DATASTATION_API_KEY = "aa8cd72c1e1c7e129aae727c5cae96cf98f5c88e"; 
const DATASTATION_BASE_URL = "https://datastationa.com.ng/api";

const PROFIT = {
  waec: 500,
  neco: 200,
  nabteb: 200,
  jamb: 500
};

export default function ExamPinPage({ setPage }) {
  const [exams, setExams] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [exam, setExam] = useState("waec");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultPins, setResultPins] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchRealPrices = async () => {
      try {
        const res = await fetch(`${DATASTATION_BASE_URL}/exam/prices`, {
          headers: { "Authorization": `Token ${DATASTATION_API_KEY}` }
        });
        const data = await res.json();
        const wholesale = {
          waec: data.waec_price || data.WAEC || 4200,
          neco: data.neco_price || data.NECO || 1200,
          nabteb: data.nabteb_price || 800,
          jamb: data.jamb_price || 4200
        };
        setExams([
          { id: "waec", name: "WAEC", price: wholesale.waec + PROFIT.waec, wholesale: wholesale.waec, code: "waec", color: "#1e40af" },
          { id: "neco", name: "NECO", price: wholesale.neco + PROFIT.neco, wholesale: wholesale.neco, code: "neco", color: "#15803d" },
          { id: "nabteb", name: "NABTEB", price: wholesale.nabteb + PROFIT.nabteb, wholesale: wholesale.nabteb, code: "nabteb", color: "#7c2d12" },
          { id: "jamb", name: "JAMB", price: wholesale.jamb + PROFIT.jamb, wholesale: wholesale.jamb, code: "jamb", color: "#000" },
        ]);
      } catch (e) {
        setExams([
          { id: "waec", name: "WAEC", price: 4200 + PROFIT.waec, wholesale: 4200, code: "waec", color: "#1e40af" },
          { id: "neco", name: "NECO", price: 1200 + PROFIT.neco, wholesale: 1200, code: "neco", color: "#15803d" },
          { id: "nabteb", name: "NABTEB", price: 800 + PROFIT.nabteb, wholesale: 800, code: "nabteb", color: "#7c2d12" },
          { id: "jamb", name: "JAMB", price: 4200 + PROFIT.jamb, wholesale: 4200, code: "jamb", color: "#000" },
        ]);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchRealPrices();
  }, []);

  const selected = exams.find(e => e.id === exam) || { price: 0, wholesale: 0 };
  const total = selected.price * quantity;

  const handleBuy = async () => {
    setErrorMsg("");
    const cleanPhone = phone.replace(/\s/g, "").replace("+234", "0");

    if (!cleanPhone) {
      setErrorMsg("Enter phone number");
      return;
    }
    if (cleanPhone.length < 11) {
      setErrorMsg("Phone number too short. Must be 11 digits");
      return;
    }
    if (cleanPhone.length > 11) {
      setErrorMsg("Phone number too long. Must be exactly 11 digits (e.g 08012345678)");
      return;
    }
    if (!/^[0-9]{11}$/.test(cleanPhone)) {
      setErrorMsg("Phone must be numbers only");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login first");

      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
      if (!profile || profile.balance < total) {
        setErrorMsg(`Insufficient balance. You need ₦${total.toLocaleString()}`);
        setLoading(false);
        return;
      }

      const response = await fetch(`${DATASTATION_BASE_URL}/exam/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Token ${DATASTATION_API_KEY}` },
        body: JSON.stringify({ type: selected.code, quantity, phone: cleanPhone })
      });
      const data = await response.json();

      if (data.status !== "success" && data.Status !== "successful") {
        throw new Error(data.message || data.msg || "Failed from DataStation");
      }

      const pins = data.pins || data.Pins || data.data || [];
      await supabase.from("profiles").update({ balance: profile.balance - total }).eq("id", user.id);
      await supabase.from("funding_history").insert({
        user_id: user.id, amount: total, type: "exam_pin", status: "success",
        details: `${selected.name} x${quantity} - ${JSON.stringify(pins)} - ${cleanPhone}`
      });
      setResultPins(pins);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPrices) return <div style={{ padding: 40, textAlign: "center" }}>Loading real prices...</div>;

  if (resultPins) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 380 }}>
          <div style={{ width: 60, height: 60, background: "#dcfce7", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>✓</div>
          <h2 style={{ textAlign: "center", margin: 0 }}>Purchase Successful</h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 13 }}>{selected.name} Pin</p>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, marginTop: 16, border: "1px dashed #cbd5e1" }}>
            {Array.isArray(resultPins) ? resultPins.map((p,i) => (
              <div key={i} style={{ padding: 10, background: "#fff", borderRadius: 8, marginBottom: 8, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                <span>{p.pin || p.PIN || p.code || p}</span>
                <span style={{ color: "#16a34a", fontSize: 11, cursor: "pointer" }} onClick={()=>navigator.clipboard.writeText(p.pin || p.PIN || p.code || p)}>COPY</span>
              </div>
            )) : <div>{JSON.stringify(resultPins)}</div>}
          </div>
          <button onClick={()=>{setResultPins(null); setPage("home")}} style={{ width: "100%", marginTop: 20, background: "#000", color: "#fff", padding: 14, borderRadius: 12, border: "none", fontWeight: 600 }}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setPage("home")} style={{ border: "none", background: "#fff", width: 40, height: 40, borderRadius: 12 }}>←</button>
        <h2 style={{ margin: 0 }}>Exam Pin</h2>
      </div>

      {errorMsg && <div style={{ background: "#fee2e2", color: "#dc2626", padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13, fontWeight: 500 }}>{errorMsg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
        {exams.map(e => (
          <button key={e.id} onClick={() => setExam(e.id)} style={{ background: exam === e.id ? e.color : "#fff", color: exam === e.id ? "#fff" : "#000", border: exam === e.id ? "none" : "1px solid #e2e8f0", borderRadius: 14, padding: 14, textAlign: "left" }}>
            <strong>{e.name}</strong><br/><small style={{ opacity: 0.7 }}>Buy ₦{e.price.toLocaleString()}</small>
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Quantity</label>
        <div style={{ display: "flex", gap: 10, margin: "8px 0 16px" }}>
          <button onClick={() => setQuantity(q => Math.max(1, q-1))} style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff" }}>-</button>
          <div style={{ flex: 1, textAlign: "center", lineHeight: "44px", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600 }}>{quantity}</div>
          <button onClick={() => setQuantity(q => q+1)} style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff" }}>+</button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600 }}>Phone Number (11 digits only)</label>
        <input 
          value={phone} 
          onChange={e=>{
            const val = e.target.value.replace(/[^0-9]/g, "");
            if (val.length <= 11) setPhone(val);
            else setErrorMsg("Phone number must not be more than 11 digits");
          }} 
          placeholder="08012345678" 
          type="tel"
          maxLength={11}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: errorMsg.includes("Phone") ? "1px solid #ef4444" : "1px solid #e2e8f0", marginTop: 6 }} 
        />
        <div style={{ fontSize: 11, color: phone.length > 11 ? "#ef4444" : "#64748b", marginTop: 4 }}>
          {phone.length}/11 digits {phone.length > 11 && "- Too long!"}
        </div>

        <div style={{ marginTop: 16, padding: 14, background: "#f8fafc", borderRadius: 12, display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span>Total</span><span>₦{total.toLocaleString()}</span>
        </div>

        <button onClick={handleBuy} disabled={loading} style={{ width: "100%", marginTop: 16, background: "#000", color: "#fff", padding: 16, borderRadius: 14, border: "none", fontWeight: 700, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Generating PIN..." : `Pay ₦${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
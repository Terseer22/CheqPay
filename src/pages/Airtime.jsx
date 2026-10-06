import { useState } from "react"
import { supabase } from "../supabase/supabaseClient"

const NETWORKS = [
  { id: 1, name: "MTN", color: "#FFCC00", text: "#000" },
  { id: 2, name: "GLO", color: "#00B050", text: "#fff" },
  { id: 3, name: "AIRTEL", color: "#FF0000", text: "#fff" },
  { id: 4, name: "9MOBILE", color: "#006400", text: "#fff" },
]

function SuccessModal({ show, onClose, phone, amount, networkName, error }) {
  if (!show) return null
  const isError = !!error
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width: "100%", maxWidth: 360, background: "#fff", borderRadius: 28,
        padding: 28, textAlign: "center", animation: "pop 0.4s ease"
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f2f2f2" }}>✕</button>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: isError? "#FF4444" : "#00C950", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isError? "0 0 0 12px rgba(255,68,68,0.15)" : "0 0 0 12px rgba(0,201,80,0.15)"
        }}>
          <span style={{ fontSize: 42, color: "#fff", fontWeight: 900 }}>{isError? "!" : "✓"}</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#111" }}>{isError? "Failed" : "Airtime Sent!"}</div>
        <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>{isError? error : `${networkName} ₦${amount} airtime sent to ${phone}`}</div>
        
        {!isError && (
          <div style={{ marginTop: 22, display: "grid", gap: 12, textAlign: "left" }}>
            <div style={{ background: "#f6f6f6", borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>📞</span>
              <div><div style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>To</div><div style={{ fontWeight: 800, color: "#111" }}>{phone}</div></div>
            </div>
            <div style={{ background: "#f6f6f6", borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>💰</span>
              <div><div style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>Amount</div><div style={{ fontWeight: 800, color: "#111" }}>₦{amount}</div></div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: "#999", marginTop: 16 }}>ID • CP{Date.now().toString().slice(-9)}</div>
        <button onClick={onClose} style={{ width: "100%", marginTop: 20, padding: 16, borderRadius: 16, border: "none", background: "#0A0A0A", color: "#fff", fontWeight: 800, fontSize: 16 }}>{isError? "Try Again" : "Done"}</button>
      </div>
      <style>{`@keyframes pop { 0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1} }`}</style>
    </div>
  )
}

export default function AirtimeStation({ setPage }) {
  const [network, setNetwork] = useState(1)
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ show: false, error: null })
  const activeNet = NETWORKS.find(n => n.id === network)

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000]

const handleBuy = async () => {
  if (!phone || phone.length < 11) {
    setModal({ show: true, error: "Enter valid phone number" }); return
  }
  if (!amount || Number(amount) < 50) {
    setModal({ show: true, error: "Minimum airtime is ₦50" }); return
  }
  setLoading(true)
  try {
    const { data, error } = await supabase.functions.invoke('buy-airtime', {
      body: { network, mobile_number: phone, amount: Number(amount) }
    })
    if (error) throw new Error(error.message)
    if (data?.Status === "failed") throw new Error(data?.message)

    setLoading(false)
    setModal({ show: true, error: null })

  } catch (e) {
    setLoading(false)
    setModal({ show: true, error: e.message })
  }
}

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff" }}>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, background: "#111", borderBottom: "1px solid #222", position: "sticky", top: 0 }}>
        <button onClick={() => setPage && setPage("home")} style={{ width: 36, height: 36, borderRadius: 12, background: "#222", border: "1px solid #333", color: "#fff", fontSize: 18 }}>←</button>
        <div><div style={{ fontWeight: 800 }}>Buy Airtime</div><div style={{ fontSize: 11, color: "#00ff88", fontWeight: 700 }}>Instant Recharge</div></div>
      </div>

      <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
          {NETWORKS.map(n => (
            <button key={n.id} onClick={() => setNetwork(n.id)}
              style={{
                minWidth: 78, padding: "12px 14px", borderRadius: 16,
                background: network === n.id? n.color : "#1E1E1E",
                color: network === n.id? n.text : "#888",
                border: network === n.id? `2px solid ${n.color}` : "1px solid #2a2a2a",
                fontWeight: 800, fontSize: 13
              }}>
              {n.name}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, background: "#151515", borderRadius: 20, padding: 16, border: "1px solid #252525" }}>
          <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 8 }}>PHONE NUMBER</div>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08012345678"
            style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 18, fontWeight: 700, outline: "none" }} />
        </div>

        <div style={{ marginTop: 18, background: "#151515", borderRadius: 20, padding: 16, border: "1px solid #252525" }}>
          <div style={{ fontSize: 11, color: "#888", fontWeight: 700, marginBottom: 8 }}>AMOUNT</div>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"
            style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: 28, fontWeight: 900, outline: "none" }} />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {quickAmounts.map(a => (
            <button key={a} onClick={()=>setAmount(a)} style={{
              padding: "8px 16px", borderRadius: 20, border: "1px solid #333",
              background: Number(amount)===a? "#fff" : "#1E1E1E",
              color: Number(amount)===a? "#000" : "#aaa", fontWeight: 700, fontSize: 13
            }}>₦{a}</button>
          ))}
        </div>

        <button onClick={handleBuy} disabled={loading}
          style={{ width: "100%", marginTop: 24, padding: 18, borderRadius: 20, border: "none", background: amount && phone? "#fff" : "#222", color: amount && phone? "#000" : "#555", fontWeight: 900, fontSize: 16 }}>
          {loading? "Sending..." : amount? `Pay ₦${amount}` : "Enter amount"}
        </button>
      </div>

      <SuccessModal
        show={modal.show}
        error={modal.error}
        onClose={()=>{ const err=!!modal.error; setModal({show:false,error:null}); if(!err && setPage) setPage("home") }}
        phone={phone}
        amount={amount}
        networkName={activeNet?.name}
      />
    </div>
  )
}
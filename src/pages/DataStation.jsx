import { useState } from "react"
import { supabase } from "../supabase/supabaseClient"

const PLANS = {
  1: [
    { id: 435, name: "1GB - 30 Days", sub: "SME • Hot", price: 370, cost: 300 },
    { id: 439, name: "500MB - 1 Day", sub: "SME", price: 270, cost: 200 },
    { id: 423, name: "1GB - 1 Day", sub: "Gifting", price: 320, cost: 255 },
    { id: 420, name: "2.5GB - 1 Day", sub: "SME", price: 750, cost: 650 },
    { id: 334, name: "750MB - 3 Days", sub: "SME", price: 520, cost: 441 },
    { id: 335, name: "2GB - 30 Days", sub: "SME • Popular", price: 1570, cost: 1470 },
    { id: 336, name: "3GB - 30 Days", sub: "SME", price: 2130, cost: 1980 },
    { id: 340, name: "1GB - 7 Days", sub: "SME", price: 885, cost: 785 },
    { id: 350, name: "500MB - 7 Days", sub: "SME", price: 590, cost: 490 },
    { id: 372, name: "5GB - 30 Days", sub: "SME • Best Value", price: 3250, cost: 3100 },
  ],
  2: [
    { id: 194, name: "1GB - 30 Days", sub: "Corporate", price: 500, cost: 425 },
    { id: 195, name: "2GB - 30 Days", sub: "Corporate", price: 950, cost: 850 },
    { id: 196, name: "3GB - 30 Days", sub: "Corporate", price: 1375, cost: 1275 },
    { id: 203, name: "500MB - 14 Days", sub: "Corporate", price: 280, cost: 212 },
    { id: 399, name: "1GB - 7 Days", sub: "Corporate", price: 455, cost: 355 },
  ],
  4: [
    { id: 281, name: "150MB - 1 Day", sub: "SME", price: 130, cost: 60 },
    { id: 404, name: "600MB - 2 Days", sub: "SME", price: 345, cost: 245 },
    { id: 425, name: "1.5GB - 7 Days", sub: "Corporate", price: 1145, cost: 1045 },
    { id: 427, name: "4GB - 30 Days", sub: "Corporate", price: 2695, cost: 2545 },
  ],
  3: [
    { id: 221, name: "500MB - 30 Days", sub: "Corporate", price: 310, cost: 240 },
    { id: 183, name: "1GB - 30 Days", sub: "Corporate", price: 580, cost: 480 },
    { id: 185, name: "2GB - 30 Days", sub: "Corporate", price: 1060, cost: 960 },
  ]
}

const NETWORKS = [
  { id: 1, name: "MTN", color: "#FFCC00", text: "#000" },
  { id: 2, name: "GLO", color: "#00B050", text: "#fff" },
  { id: 4, name: "AIRTEL", color: "#FF0000", text: "#fff" },
  { id: 3, name: "9MOBILE", color: "#006400", text: "#fff" },
]

function SuccessModal({ show, onClose, phone, plan, networkName, error }) {
  if (!show) return null
  const isError =!!error

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 360, background: "#fff", borderRadius: 28,
        padding: 28, textAlign: "center", position: "relative",
        animation: "pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          width: 32, height: 32, borderRadius: "50%", border: "none",
          background: "#f2f2f2", fontSize: 16, cursor: "pointer"
        }}>✕</button>

        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: isError? "#FF4444" : "#00C950", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: isError? "0 0 0 12px rgba(255,68,68,0.15)" : "0 0 0 12px rgba(0,201,80,0.15)"
        }}>
          <span style={{ fontSize: 42, color: "#fff", fontWeight: 900 }}>{isError? "!" : "✓"}</span>
        </div>

        <div style={{ fontWeight: 900, fontSize: 22, color: "#111" }}>{isError? "Failed" : "Payment Successful"}</div>
        <div style={{ fontSize: 14, color: "#666", marginTop: 8, lineHeight: 1.4 }}>
          {isError? error : `${networkName} ${plan?.name} has been sent successfully`}
        </div>

        {!isError && (
          <div style={{ marginTop: 22, display: "grid", gap: 12, textAlign: "left" }}>
            <div style={{ background: "#f6f6f6", borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 22 }}>📞</div>
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>Phone Number</div>
                <div style={{ fontWeight: 800, color: "#111", fontSize: 16 }}>{phone}</div>
              </div>
            </div>
            <div style={{ background: "#f6f6f6", borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 22 }}>💳</div>
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>Amount Paid</div>
                <div style={{ fontWeight: 800, color: "#111", fontSize: 16 }}>₦{plan?.price}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, color: "#999", marginTop: 16 }}>ID • CP{Date.now().toString().slice(-9)} • Now</div>

        <button onClick={onClose} style={{
          width: "100%", marginTop: 20, padding: 16, borderRadius: 16,
          border: "none", background: "#0A0A0A", color: "#fff",
          fontWeight: 800, fontSize: 16, cursor: "pointer"
        }}>{isError? "Try Again" : "Done"}</button>
      </div>
      <style>{`@keyframes pop { 0% { transform: scale(0.8); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }`}</style>
    </div>
  )
}

export default function DataStation({ setPage }) {
  const [network, setNetwork] = useState(1)
  const [selected, setSelected] = useState(null)
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ show: false, error: null })
  const plans = PLANS[network] || []
  const activeNet = NETWORKS.find(n => n.id === network)

  const handleBuy = async () => {
    if (!phone || phone.length < 11) {
      setModal({ show: true, error: "Enter valid phone number" })
      return
    }
    if (!selected) {
      setModal({ show: true, error: "Please select a data plan" })
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).single()

      if ((profile?.wallet_balance || 0) < selected.price) {
        setLoading(false)
        setModal({ show: true, error: `Insufficient balance. You have ₦${profile?.wallet_balance}` })
        return
      }

      const { data, error } = await supabase.functions.invoke('buy-data', {
        body: { network, mobile_number: phone, plan: selected.id, amount: selected.cost }
      })

      if (error) throw new Error(error.message)
      const status = (data?.Status || data?.status || "").toLowerCase()
      if (!(status === "successful" || status === "success")) {
        throw new Error(data?.api_response || data?.message || "Transaction failed")
      }

      const newBalance = (profile.wallet_balance || 0) - selected.price
      await supabase.from("profiles").update({ wallet_balance: newBalance }).eq("id", user.id)
      await supabase.from("transactions").insert({
        user_id: user.id, type: "data", amount: selected.price, cost_price: selected.cost,
        profit: selected.price - selected.cost, phone,
        plan_name: `${activeNet?.name} ${selected.name}`,
        network, status: "successful"
      })

      setLoading(false)
      setModal({ show: true, error: null })

    } catch (e) {
      setLoading(false)
      setModal({ show: true, error: e.message || "Something went wrong" })
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, background: "#111", borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setPage && setPage("home")} style={{ width: 36, height: 36, borderRadius: 12, background: "#222", border: "1px solid #333", color: "#fff", fontSize: 18 }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Buy Data</div>
          <div style={{ fontSize: 11, color: "#00ff88", fontWeight: 700 }}>Instant Delivery</div>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {NETWORKS.map(n => (
            <button key={n.id} onClick={() => { setNetwork(n.id); setSelected(null) }}
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
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600 }}>PHONE NUMBER</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#222", padding: "10px 12px", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>🇳🇬</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678"
              style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 18, fontWeight: 700, outline: "none" }} />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa" }}>{activeNet?.name} PLANS</div>
            <div style={{ fontSize: 11, background: "#222", color: "#aaa", padding: "4px 8px", borderRadius: 20, fontWeight: 700 }}>{plans.length} available</div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {plans.map(p => {
              const isSelected = selected?.id === p.id
              return (
                <div key={p.id} onClick={() => setSelected(p)}
                  style={{
                    background: isSelected? "#fff" : "#151515",
                    borderRadius: 18, padding: 14,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    border: isSelected? "2px solid #fff" : "1px solid #252525",
                    cursor: "pointer"
                  }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: isSelected? "#000" : "#fff" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: isSelected? "#666" : "#777", marginTop: 3 }}>{p.sub}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: isSelected? "#000" : "#fff" }}>₦{p.price}</div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={handleBuy} disabled={!selected || loading}
          style={{
            width: "100%", marginTop: 22, padding: 18, borderRadius: 20, border: "none",
            background: selected? "#fff" : "#222",
            color: selected? "#000" : "#555", fontWeight: 900, fontSize: 16
          }}>
          {loading? "Processing..." : selected? `Pay ₦${selected.price}` : "Select a plan"}
        </button>
      </div>

      <SuccessModal
        show={modal.show}
        error={modal.error}
        onClose={() => {
          const wasError =!!modal.error
          setModal({ show: false, error: null })
          if (!wasError && setPage) setPage("home")
        }}
        phone={phone}
        plan={selected}
        networkName={activeNet?.name}
      />
    </div>
  )
}
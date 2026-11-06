import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase/supabaseClient"
import { styles } from "./AirtimeStyles";
import { Lock, ShieldCheck } from "lucide-react";
import mtnlogo from "../logo/icons/mtn.webp";
import glologo from "../logo/icons/glo.webp";
import airtellogo from "../logo/icons/airtel.webp";
import mobilelogo from "../logo/icons/mobile.webp"

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})
const cap = (s) => s.toLowerCase().replace(/[a-z]/, (c) => c.toUpperCase());
const FALLBACK_PLANS = {
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
  { id: 1, name: "MTN", logo: mtnlogo },
  { id: 2, name: "GLO", logo: glologo },
  { id: 4, name: "AIRTEL", logo: airtellogo },
  { id: 3, name: "9MOBILE", logo: mobilelogo },
];

export default function DataStation() {
  const [activeNetwork, setActiveNetwork] = useState(null)
  const [selected, setSelected] = useState(null)
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState(null)
  const [myBalance, setMyBalance] = useState(null)
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [pinDigits, setPinDigits] = useState(["", "", "", ""])
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState("")
  const pinRefs = useRef([])

  const pin = pinDigits.join("")
  const isPinComplete = pin.length === 4

  const showToast = (msg, type = "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (!activeNetwork) return
    document.body.style.overflow = "hidden"
    const load = async () => {
      setPlansLoading(true); setSelected(null); setToast(null); setSuccess(false)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: w } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
        if (w) setMyBalance(Number(w.balance || 0))
        else {
          const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle()
          setMyBalance(Number(p?.wallet_balance || 0))
        }
      }
      try {
        const { data, error } = await supabase.functions.invoke('get-data-plans', { body: { network: activeNetwork.id } })
        if (!error && data?.success && data?.plans?.length > 0) {
          const fallbackList = FALLBACK_PLANS[activeNetwork.id] || []
          const fallbackMap = {}
          fallbackList.forEach((p) => { fallbackMap[String(p.id)] = p })
          const mapped = data.plans.map((p) => {
            const fb = fallbackMap[String(p.id)]
            return {
              id: Number(p.id),
              name: fb ? fb.name : p.name,
              sub: fb ? fb.sub : (p.plan_type || ""),
              price: fb ? fb.price : Number(p.amount),
              cost: Number(p.base_price || (fb && fb.cost) || 0),
            }
          })
          setPlans(mapped)
        } else {
          setPlans(FALLBACK_PLANS[activeNetwork.id] || [])
        }
      } catch { setPlans(FALLBACK_PLANS[activeNetwork.id] || []) }
      setPlansLoading(false)
    }
    load()
    return () => { document.body.style.overflow = "auto" }
  }, [activeNetwork])

  const handlePayClick = async () => {
    if (!phone || phone.length < 11 || !selected) { showToast("Enter 11-digit phone number and select a plan"); return }
    setToast(null)
    const { data: hasPin, error } = await supabase.rpc("has_user_pin")
    if (error) { showToast(error.message); return }
    if (!hasPin) { showToast("You never set PIN. Set PIN in Settings first"); return }
    setPinDigits(["", "", "", ""]); setPinError(""); setShowPin(true)
  }

  const handlePinChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...pinDigits]
    next[index] = digit
    setPinDigits(next)
    setPinError("")
    if (digit && index < 3) pinRefs.current[index + 1]?.focus()
  }

  const handlePinKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const next = [...pinDigits]
      if (next[index]) {
        next[index] = ""
        setPinDigits(next)
      } else if (index > 0) {
        next[index - 1] = ""
        setPinDigits(next)
        pinRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === "ArrowLeft" && index > 0) pinRefs.current[index - 1]?.focus()
    if (e.key === "ArrowRight" && index < 3) pinRefs.current[index + 1]?.focus()
  }

  const handlePinPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4).split("")
    if (!pasted.length) return
    const next = ["", "", "", ""]
    pasted.forEach((d, i) => { next[i] = d })
    setPinDigits(next)
    setPinError("")
    const last = Math.min(pasted.length, 4) - 1
    pinRefs.current[last]?.focus()
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return
    setPinLoading(true); setPinError("")
    try {
      const { data, error } = await supabase.rpc("verify_user_pin", { p_pin: pin })
      if (error) throw error
      if (!data.success) throw new Error(data.message || "Wrong PIN, try again")
      setShowPin(false); setPinDigits(["", "", "", ""])
      await handleBuy()
    } catch (e) {
      setPinError(e.message)
      setPinDigits(["", "", "", ""])
      setTimeout(() => pinRefs.current[0]?.focus(), 50)
    }
    finally { setPinLoading(false) }
  }

  const handleBuy = async () => {
    if (!phone || phone.length < 11 || !selected) return
    setLoading(true); setToast(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: w } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
      let currentBalance = Number(w?.balance || 0)
      if (!w) {
        const { data: p } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle()
        currentBalance = Number(p?.wallet_balance || 0)
      }
      setMyBalance(currentBalance)
      if (currentBalance < selected.price) throw new Error(`Low balance. Your balance na ₦${formatMoney(currentBalance)}, you need ₦${formatMoney(selected.price)}. Fund wallet first.`)

      const { data, error } = await supabase.functions.invoke('buy-data', {
        body: { network: activeNetwork.id, mobile_number: phone, plan: selected.id, plan_name: selected.name, amount: selected.price }
      })
      if (error) throw new Error(error.message)
      if (data?.Status === "failed" || data?.status === "failed") {
        if (data?.code === "USER_LOW") throw new Error(data.message)
        if (data?.code === "PROVIDER_LOW") throw new Error(`${activeNetwork.name} is temporarily unavailable. Please try another network or try again in 5 minutes.`)
        throw new Error(data.message || "Data failed")
      }
      if (data?.success || data?.Status === "successful") {
        setMyBalance(currentBalance - selected.price)
        setSuccess(true)
      } else throw new Error(data?.message || "Failed to send data")
    } catch (e) {
      let msg = e.message || "Data failed"
      if (msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("topup due to") || msg.toLowerCase().includes("provider_low")) {
        msg = `${activeNetwork.name} is temporarily unavailable. Please try another network or try again in 5 minutes.`
      }
      showToast(msg, "error")
    } finally { setLoading(false) }
  }

  const closeSuccess = () => { setSuccess(false); setActiveNetwork(null); setPhone(""); setSelected(null) }
  const closePin = () => { setShowPin(false); setPinDigits(["", "", "", ""]); setPinError("") }

  return (
    <>
      <div style={styles.rowCard}>
        <h3 style={styles.title}>Buy Data</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {NETWORKS.map(net => (
            <button
              key={net.id}
              onClick={() => { setActiveNetwork(net); setSelected(null) }}
              style={{
                background: "#1E242E",
                border: activeNetwork?.id === net.id ? "2px solid #FFEB3B" : "1px solid #2C3440",
                borderRadius: 14,
                padding: "12px 6px 10px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6
              }}
            >
              <img
                src={net.logo}
                alt={net.name}
                style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10, background: "#fff", padding: 4 }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                {cap(net.name)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 20000, background: "#1A1A1A", color: "#fff", borderLeft: `4px solid ${toast.type === "error" ? "#FF4444" : "#00C853"}`, padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, maxWidth: "92%", width: 360, boxShadow: "0 10px 30px rgba(0,0,0,0.4)", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span>{toast.type === "error" ? "⚠️" : "✓"}</span>
          <span style={{ flex: 1 }}>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      )}

      {activeNetwork && (
        <div style={styles.modalWrapper}>
          <div style={styles.backdrop} onClick={() => setActiveNetwork(null)}></div>
          <div style={{...styles.modalCard, maxHeight:"85vh", overflowY:"auto"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                <img src={activeNetwork.logo} style={{width:"36px", height:"36px", borderRadius:"50%", background:"#fff", objectFit:"cover"}} />
                <h2 style={{color:"#fff", margin:0, fontSize:"20px"}}>{activeNetwork.name} Data</h2>
              </div>
              <button onClick={() => setActiveNetwork(null)} style={{width:"32px", height:"32px", borderRadius:"50%", border:"none", background:"#2C3440", color:"#fff", cursor:"pointer"}}>✕</button>
            </div>

            {myBalance !== null && (
              <div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "10px 12px", borderRadius: 10, fontSize: 13, color: "#fff", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888" }}>Wallet Balance</span><span style={{ fontWeight: 800 }}>₦{formatMoney(myBalance)}</span>
              </div>
            )}

            <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px"}}>PHONE NUMBER</div>
            <input style={styles.input} value={phone} onChange={e=>{setPhone(e.target.value.replace(/\D/g,"")); setToast(null)}} placeholder="08012345678" maxLength={11} />

            <div style={{marginTop:"16px"}}>
              <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"8px"}}>{cap(activeNetwork.name)} PLANS • {plans.length} available</div>
              {plansLoading ? <p style={{color:"#888", fontSize:12}}>Loading plans...</p> : (
              <div style={{display:"grid", gap:"8px", maxHeight:"260px", overflowY:"auto", paddingRight:"4px"}}>
                {plans.map(p => (
                  <div key={p.id} onClick={() => {setSelected(p); setToast(null)}}
                    style={{ background: selected?.id === p.id ? "#fff" : "#2C3440", borderRadius:"14px", padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
                    <div>
                      <div style={{fontWeight:800, fontSize:"13px", color: selected?.id === p.id ? "#000" : "#fff"}}>{p.name}</div>
                      <div style={{fontSize:"10px", color: selected?.id === p.id ? "#666" : "#aaa"}}>{p.sub}</div>
                    </div>
                    <div style={{fontWeight:900, fontSize:"14px", color: selected?.id === p.id ? "#000" : "#fff"}}>₦{formatMoney(p.price)}</div>
                  </div>
                ))}
              </div>
              )}
            </div>

            <button onClick={handlePayClick} disabled={!selected || !phone || loading}
              style={{...styles.payBtn, background: selected ? "#FFEB3B" : "#333", color: selected ? "#000" : "#777", marginTop:"18px", opacity: loading ? 0.7 : 1}}>
              {loading ? "Processing..." : selected ? `Pay ₦${formatMoney(selected.price)}` : "Select plan"}
            </button>
          </div>
        </div>
      )}

      {showPin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10000, padding: 0 }} onClick={closePin}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#141A24', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '12px 24px 28px', width: '100%', maxWidth: 420, textAlign: 'center', borderTop: '1px solid #2C3440', boxShadow: '0 -20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 44, height: 5, borderRadius: 99, background: '#2C3440', margin: '0 auto 20px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFEB3B', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(255,235,59,0.25)' }}>
              <Lock size={26} color="#000" strokeWidth={2.4} />
            </div>
            <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>Enter Transaction PIN</h3>
            <p style={{ fontSize: 13, color: '#9AA3B2', margin: '0 0 6px', lineHeight: 1.5 }}>Pay <b style={{ color: '#fff' }}>₦{formatMoney(selected?.price)}</b> to <b style={{ color: '#fff' }}>{phone}</b></p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 22px' }}>{activeNetwork?.name} • {selected?.name}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 14 }}>
              {pinDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { pinRefs.current[i] = el }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  onPaste={handlePinPaste}
                  onFocus={(e) => e.target.select()}
                  autoFocus={i === 0}
                  style={{
                    width: 58, height: 62, borderRadius: 16, textAlign: 'center',
                    fontSize: 26, fontWeight: 800, color: '#fff',
                    background: digit ? '#1E2633' : '#0F131A',
                    border: `1.5px solid ${pinError ? '#FF5252' : digit ? '#FFEB3B' : '#2C3440'}`,
                    outline: 'none', transition: 'all 0.15s ease',
                    boxShadow: digit ? '0 0 0 3px rgba(255,235,59,0.12)' : 'none',
                    caretColor: '#FFEB3B'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
              {pinDigits.map((d, i) => (
                <div key={i} style={{ width: d ? 20 : 8, height: 6, borderRadius: 99, background: d ? '#FFEB3B' : '#2C3440', transition: 'all 0.2s' }} />
              ))}
            </div>
            {pinError && (
              <div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', color: '#FF8A8A', fontSize: 12.5, fontWeight: 600, padding: '10px 12px', borderRadius: 12, marginBottom: 14 }}>
                {pinError}
              </div>
            )}
            <button
              onClick={handlePinSubmit}
              disabled={pinLoading || !isPinComplete}
              style={{
                width: '100%', padding: 15, borderRadius: 14, border: 'none',
                background: isPinComplete ? '#FFEB3B' : '#2C3440',
                color: isPinComplete ? '#000' : '#777',
                fontWeight: 800, fontSize: 15, cursor: isPinComplete ? 'pointer' : 'not-allowed',
                marginBottom: 10, opacity: pinLoading ? 0.7 : 1
              }}>
              {pinLoading ? "Verifying..." : "Confirm Payment"}
            </button>
            <button onClick={closePin} style={{ background: 'none', border: 'none', color: '#9AA3B2', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8 }}>
              Cancel
            </button>
            <p style={{ fontSize: 11, color: '#5C6675', margin: '12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Lock size={11} color="#5C6675" /> Your PIN is encrypted and never stored on this device
            </p>
          </div>
        </div>
      )}

      {success && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, padding: 20 }}>
          <div style={{ background: '#1E242E', borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center', border: '1px solid #2C3440' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#00C853', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 30 }}>✓</div>
            <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 6px' }}>Data Sent Successfully</h3>
            <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 16px' }}>{selected?.name} • {activeNetwork?.name}</p>
            <div style={{ background: '#0F131A', borderRadius: 12, padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#fff', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Phone</span><span style={{ fontWeight: 700 }}>{phone}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Amount</span><span style={{ fontWeight: 700 }}>₦{formatMoney(selected?.price)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>New Balance</span><span style={{ fontWeight: 700 }}>₦{formatMoney(myBalance)}</span></div>
            </div>
            <button onClick={closeSuccess} style={{ width: '100%', padding: 13, borderRadius: 12, border: 'none', background: '#FFEB3B', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}
    </>
  )
}
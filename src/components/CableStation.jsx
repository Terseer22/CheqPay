import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase/supabaseClient"
import { styles } from "./AirtimeStyles";
import { Lock } from "lucide-react";
import dstvlogo from "../logo/icons/dstv.jpg";
import gotvlogo from "../logo/icons/gotv.jpg";
import startimeslogo from "../logo/icons/startimes.jpg";

const cap = (s) => s.toLowerCase().replace(/[a-z]/, (c) => c.toUpperCase());

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const PROVIDERS = [
  { id: "dstv", name: "DStv", logo: dstvlogo, color: "#0066cc" },
  { id: "gotv", name: "GOtv", logo: gotvlogo, color: "#00a651" },
  { id: "startimes", name: "StarTimes", logo: startimeslogo, color: "#ff6600" },
]

const PLANS = {
  dstv: [
    { id: 20, name: "DStv Padi", price: 4450 },
    { id: 6, name: "DStv Yanga", price: 6050 },
    { id: 19, name: "DStv Confam", price: 11050 },
    { id: 7, name: "DStv Compact", price: 19050 },
    { id: 8, name: "DStv Compact Plus", price: 30050 },
    { id: 9, name: "DStv Premium", price: 44550 },
    { id: 21, name: "DStv Great Wall Standalone", price: 3850 },
    { id: 24, name: "DStv Premium French", price: 69050 },
    { id: 25, name: "DStv Premium Asia", price: 50550 },
    { id: 26, name: "DStv Confam + ExtraView", price: 17050 },
    { id: 27, name: "DStv Yanga + ExtraView", price: 12050 },
    { id: 28, name: "DStv Padi + ExtraView", price: 10450 },
    { id: 29, name: "DStv Compact + Extra View", price: 25050 },
    { id: 30, name: "DStv Premium + Extra View", price: 50550 },
    { id: 31, name: "DStv Compact Plus - Extra View", price: 36050 },
    { id: 33, name: "ExtraView Access", price: 6050 },
  ],
  gotv: [
    { id: 34, name: "GOtv Smallie - Monthly", price: 1950 },
    { id: 35, name: "GOtv Smallie - Quarterly", price: 5150 },
    { id: 36, name: "GOtv Smallie - Yearly", price: 15050 },
    { id: 16, name: "GOtv Jinja", price: 3950 },
    { id: 17, name: "GOtv Jolli", price: 5850 },
    { id: 2, name: "GOtv Max", price: 8550 },
    { id: 48, name: "GOtv Supa - Monthly", price: 11450 },
    { id: 47, name: "Supa Plus - Monthly", price: 16850 },
  ],
  startimes: [
    { id: 37, name: "Nova - 700 Naira - 1 Week", price: 750 },
    { id: 38, name: "Basic - 1400 Naira - 1 Week", price: 1450 },
    { id: 39, name: "Smart - 1700 Naira - 1 Week", price: 1750 },
    { id: 40, name: "Classic - 2000 Naira - 1 Week", price: 2050 },
    { id: 41, name: "Super - 3300 Naira - 1 Week", price: 3350 },
    { id: 14, name: "Nova - 2100 Naira - 1 Month", price: 2150 },
    { id: 49, name: "Basic - 4000 - 1 Month", price: 4050 },
    { id: 13, name: "Smart - 5100 Naira - 1 Month", price: 5150 },
    { id: 11, name: "Classic - 6000 Naira - 1 Month", price: 6050 },
    { id: 15, name: "Super - 9800 Naira - 1 Month", price: 9850 },
  ],
}

export default function CableStation() {
  const [active, setActive] = useState(null)
  const [smartcard, setSmartcard] = useState("")
  const [plan, setPlan] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [toast, setToast] = useState(null)
  const [myBalance, setMyBalance] = useState(null)
  const [showPin, setShowPin] = useState(false)
  const [pinDigits, setPinDigits] = useState(["", "", "", ""])
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState("")
  const pinRefs = useRef([])

  const pin = pinDigits.join("")
  const isPinComplete = pin.length === 4
  const currentPlans = active ? PLANS[active.id] || [] : []
  const selectedPlan = currentPlans.find(p => p.id === plan)

  const showToast = (msg, type = "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(()=>{ document.body.style.overflow = active || showPin ? "hidden" : "auto"; return () => { document.body.style.overflow = "auto" } }, [active, showPin])

  useEffect(() => {
    if (!active) return
    const fetchMyBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
      if (wallet) { setMyBalance(Number(wallet.balance || 0)); return }
      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle()
      setMyBalance(Number(profile?.wallet_balance || 0))
    }
    fetchMyBalance()
  }, [active])

  const handlePayClick = async () => {
    if(!smartcard || smartcard.length < 10){ showToast("Enter valid Smartcard / IUC (10 digits)"); return }
    if(!plan){ showToast("Select a plan"); return }
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
      if (next[index]) { next[index] = ""; setPinDigits(next) }
      else if (index > 0) { next[index - 1] = ""; setPinDigits(next); pinRefs.current[index - 1]?.focus() }
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
    setPinDigits(next); setPinError("")
    pinRefs.current[Math.min(pasted.length, 4) - 1]?.focus()
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return
    setPinLoading(true); setPinError("")
    try {
      const { data, error } = await supabase.rpc("verify_user_pin", { p_pin: pin })
      if (error) throw error
      if (!data.success) throw new Error(data.message || "Wrong PIN, try again")
      setShowPin(false); setPinDigits(["", "", "", ""])
      await handleBuyReal()
    } catch (e) {
      setPinError(e.message)
      setPinDigits(["", "", "", ""])
      setTimeout(() => pinRefs.current[0]?.focus(), 50)
    } finally { setPinLoading(false) }
  }

  const handleBuyReal = async () => {
    setLoading(true); setToast(null)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
      let currentBalance = Number(wallet?.balance || 0)
      if (!wallet) {
        const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle()
        currentBalance = Number(profile?.wallet_balance || 0)
      }
      setMyBalance(currentBalance)
      if(currentBalance < selectedPlan.price) throw new Error(`Low balance. Your balance na ₦${formatMoney(currentBalance)}, you need ₦${formatMoney(selectedPlan.price)}. Fund wallet first.`)

      const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle()
      const userPhone = profile?.phone || user?.phone || smartcard

      const { data, error } = await supabase.functions.invoke('cable-sub', {
        body: {
          decoder_type: active.id,
          cableplan_id: selectedPlan.id,
          smartcard: smartcard,
          amount: selectedPlan.price,
          phone: userPhone,
        }
      })
      if (error) throw new Error(error.message)
      if (data?.Status === "failed" || data?.status === "failed") {
        if (data?.code === "USER_LOW") throw new Error(data.message)
        if (data?.code === "PROVIDER_LOW") throw new Error(`${active.name} is temporarily unavailable. Please try again in 5 minutes.`)
        throw new Error(data.message || "Cable failed")
      }
      if (data?.success || data?.Status === "successful" || data?.status === "successful") {
        setMyBalance(currentBalance - selectedPlan.price)
        setSuccess(true)
      } else throw new Error(data?.message || "Failed to renew cable")
    }catch(e){
      let msg = e.message || "Cable failed"
      if (msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("topup due to") || msg.toLowerCase().includes("provider_low")) {
        msg = `${active.name} is temporarily unavailable. Please try again in 5 minutes.`
      }
      showToast(msg)
    } finally { setLoading(false) }
  }

  const closePin = () => { setShowPin(false); setPinDigits(["", "", "", ""]); setPinError("") }
  const closeSuccess = () => { setSuccess(false); setActive(null); setSmartcard(""); setPlan("") }

  return (
    <>
      <div style={styles.rowCard}>
        <h3 style={styles.title}>Cable TV</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={()=>{ setActive(p); setPlan(""); setToast(null) }}
              style={{
                background: "#1E242E",
                border: active?.id === p.id ? "2px solid #FFEB3B" : "1px solid #2C3440",
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
                src={p.logo}
                alt={p.name}
                style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10, background: "#fff", padding: 4 }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                {cap(p.name)}
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

      {active && (
        <div style={styles.modalWrapper}>
          <div style={styles.backdrop} onClick={()=>setActive(null)}></div>
          <div style={{...styles.modalCard, maxHeight:"85vh", overflowY:"auto"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                <img src={active.logo} style={{width:"40px", height:"40px", borderRadius:"50%", background:"#fff", objectFit:"cover", padding:"2px"}} />
                <h2 style={{color:"#fff", margin:0, fontSize:"20px"}}>{active.name}</h2>
              </div>
              <button onClick={()=>setActive(null)} style={{width:"36px", height:"36px", borderRadius:"50%", border:"none", background:"#2C3440", color:"#fff", cursor:"pointer", fontSize:"18px", fontWeight:700}}>✕</button>
            </div>

            {myBalance !== null && (
              <div style={{background:"#1a1a1a", border:"1px solid #333", padding:"10px 12px", borderRadius:"10px", fontSize:"13px", color:"#fff", marginBottom:"12px", display:"flex", justifyContent:"space-between"}}>
                <span style={{color:"#888"}}>Wallet Balance</span>
                <span style={{fontWeight:800}}>₦{formatMoney(myBalance)}</span>
              </div>
            )}

            <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px"}}>SMARTCARD / IUC ({smartcard.length}/10)</div>
            <input value={smartcard} onChange={e=>{setSmartcard(e.target.value.replace(/\D/g,"")); setToast(null)}} maxLength={11} placeholder="e.g 10456789432" style={styles.input} />

            <div style={{marginTop:"16px"}}>
              <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"8px"}}>{cap(active.name)} PLANS</div>
              <div style={{display:"grid", gap:"8px", maxHeight:"280px", overflowY:"auto"}}>
                {currentPlans.map(pl=>(
                  <div key={pl.id} onClick={()=>{setPlan(pl.id); setToast(null)}}
                    style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:"14px", cursor:"pointer", background: plan===pl.id ? "#fff" : "#2C3440" }}>
                    <span style={{fontSize:"13px", fontWeight:700, color: plan===pl.id ? "#000" : "#fff"}}>{pl.name}</span>
                    <span style={{fontSize:"13px", fontWeight:900, color: plan===pl.id ? "#000" : "#00ff88"}}>₦{formatMoney(pl.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handlePayClick} disabled={loading}
              style={{...styles.payBtn, background: plan && smartcard.length>=10 ? "#FFEB3B" : "#333", color: plan && smartcard.length>=10 ? "#000" : "#777", marginTop:"18px", opacity: loading ? 0.7 : 1}}>
              {loading ? "Processing..." : plan ? `Pay ₦${formatMoney(selectedPlan?.price)}` : "Select plan"}
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
            <p style={{ fontSize: 13, color: '#9AA3B2', margin: '0 0 6px', lineHeight: 1.5 }}>Pay <b style={{ color: '#fff' }}>₦{formatMoney(selectedPlan?.price)}</b> to <b style={{ color: '#fff' }}>{smartcard}</b></p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 22px' }}>{active?.name} • {selectedPlan?.name}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 14 }}>
              {pinDigits.map((digit, i) => (
                <input key={i} ref={(el) => { pinRefs.current[i] = el }} type="password" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handlePinChange(i, e.target.value)} onKeyDown={(e) => handlePinKeyDown(i, e)} onPaste={handlePinPaste} onFocus={(e) => e.target.select()} autoFocus={i === 0}
                  style={{ width: 58, height: 62, borderRadius: 16, textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#fff', background: digit ? '#1E2633' : '#0F131A', border: `1.5px solid ${pinError ? '#FF5252' : digit ? '#FFEB3B' : '#2C3440'}`, outline: 'none', transition: 'all 0.15s ease', boxShadow: digit ? '0 0 0 3px rgba(255,235,59,0.12)' : 'none', caretColor: '#FFEB3B' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
              {pinDigits.map((d, i) => (<div key={i} style={{ width: d ? 20 : 8, height: 6, borderRadius: 99, background: d ? '#FFEB3B' : '#2C3440', transition: 'all 0.2s' }} />))}
            </div>
            {pinError && (<div style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', color: '#FF8A8A', fontSize: 12.5, fontWeight: 600, padding: '10px 12px', borderRadius: 12, marginBottom: 14 }}>{pinError}</div>)}
            <button onClick={handlePinSubmit} disabled={pinLoading || !isPinComplete} style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', background: isPinComplete ? '#FFEB3B' : '#2C3440', color: isPinComplete ? '#000' : '#777', fontWeight: 800, fontSize: 15, cursor: isPinComplete ? 'pointer' : 'not-allowed', marginBottom: 10, opacity: pinLoading ? 0.7 : 1 }}>{pinLoading ? "Verifying..." : "Confirm Payment"}</button>
            <button onClick={closePin} style={{ background: 'none', border: 'none', color: '#9AA3B2', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8 }}>Cancel</button>
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
            <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 6px' }}>Cable Paid Successfully</h3>
            <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 16px' }}>{active?.name} • {selectedPlan?.name}</p>
            <div style={{ background: '#0F131A', borderRadius: 12, padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#fff', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Smartcard</span><span style={{ fontWeight: 700 }}>{smartcard}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Amount</span><span style={{ fontWeight: 700 }}>₦{formatMoney(selectedPlan?.price)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>New Balance</span><span style={{ fontWeight: 700 }}>₦{formatMoney(myBalance)}</span></div>
            </div>
            <button onClick={closeSuccess} style={{ width: '100%', padding: 13, borderRadius: 12, border: 'none', background: '#FFEB3B', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}
    </>
  )
}
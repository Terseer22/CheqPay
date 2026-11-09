import { useState, useEffect, useRef } from "react"
import { supabase } from "../supabase/supabaseClient"
import { styles } from "./AirtimeStyles";
import { Lock, ShieldCheck } from "lucide-react";

// IMPORT FROM src/logo/icons
import ikedcLogo from "../logo/icons/ikeja.webp";
import ekedcLogo from "../logo/icons/eko.webp";
import aedcLogo from "../logo/icons/abuja.webp";
import kedcoLogo from "../logo/icons/kedco.webp";
import eedcLogo from "../logo/icons/eedc.webp";
import phedLogo from "../logo/icons/phed.webp";
import ibedcLogo from "../logo/icons/ibedc.webp";
import kaedcoLogo from "../logo/icons/kaedco.webp";
import jedLogo from "../logo/icons/jos.webp";
import bedcLogo from "../logo/icons/bedc.webp";
import yedcLogo from "../logo/icons/yedc.webp";

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const DISCOS = [
  { id: 1, name: "Ikeja Electric", short: "ikeja", logo: ikedcLogo },
  { id: 2, name: "Eko Electric", short: "eko", logo: ekedcLogo },
  { id: 3, name: "Abuja Electric", short: "abuja", logo: aedcLogo },
  { id: 4, name: "Kano Electric", short: "kedco", logo: kedcoLogo },
  { id: 5, name: "Enugu Electric", short: "eedc", logo: eedcLogo },
  { id: 6, name: "Port Harcourt Electric", short: "phed", logo: phedLogo },
  { id: 7, name: "Ibadan Electric", short: "ibedc", logo: ibedcLogo },
  { id: 8, name: "Kaduna Electric", short: "kaedco", logo: kaedcoLogo },
  { id: 9, name: "Jos Electric", short: "jos", logo: jedLogo },
  { id: 10, name: "Benin Electric", short: "bedc", logo: bedcLogo },
  { id: 11, name: "Yola Electric", short: "yedc", logo: yedcLogo },
]

const PROFIT = 50

export default function electricitystation() {
  const [active, setActive] = useState(null)
  const [meterNumber, setMeterNumber] = useState("")
  const [meterType, setMeterType] = useState("prepaid")
  const [amount, setAmount] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [toast, setToast] = useState(null)
  const [myBalance, setMyBalance] = useState(null)
  const [showPin, setShowPin] = useState(false)
  const [pinDigits, setPinDigits] = useState(["", "", "", ""])
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState("")
  const pinRefs = useRef([])

  const pin = pinDigits.join("")
  const isPinComplete = pin.length === 4
  const totalToPay = amount ? Number(amount) + PROFIT : 0

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

  const handleVerify = async () => {
    if (!meterNumber || meterNumber.length < 10) { showToast("Enter valid meter number"); return }
    setVerifying(true); setToast(null)
    try {
      const { data, error } = await supabase.functions.invoke('verify-meter', {
        body: {
          disco_name: active.name,
          meter_number: meterNumber.trim(),
          meter_type: meterType.toUpperCase()
        }
      })
      if (error) throw new Error(error.message)
      console.log("Verify result:", data)
      if (data?.invalid === true || data?.name === "INVALID METER NUMBER") throw new Error("Invalid meter number. Check number, Disco and Prepaid/Postpaid.")
      const name = data?.name || data?.customer_name || data?.data?.name
      if (!name) throw new Error("Meter not found. Check number and try again.")
      setCustomerName(name)
      setCustomerAddress(data?.address || "")
      setVerified(true)
      showToast(`Meter verified: ${name}`, "success")
    } catch (e) {
      setVerified(false); setCustomerName(""); setCustomerAddress("")
      showToast(e.message)
    } finally { setVerifying(false) }
  }

  const handlePayClick = async () => {
    if (!verified || !customerName) { showToast("Verify meter first"); return }
    if (!amount || Number(amount) < 500) { showToast("Minimum amount na ₦500"); return }
    if (!customerPhone || customerPhone.length !== 11) { showToast("Enter 11-digit customer phone - token go send there"); return }
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
      const { data, error } = await supabase.functions.invoke('buy-electricity', {
        body: {
          disco_id: active.id,
          disco_name: active.name,
          meter_number: meterNumber.trim(),
          meter_type: meterType.toUpperCase(),
          customer_name: customerName,
          customer_address: customerAddress,
          amount: Number(amount),
          total_amount: totalToPay,
          phone: customerPhone,
          customer_phone: customerPhone,
        }
      })
      if (error) throw new Error(error.message)
      if (data?.Status === "failed" || data?.status === "failed") {
        if (data?.code === "USER_LOW") throw new Error(data.message)
        if (data?.code === "PROVIDER_LOW") throw new Error(`${active.name} is temporarily unavailable. Please try again in 5 minutes.`)
        throw new Error(data.message || "Electricity failed")
      }
      if (data?.success || data?.Status === "successful" || data?.status === "successful" || data?.token) {
        const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
        if (wallet) setMyBalance(Number(wallet.balance || 0))
        else {
          const { data: p2 } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle()
          setMyBalance(Number(p2?.wallet_balance || 0))
        }
        setSuccessData(data?.data || data)
        setSuccess(true)
      } else throw new Error(data?.message || "Failed to buy electricity")
    }catch(e){
      let msg = e.message || "Electricity failed"
      if (msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("topup due to") || msg.toLowerCase().includes("provider_low")) {
        msg = `${active.name} is temporarily unavailable. Please try again in 5 minutes.`
      }
      showToast(msg)
    } finally { setLoading(false) }
  }

  const closePin = () => { setShowPin(false); setPinDigits(["", "", "", ""]); setPinError("") }
  const closeSuccess = () => { setSuccess(false); setActive(null); setMeterNumber(""); setAmount(""); setCustomerPhone(""); setCustomerName(""); setCustomerAddress(""); setVerified(false); setSuccessData(null) }
  const resetMeter = () => { setVerified(false); setCustomerName(""); setCustomerAddress(""); setAmount("") }

  return (
    <>
      <div style={styles.rowCard}>
        <h3 style={styles.title}>Electricity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {DISCOS.map(d => (
            <button key={d.id} onClick={()=>{ setActive(d); setToast(null); resetMeter() }} style={{ background: "#1E242E", border: active?.id === d.id ? "2px solid #FFEB3B" : "1px solid #2C3440", borderRadius: 14, padding: "12px 6px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <img src={d.logo} alt={d.short} style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10, background: "#fff", padding: 4 }} />
              {/* WHITE NAME ONLY - grey one removed, first letter capital */}
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "capitalize", textAlign: "center", lineHeight: 1.2 }}>{d.short}</span>
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
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <img src={active.logo} alt={active.short} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12, background: "#fff", padding: 4 }} />
                <div>
                  <h2 style={{color:"#fff", margin:0, fontSize:"20px"}}>{active.name}</h2>
                  <p style={{color:"#ccc", fontSize:"12px", margin:"2px 0 0", textTransform:"capitalize"}}>{active.short} • {meterType === "prepaid" ? "Prepaid" : "Postpaid"}</p>
                </div>
              </div>
              <button onClick={()=>setActive(null)} style={{width:"36px", height:"36px", borderRadius:"50%", border:"none", background:"#2C3440", color:"#fff", cursor:"pointer", fontSize:"18px", fontWeight:700}}>✕</button>
            </div>

            {myBalance !== null && (
              <div style={{background:"#1a1a1a", border:"1px solid #333", padding:"10px 12px", borderRadius:"10px", fontSize:"13px", color:"#fff", marginBottom:"12px", display:"flex", justifyContent:"space-between"}}>
                <span style={{color:"#888"}}>Wallet Balance</span>
                <span style={{fontWeight:800}}>₦{formatMoney(myBalance)}</span>
              </div>
            )}

            <div style={{display:"flex", gap:8, marginBottom:14}}>
              {["prepaid","postpaid"].map(t => (
                <button key={t} onClick={()=>{ setMeterType(t); resetMeter() }} style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background: meterType===t ? "#FFEB3B" : "#2C3440", color: meterType===t ? "#000" : "#fff", fontWeight:800, fontSize:13, cursor:"pointer", textTransform:"capitalize" }}>{t}</button>
              ))}
            </div>

            <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px"}}>METER NUMBER</div>
            <input value={meterNumber} onChange={e=>{ setMeterNumber(e.target.value.replace(/\D/g,"")); resetMeter(); setToast(null) }} maxLength={13} placeholder="e.g 12345678901" style={styles.input} />

            <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px", marginTop:14}}>CUSTOMER PHONE</div>
            <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value.replace(/\D/g,"").slice(0,11))} maxLength={11} placeholder="e.g 07041613005 - token go send here" style={styles.input} />
            <div style={{fontSize:"11px", color:"#666", marginTop:4}}>Token go send to this number by SMS</div>

            {!verified ? (
              <button onClick={handleVerify} disabled={verifying || meterNumber.length < 10} style={{ width:"100%", padding:13, borderRadius:12, border:"none", background: meterNumber.length>=10 ? "#fff" : "#333", color: meterNumber.length>=10 ? "#000" : "#777", fontWeight:800, fontSize:14, cursor:"pointer", marginTop:12 }}>
                {verifying ? "Verifying meter..." : "Verify Meter"}
              </button>
            ) : (
              <>
                <div style={{background:"#0F2A1A", border:"1px solid #00C853", padding:"12px 14px", borderRadius:"12px", marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:11, color:"#888"}}>CUSTOMER NAME</div>
                    <div style={{fontSize:14, fontWeight:800, color:"#fff"}}>{customerName}</div>
                    {customerAddress && <div style={{fontSize:11, color:"#aaa", marginTop:2}}>{customerAddress}</div>}
                  </div>
                  <span style={{color:"#00C853", fontSize:18}}>✓</span>
                </div>

                <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px", marginTop:14}}>AMOUNT</div>
                <input value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,""))} placeholder="e.g 5000" type="number" style={styles.input} />

                <div style={{display:"flex", gap:8, flexWrap:"wrap", margin:"12px 0"}}>
                  {[1000,2000,5000,10000].map(a=>(
                    <button key={a} onClick={()=>setAmount(a.toString())} style={Number(amount)===a ? {...styles.quickBtn, ...styles.quickActive} : styles.quickBtn}>₦{formatMoney(a)}</button>
                  ))}
                </div>

                {amount && (
                  <div style={{background:"#1a1a1a", border:"1px solid #333", padding:"10px 12px", borderRadius:"10px", fontSize:"12px", color:"#aaa", display:"flex", justifyContent:"space-between", marginBottom:4}}>
                    <span>Amount + ₦{formatMoney(PROFIT)} fee</span>
                    <span style={{color:"#fff", fontWeight:800}}>₦{formatMoney(totalToPay)}</span>
                  </div>
                )}

                <button onClick={handlePayClick} disabled={loading} style={{...styles.payBtn, background: amount && Number(amount)>=500 ? "#FFEB3B" : "#333", color: amount && Number(amount)>=500 ? "#000" : "#777", marginTop:"10px"}}>
                  {loading ? "Processing..." : `Pay ₦${formatMoney(totalToPay)}`}
                </button>
                <button onClick={resetMeter} style={{ background:"none", border:"none", color:"#9AA3B2", fontSize:12, fontWeight:600, cursor:"pointer", padding:8, width:"100%", marginTop:4 }}>Change meter number</button>
              </>
            )}
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
            <p style={{ fontSize: 13, color: '#9AA3B2', margin: '0 0 6px', lineHeight: 1.5 }}>Pay <b style={{ color: '#fff' }}>₦{formatMoney(totalToPay)}</b> to <b style={{ color: '#fff' }}>{customerName}</b></p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 22px', textTransform: "capitalize" }}>{active?.name} • {meterNumber} • {meterType} • {customerPhone}</p>
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
          <div style={{ background: '#1E242E', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, textAlign: 'center', border: '1px solid #2C3440' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#00C853', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 30 }}>✓</div>
            <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 6px' }}>Electricity Purchased</h3>
            <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 16px', textTransform: "capitalize" }}>{active?.name} • {customerName}</p>
            <div style={{ background: '#0F131A', borderRadius: 12, padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#fff', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Meter</span><span style={{ fontWeight: 700 }}>{meterNumber}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Phone</span><span style={{ fontWeight: 700 }}>{customerPhone}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Amount</span><span style={{ fontWeight: 700 }}>₦{formatMoney(amount)} + ₦{formatMoney(PROFIT)} fee</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Total Paid</span><span style={{ fontWeight: 700 }}>₦{formatMoney(totalToPay)}</span></div>
              {successData?.token && (<div style={{ marginTop: 10, background: "#FFEB3B", borderRadius: 10, padding: "10px 12px", color: "#000", textAlign: "center" }}><div style={{ fontSize: 10, fontWeight: 700 }}>TOKEN</div><div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>{successData.token}</div></div>)}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}><span style={{ color: '#888' }}>New Balance</span><span style={{ fontWeight: 700 }}>₦{formatMoney(myBalance)}</span></div>
            </div>
            <button onClick={closeSuccess} style={{ width: '100%', padding: 13, borderRadius: 12, border: 'none', background: '#FFEB3B', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}
    </>
  )
}
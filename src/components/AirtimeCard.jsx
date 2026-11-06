import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";
import { styles } from "./AirtimeStyles";
import { Lock, ShieldCheck } from "lucide-react";
import mtnlogo from "../logo/icons/mtn.webp";
import glologo from "../logo/icons/glo.webp";
import airtellogo from "../logo/icons/airtel.webp";
import mobilelogo from "../logo/icons/mobile.webp"
const cap = (s) => s.toLowerCase().replace(/[a-z]/, (c) => c.toUpperCase());
const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const networks = [
  { id: 1, name: "MTN", logo: mtnlogo, code: "MTN" },
  { id: 2, name: "GLO", logo: glologo, code: "GLO" },
  { id: 4, name: "AIRTEL", logo: airtellogo, code: "AIRTEL" },
  { id: 3, name: "9MOBILE", logo: mobilelogo, code: "9MOBILE" },
];

const getNetworkFromNumber = (phone) => {
  if(phone.length < 4) return null
  const prefix = phone.substring(0, 4)
  const mtn = ["0803","0806","0703","0706","0813","0816","0810","0814","0903","0906","0913","0916","0704"]
  const glo = ["0805","0807","0811","0815","0705","0905","0915"]
  const airtel = ["0802","0808","0708","0812","0701","0901","0902","0907","0912"]
  const mobile = ["0809","0818","0817","0909","0908"]
  if(mtn.includes(prefix)) return "MTN"
  if(glo.includes(prefix)) return "GLO"
  if(airtel.includes(prefix)) return "AIRTEL"
  if(mobile.includes(prefix)) return "9MOBILE"
  return null
}

export default function AirtimeCard({ setPage }) {
  const [activeNetwork, setActiveNetwork] = useState(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [myBalance, setMyBalance] = useState(null);
  const [toast, setToast] = useState(null);

  const [showPin, setShowPin] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const pinRefs = useRef([]);

  const pin = pinDigits.join("");
  const isPinComplete = pin.length === 4;

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const detectedNetwork = getNetworkFromNumber(phone)

  useEffect(() => {
    if(phone.length >= 4 && detectedNetwork && activeNetwork && detectedNetwork !== activeNetwork.name){
      const correctNet = networks.find(n => n.name === detectedNetwork)
      if(correctNet){
        setActiveNetwork(correctNet)
        setAutoSwitched(true)
        setTimeout(()=> setAutoSwitched(false), 2000)
      }
    }
  }, [phone, detectedNetwork])

  useEffect(()=>{
    document.body.style.overflow = activeNetwork || showPin ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto" }
  }, [activeNetwork, showPin]);

  useEffect(() => {
    if (!activeNetwork) return;
    const fetchMyBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle();
      if (wallet) { setMyBalance(Number(wallet.balance || 0)); return; }
      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle();
      setMyBalance(Number(profile?.wallet_balance || 0));
    };
    fetchMyBalance();
  }, [activeNetwork]);

  const handlePayClick = async () => {
    if(phone.length < 11 || !amount) { showToast("Complete fields"); return }
    setToast(null);
    const { data: hasPin, error } = await supabase.rpc("has_user_pin");
    if (error) { showToast(error.message); return; }
    if (!hasPin) {
      showToast("You never set PIN. Set PIN in Settings first");
      if (setPage) setTimeout(()=> setPage("pinSettings"), 1200);
      return;
    }
    setPinDigits(["", "", "", ""]); setPinError(""); setShowPin(true);
  };

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
    if (pin.length !== 4) return;
    setPinLoading(true); setPinError("");
    try {
      const { data, error } = await supabase.rpc("verify_user_pin", { p_pin: pin });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      setShowPin(false);
      setPinDigits(["", "", "", ""]);
      await handleBuyReal();
    } catch (e) {
      setPinError(e.message)
      setPinDigits(["", "", "", ""])
      setTimeout(() => pinRefs.current[0]?.focus(), 50)
    } finally {
      setPinLoading(false);
    }
  };

  const handleBuyReal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle();
    let currentBalance = Number(wallet?.balance || 0);
    if (!wallet) {
      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", user.id).maybeSingle();
      currentBalance = Number(profile?.wallet_balance || 0);
    }
    setMyBalance(currentBalance);
    const amt = Number(amount);
    if (currentBalance < amt) {
      showToast(`Low balance. Your balance na ₦${formatMoney(currentBalance)}, you need ₦${formatMoney(amt)}. Fund wallet first.`);
      return;
    }
    setLoading(true); setToast(null)
    try{
      const { data, error } = await supabase.functions.invoke('buy-airtime', {
        body: { network: activeNetwork.id, mobile_number: phone, amount: Number(amount) }
      })
      if(error) throw error
      if(data?.Status === "failed" || data?.status === "failed") {
        throw new Error(data.message || data?.error?.[0] || "Airtime failed")
      }
      if(data?.success || data?.Status === "successful" || data?.status === "successful") {
        setSuccess(true)
        setMyBalance(currentBalance - amt);
      } else {
        throw new Error(data?.message || "Failed to send airtime")
      }
    }catch(e){
      let msg = e.message || "Airtime failed"
      if (msg.toLowerCase().includes("user_low") || msg.toLowerCase().includes("low balance") || msg.toLowerCase().includes("insufficient funds") || msg.toLowerCase().includes("not enough")) {
        showToast(msg.toLowerCase().includes("user_low") ? `Low balance. Your balance na ₦${formatMoney(currentBalance)}. Fund wallet first.` : msg);
        setLoading(false);
        return;
      }
      if(msg.toLowerCase().includes("insufficient balance") || msg.toLowerCase().includes("topup due to") || msg.toLowerCase().includes("provider_low")){
        msg = `${cap(activeNetwork.name)} is temporarily unavailable. Please try another network or try again in 5 minutes.`
        console.error("ALERT ADMIN: VTU Provider wallet is low! Fund it. Raw error:", e.message)
      }
      showToast(msg)
    }
    finally{ setLoading(false) }
  }

  const closePin = () => { setShowPin(false); setPinDigits(["", "", "", ""]); setPinError("") }
  const closeSuccess = () => { setSuccess(false); setActiveNetwork(null); setPhone(""); setAmount("") }

  return (
    <>
      <div style={styles.rowCard}>
        <h3 style={styles.title}>Buy Airtime</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {networks.map(net => (
            <button
              key={net.id}
              onClick={()=>{setActiveNetwork(net); setToast(null); setSuccess(false); setAutoSwitched(false)}}
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
          <div style={styles.backdrop} onClick={()=>setActiveNetwork(null)}></div>
          <div style={styles.modalCard}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                <img src={activeNetwork.logo} alt="" style={{width:"40px", height:"40px", borderRadius:"50%", background:"#fff", padding:"2px", objectFit:"cover"}} />
                <div>
                  <h2 style={{color:"#fff", margin:0, fontSize:"20px"}}>{cap(activeNetwork.name)}</h2>
                  <p style={{color:"#888", fontSize:"13px", margin:0}}>Instant Recharge</p>
                </div>
              </div>
              <button onClick={()=>setActiveNetwork(null)} style={{width:"36px", height:"36px", borderRadius:"50%", border:"none", background:"#2C3440", color:"#fff", cursor:"pointer", fontSize:"18px", fontWeight:"700"}}>✕</button>
            </div>

            {autoSwitched && (
              <div style={{background:"#fef9c3", color:"#a16207", padding:"10px 12px", borderRadius:"10px", fontSize:"12px", fontWeight:700, marginBottom:"12px", textAlign:"center", border:"1px solid #fde68a"}}>
                🔄 Auto-switched to {cap(activeNetwork.name)}
              </div>
            )}

            {myBalance !== null && (
              <div style={{background:"#1a1a1a", border:"1px solid #333", padding:"10px 12px", borderRadius:"10px", fontSize:"13px", color:"#fff", marginBottom:"12px", display:"flex", justifyContent:"space-between"}}>
                <span style={{color:"#888"}}>Wallet Balance</span>
                <span style={{fontWeight:800}}>₦{formatMoney(myBalance)}</span>
              </div>
            )}

            <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px"}}>PHONE NUMBER {detectedNetwork && `• ${cap(detectedNetwork)}`}</div>
            <input style={{...styles.input, border: detectedNetwork === activeNetwork?.name ? "2px solid #00ff88" : "1px solid #333"}} placeholder="08012345678" value={phone} onChange={e=>{setPhone(e.target.value.replace(/\D/g,"")); setToast(null)}} maxLength={11} />

            <div style={{fontSize:"11px", color:"#888", fontWeight:700, marginBottom:"6px", marginTop:"12px"}}>AMOUNT</div>
            <input style={styles.input} placeholder="Enter amount" type="number" value={amount} onChange={e=>{setAmount(e.target.value); setToast(null)}} />

            <div style={{display:"flex", gap:"8px", flexWrap:"wrap", margin:"14px 0"}}>
              {[100,200,500,1000,2000].map(a=>(
                <button key={a} onClick={()=>setAmount(a.toString())} style={Number(amount)==a ? {...styles.quickBtn, ...styles.quickActive} : styles.quickBtn}>₦{formatMoney(a)}</button>
              ))}
            </div>

            <button onClick={handlePayClick} disabled={loading || success}
              style={{...styles.payBtn, background: phone.length>=11 && amount ? "#FFEB3B" : "#333", color: phone.length>=11 && amount ? "#000" : "#777"}}>
              {loading ? "Processing..." : success ? "Success!" : `Pay ₦${formatMoney(amount)} - ${cap(activeNetwork.name)}`}
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
            <p style={{ fontSize: 13, color: '#9AA3B2', margin: '0 0 6px', lineHeight: 1.5 }}>Pay <b style={{ color: '#fff' }}>₦{formatMoney(amount)}</b> to <b style={{ color: '#fff' }}>{phone}</b></p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 22px' }}>{cap(activeNetwork?.name)} • Airtime</p>
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
            <h3 style={{ color: '#fff', fontSize: 18, margin: '0 0 6px' }}>Airtime Sent Successfully</h3>
            <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 16px' }}>{cap(activeNetwork?.name)} • Airtime</p>
            <div style={{ background: '#0F131A', borderRadius: 12, padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#fff', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Phone</span><span style={{ fontWeight: 700 }}>{phone}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#888' }}>Amount</span><span style={{ fontWeight: 700 }}>₦{formatMoney(amount)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>New Balance</span><span style={{ fontWeight: 700 }}>₦{formatMoney(myBalance)}</span></div>
            </div>
            <button onClick={closeSuccess} style={{ width: '100%', padding: 13, borderRadius: 12, border: 'none', background: '#FFEB3B', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}
    </>
  )
}
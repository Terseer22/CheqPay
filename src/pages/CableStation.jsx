import { useState, useEffect } from "react"
import { supabase } from "../supabase/supabaseClient"
import SuccessAlert from "../components/SuccessAlert"

export default function CablePage({ setPage }) {
  const [provider, setProvider] = useState("dstv")
  const [smartcard, setSmartcard] = useState("")
  const [plan, setPlan] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [error, setError] = useState("")
  const [alertType, setAlertType] = useState("success")
  const [walletBalance, setWalletBalance] = useState(0)

  const fetchRealBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return 0
    const { data } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
    if(data){ setWalletBalance(data.balance); return data.balance }
    return 0
  }

  useEffect(()=>{ fetchRealBalance() },[])

  const providers = [
    { id: "dstv", name: "DStv", color: "#0066cc", logo: "DStv" },
    { id: "gotv", name: "GOtv", color: "#00a651", logo: "GOtv" },
    { id: "startimes", name: "StarTimes", color: "#ff6600", logo: "ST" },
    { id: "showmax", name: "Showmax", color: "#e11d48", logo: "SM" },
  ]

  const plans = {
    dstv: [
      { id: "dstv-padi", name: "DStv Padi", price: 2500 },
      { id: "dstv-yanga", name: "DStv Yanga", price: 3500 },
      { id: "dstv-confam", name: "DStv Confam", price: 6200 },
      { id: "dstv-compact", name: "DStv Compact", price: 10500 },
      { id: "dstv-compact-plus", name: "Compact Plus", price: 16500 },
      { id: "dstv-premium", name: "DStv Premium", price: 24500 },
    ],
    gotv: [
      { id: "gotv-smallie", name: "GOtv Smallie", price: 1100 },
      { id: "gotv-jinja", name: "GOtv Jinja", price: 2700 },
      { id: "gotv-jolli", name: "GOtv Jolli", price: 3950 },
      { id: "gotv-max", name: "GOtv Max", price: 5700 },
      { id: "gotv-supa", name: "GOtv Supa", price: 7600 },
    ],
    startimes: [
      { id: "nova", name: "Nova", price: 1500 },
      { id: "basic", name: "Basic", price: 2600 },
      { id: "smart", name: "Smart", price: 3500 },
      { id: "classic", name: "Classic", price: 4000 },
    ],
    showmax: [
      { id: "showmax-mobile", name: "Mobile", price: 1200 },
      { id: "showmax-ent", name: "Entertainment", price: 3500 },
    ]
  }

  const currentPlans = plans[provider] || []
  const selectedPlan = currentPlans.find(p=>p.id===plan)

  const handlePay = async () => {
    if(!smartcard){ setError("Please enter Smartcard / IUC number"); setTimeout(()=>setError(""),3000); return; }
    if(!/^\d+$/.test(smartcard)){ setError("Smartcard must be numbers only"); setTimeout(()=>setError(""),3000); return; }
    if(smartcard.length < 10){ setError(`Invalid number: ${smartcard.length}/10 digits. Number not complete`); setTimeout(()=>setError(""),3000); return; }
    if(!plan){ setError("Please select a plan"); setTimeout(()=>setError(""),3000); return; }

    const price = selectedPlan?.price || 0
    setLoading(true)
    setError("")

    try{
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) throw new Error("Not logged in")

      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
      const realBalance = wallet?.balance || 0
      setWalletBalance(realBalance)

      if(price > realBalance){
        setLoading(false)
        setAlertType("failed")
        setShowAlert(true)
        return
      }

      const newBalance = realBalance - price
      await supabase.from("wallets").update({ balance: newBalance }).eq("user_id", user.id)
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "cable",
        provider: provider,
        amount: price,
        status: "success",
        details: `${smartcard} - ${selectedPlan.name}`
      })

      setWalletBalance(newBalance)
      setLoading(false)
      setAlertType("success")
      setShowAlert(true)
    }catch(err){
      setLoading(false)
      setError(err.message)
    }
  }

  return (
    <div style={{ background:'#f8fafc', minHeight:'100vh', paddingBottom: 20 }}>
      <div style={{ background:'#fff', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #eef2f7', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={()=>setPage("home")} style={{ width:38, height:38, borderRadius:'50%', background:'#f1f5f9', border:'none', cursor:'pointer' }}><span style={{ fontSize:22, fontWeight:700 }}>←</span></button>
        <div><h2 style={{ margin:0, fontSize:16, fontWeight:800 }}>Cable TV</h2><p style={{ margin:0, fontSize:12, color:'#64748b' }}>Real Balance: ₦{walletBalance.toLocaleString()}</p></div>
      </div>
      <div style={{ padding:16, maxWidth:480, margin:'0 auto' }}>
        <div style={{ background:'#fff', borderRadius:16, padding:16, marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:700 }}>SELECT PROVIDER</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:12 }}>
            {providers.map(p=>(
              <button key={p.id} onClick={()=>{setProvider(p.id); setPlan(""); setError("")}} style={{ padding:'14px 6px', borderRadius:14, border: provider===p.id?`2px solid ${p.color}`:'1px solid #e2e8f0', background: provider===p.id?'#f0fdf4':'#fff', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:p.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12 }}>{p.logo}</div>
                <span style={{ fontSize:11, fontWeight:700 }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ background:'#fff', borderRadius:16, padding:16, marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:700 }}>Smartcard / IUC ({smartcard.length}/10)</label>
          <input value={smartcard} onChange={e=>{setSmartcard(e.target.value.replace(/\D/g,"")); setError("")}} maxLength={11} placeholder="e.g 10456789432" style={{ width:'100%', padding:14, borderRadius:10, border: error? '1px solid #ef4444' : '1px solid #e2e8f0', marginTop:8, outline:'none' }} />
          {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 12px', borderRadius:8, fontSize:12, fontWeight:600, marginTop:10, border:'1px solid #fecaca' }}>⚠️ {error}</div>}
        </div>
        <div style={{ background:'#fff', borderRadius:16, padding:16, marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700, marginBottom:10, display:'block' }}>{provider.toUpperCase()} PLANS</label>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {currentPlans.map(pl=>(
              <button key={pl.id} onClick={()=>{setPlan(pl.id); setError("")}} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 12px', borderRadius:10, border: plan===pl.id?'2px solid #00c950':'1px solid #e2e8f0', background: plan===pl.id?'#f0fdf4':'#fff', cursor:'pointer' }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{pl.name}</span>
                <span style={{ fontSize:13, fontWeight:800, color: pl.price > walletBalance? '#ef4444' : '#00c950' }}>₦{pl.price.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={handlePay} disabled={loading} style={{ width:'100%', padding:16, borderRadius:14, background:'#000', color:'#fff', border:'none', fontWeight:800, cursor:'pointer' }}>{loading? "Checking real balance..." : "Pay Now"}</button>
      </div>
      <SuccessAlert show={showAlert} type={alertType} onClose={()=>{setShowAlert(false); if(alertType==="success") setPage("home")}} title={alertType==="success"? "Cable TV Paid!" : "Insufficient Balance"} message={alertType==="success"? `${provider.toUpperCase()} successful` : `Real balance ₦${walletBalance.toLocaleString()} not enough`} amount={selectedPlan?.price.toLocaleString()} details={alertType==="success"? `${smartcard} • ${selectedPlan?.name}` : `Required: ₦${selectedPlan?.price.toLocaleString()}`} />
    </div>
  )
}
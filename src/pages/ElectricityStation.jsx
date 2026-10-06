import { useState, useEffect } from "react"
import { supabase } from "../supabase/supabaseClient"
import SuccessAlert from "../components/SuccessAlert"

export default function ElectricityPage({ setPage }) {
  const [disco, setDisco] = useState("ikedc")
  const [meterType, setMeterType] = useState("prepaid")
  const [meterNo, setMeterNo] = useState("")
  const [amount, setAmount] = useState("")
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

  const discos = [
    { id: "ikedc", name: "Ikeja" },
    { id: "ekedc", name: "Eko" },
    { id: "aedc", name: "Abuja" },
    { id: "phed", name: "Port Harcourt" },
    { id: "kedco", name: "Kano" },
    { id: "jedc", name: "Jos" },
  ]

  const handlePay = async () => {
    if(!meterNo){ setError("Please enter meter number"); setTimeout(()=>setError(""),3000); return; }
    if(!/^\d+$/.test(meterNo)){ setError("Meter number must be numbers only"); setTimeout(()=>setError(""),3000); return; }
    if(meterNo.length < 11){ setError(`Invalid meter number: ${meterNo.length}/11 digits. Number not complete`); setTimeout(()=>setError(""),3000); return; }
    if(!amount || Number(amount) < 500){ setError("Enter valid amount, minimum ₦500"); setTimeout(()=>setError(""),3000); return; }

    setLoading(true)
    setError("")

    try{
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) throw new Error("Not logged in")

      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
      const realBalance = wallet?.balance || 0
      setWalletBalance(realBalance)

      if(Number(amount) > realBalance){
        setLoading(false)
        setAlertType("failed")
        setShowAlert(true)
        return
      }

      const newBalance = realBalance - Number(amount)
      await supabase.from("wallets").update({ balance: newBalance }).eq("user_id", user.id)
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "electricity",
        provider: disco,
        amount: Number(amount),
        status: "success",
        details: `Meter: ${meterNo} - ${meterType}`
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
        <div><h2 style={{ margin:0, fontSize:16, fontWeight:800 }}>Electricity Bill</h2><p style={{ margin:0, fontSize:12, color:'#64748b' }}>Real Balance: ₦{walletBalance.toLocaleString()}</p></div>
      </div>

      <div style={{ padding:16, maxWidth:480, margin:'0 auto' }}>
        <div style={{ background:'#fff', borderRadius:16, padding:16, marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:700 }}>SELECT DISCO</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:8 }}>
            {discos.map(d=>(
              <button key={d.id} onClick={()=>setDisco(d.id)} style={{ padding:'10px 6px', borderRadius:10, border: disco===d.id?'2px solid #00c950':'1px solid #e2e8f0', background: disco===d.id?'#f0fdf4':'#fff', fontSize:11, fontWeight:700, cursor:'pointer' }}>{d.name}</button>
            ))}
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:16, padding:16, marginBottom:12, display:'flex', gap:8 }}>
          <button onClick={()=>setMeterType("prepaid")} style={{ flex:1, padding:12, borderRadius:10, border:'none', background: meterType==='prepaid'?'#000':'#f1f5f9', color: meterType==='prepaid'?'#fff':'#000', fontWeight:700, cursor:'pointer' }}>Prepaid</button>
          <button onClick={()=>setMeterType("postpaid")} style={{ flex:1, padding:12, borderRadius:10, border:'none', background: meterType==='postpaid'?'#000':'#f1f5f9', color: meterType==='postpaid'?'#fff':'#000', fontWeight:700, cursor:'pointer' }}>Postpaid</button>
        </div>

        <div style={{ background:'#fff', borderRadius:16, padding:16, marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:700 }}>Meter Number ({meterNo.length}/11)</label>
          <input value={meterNo} onChange={e=>{setMeterNo(e.target.value.replace(/\D/g,"")); setError("")}} maxLength={13} placeholder="e.g 12345678901" style={{ width:'100%', padding:14, borderRadius:10, border: error &&!meterNo? '1px solid #ef4444' : '1px solid #e2e8f0', marginTop:6, marginBottom:14, outline:'none' }} />
          <label style={{ fontSize:12, fontWeight:700 }}>Amount (₦)</label>
          <input value={amount} onChange={e=>{setAmount(e.target.value); setError("")}} type="number" placeholder="Min ₦500" style={{ width:'100%', padding:14, borderRadius:10, border: '1px solid #e2e8f0', marginTop:6, outline:'none' }} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12 }}>
            {[1000,2000,5000,10000].map(a=>(
              <button key={a} onClick={()=>{setAmount(a); setError("")}} style={{ padding:8, borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', fontSize:12, fontWeight:600, cursor:'pointer' }}>₦{a}</button>
            ))}
          </div>
          {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 12px', borderRadius:8, fontSize:12, fontWeight:600, marginTop:12, border:'1px solid #fecaca' }}>⚠️ {error}</div>}
        </div>

        <button onClick={handlePay} disabled={loading} style={{ width:'100%', padding:16, borderRadius:14, background:'#00c950', color:'#fff', border:'none', fontWeight:800, cursor:'pointer' }}>{loading? "Checking real balance..." : `Pay ₦${amount || "0"}`}</button>
      </div>

      <SuccessAlert show={showAlert} type={alertType} onClose={()=>{setShowAlert(false); if(alertType==="success") setPage("home")}} title={alertType==="success"? "Electricity Paid!" : "Insufficient Balance"} message={alertType==="success"? `${disco.toUpperCase()} ${meterType} successful` : `Real balance ₦${walletBalance.toLocaleString()} too low`} amount={Number(amount).toLocaleString()} details={alertType==="success"? `Meter: ${meterNo}` : `Fund wallet to continue`} />
    </div>
  )
}
import { useState } from "react"
import { supabase } from "../supabase/supabaseClient"

function ResultModal({ show, onClose, successCount, failedCount, total, error }) {
  if (!show) return null
  const isError = !!error
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:360, background:"#fff", borderRadius:28, padding:28, textAlign:"center", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, width:32, height:32, borderRadius:"50%", border:"none", background:"#f2f2f2" }}>✕</button>
        <div style={{ width:80, height:80, borderRadius:"50%", background:isError?"#FF4444":"#00C950", margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:42, color:"#fff", fontWeight:900 }}>{isError?"!":"✓"}</span>
        </div>
        <div style={{ fontWeight:900, fontSize:22, color:"#111" }}>{isError?"Failed":`${successCount} SMS Sent!`}</div>
        <div style={{ fontSize:14, color:"#666", marginTop:8 }}>{isError? error : `Sent to ${successCount} of ${total} numbers`}</div>
        <button onClick={onClose} style={{ width:"100%", marginTop:20, padding:16, borderRadius:16, border:"none", background:"#0A0A0A", color:"#fff", fontWeight:800, fontSize:16 }}>{isError?"Try Again":"Done"}</button>
      </div>
    </div>
  )
}

export default function BulkSmsPage({ setPage }) {
  const [senderId, setSenderId] = useState("CheqPay")
  const [numbers, setNumbers] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ show:false, error:null, success:0, failed:0 })

  const validNumbers = numbers.split(/[\n,]+/).map(n=>n.trim()).filter(n=>n.length>=10)
  const charCount = message.length
  const pages = Math.ceil(charCount / 160) || 1
  const pricePerSms = 4.5
  const total = validNumbers.length * pages * pricePerSms

  const handleSend = async () => {
    if (validNumbers.length === 0) {
      setModal({ show:true, error:"Add at least 1 valid number (e.g 080...)", success:0, failed:0 }); return
    }
    if (!message.trim()) {
      setModal({ show:true, error:"Type your message first", success:0, failed:0 }); return
    }

    setLoading(true)
    try {
      console.log("Sending", { sender_id: senderId, numbers: validNumbers, message })
      const { data, error } = await supabase.functions.invoke('send-bulk-sms', {
        body: { sender_id: senderId, numbers: validNumbers, message }
      })
      console.log("Response", data, error)
      if (error) throw new Error(error.message)
      if (data?.status === "failed") throw new Error(data?.message || JSON.stringify(data))

      setModal({ show:true, error:null, success: data?.sent || validNumbers.length, failed: data?.failed || 0 })
    } catch (e) {
      setModal({ show:true, error: e.message, success:0, failed:0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", color:"#fff" }}>
      <div style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14, background:"#111", borderBottom:"1px solid #222", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={()=>setPage("mobileHome")} style={{ width:36, height:36, borderRadius:12, background:"#222", border:"1px solid #333", color:"#fff", fontSize:18, cursor:"pointer" }}>←</button>
        <div><div style={{ fontWeight:800 }}>Bulk SMS</div><div style={{ fontSize:11, color:"#00ff88", fontWeight:700 }}>₦{pricePerSms}/SMS</div></div>
      </div>

      <div style={{ padding:16, maxWidth:480, margin:"0 auto" }}>
        <div style={{ background:"#151515", borderRadius:20, padding:16, border:"1px solid #252525", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#888", fontWeight:700, marginBottom:8 }}>SENDER ID (max 11)</div>
          <input value={senderId} onChange={e=>setSenderId(e.target.value)} placeholder="CheqPay" style={{ width:"100%", background:"transparent", border:"none", color:"#fff", fontSize:16, fontWeight:700, outline:"none" }} />
        </div>

        <div style={{ background:"#151515", borderRadius:20, padding:16, border:"1px solid #252525", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#888", fontWeight:700, marginBottom:8 }}>NUMBERS (comma or new line)</div>
          <textarea value={numbers} onChange={e=>setNumbers(e.target.value)} placeholder="08012345678, 08123456789" rows={4} style={{ width:"100%", background:"transparent", border:"none", color:"#fff", fontSize:15, outline:"none", resize:"none" }} />
          <div style={{ fontSize:11, color: validNumbers.length? "#00ff88" : "#555", marginTop:8, fontWeight:700 }}>{validNumbers.length} valid numbers found</div>
        </div>

        <div style={{ background:"#151515", borderRadius:20, padding:16, border:"1px solid #252525", marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#888", fontWeight:700, marginBottom:8 }}>MESSAGE</div>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={5} placeholder="Type your bulk message here..." style={{ width:"100%", background:"transparent", border:"none", color:"#fff", fontSize:15, outline:"none", resize:"none" }} />
          <div style={{ fontSize:11, color:"#555", marginTop:8 }}>{charCount} chars • {pages} page(s) • {validNumbers.length} recipients</div>
        </div>

        <button 
          onClick={handleSend} 
          disabled={loading}
          style={{ width:"100%", padding:18, borderRadius:20, border:"none", background: loading ? "#333" : "#fff", color: loading ? "#777" : "#000", fontWeight:900, fontSize:16, cursor:"pointer" }}
        >
          {loading? "Sending..." : `Send to ${validNumbers.length} • ₦${total.toFixed(2)}`}
        </button>
      </div>

      <ResultModal
        show={modal.show}
        error={modal.error}
        successCount={modal.success}
        failedCount={modal.failed}
        total={validNumbers.length}
        onClose={()=>{ const isErr=!!modal.error; setModal({show:false,error:null,success:0,failed:0}); if(!isErr){ setNumbers(""); setMessage(""); } }}
      />
    </div>
  )
}
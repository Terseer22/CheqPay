import { useState } from "react"
import { supabase } from "../supabase/supabaseClient"

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function FundWallet({ setPage }) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const fund = async () => {
    if (!amount || Number(amount) < 100) { alert("Minimum ₦100"); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Login first")

      // @ts-ignore Paystack from index.html
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Number(amount) * 100,
        currency: "NGN",
        ref: `CHEQ_${Date.now()}_${user.id.slice(0,5)}`,
        callback: async function(response) {
          try {
            console.log("Paystack ref:", response.reference, "Amount:", amount)
            
            // Only verify - let edge function save wallet + history (no double insert)
            const { data, error } = await supabase.functions.invoke('verify-paystack', {
              body: { reference: response.reference, amount: Number(amount) }
            })
            
            console.log("Verify result:", data, error)
            
            if (error) throw error
            if (!data.success) throw new Error(data.message)

            alert(`Success! Wallet funded with ₦${formatMoney(data.verifiedAmount)}. New balance: ₦${formatMoney(data.newBalance)}`)
            setAmount("")
            setLoading(false)
            if(setPage) setPage("home")
            else window.location.reload()

          } catch (err) {
            console.error(err)
            alert("Verify failed: " + err.message)
            setLoading(false)
          }
        },
        onClose: function() {
          setLoading(false)
        }
      })
      handler.openIframe()
    } catch (e) {
      alert(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20, background: "#000", minHeight: "100vh", color: "#fff" }}>
      <h2 style={{ marginBottom: 20 }}>Fund Wallet</h2>
      
      <div style={{ background: "#111", padding: 16, borderRadius: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", fontWeight: 700, marginBottom: 6 }}>AMOUNT</div>
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          placeholder="Enter amount e.g 2000"
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 18, fontWeight: 700 }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[500, 1000, 2000, 5000].map(a => (
            <button key={a} onClick={() => setAmount(a.toString())} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #333", background: Number(amount)===a ? "#FFEB3B" : "#222", color: Number(amount)===a ? "#000" : "#fff", fontWeight: 700 }}>₦{formatMoney(a)}</button>
          ))}
        </div>
      </div>

      <button onClick={fund} disabled={loading} style={{ width: "100%", padding: 15, borderRadius: 12, background: loading ? "#333" : "#FFEB3B", color: "#000", fontWeight: 800, border: "none", fontSize: 16 }}>
        {loading ? "Verifying..." : `Pay ₦${formatMoney(amount)} with Paystack`}
      </button>
    </div>
  )
}
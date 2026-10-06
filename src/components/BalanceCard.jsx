import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function BalanceCard({ onViewHistory }) {
  const [amount, setAmount] = useState("");
  const [showFund, setShowFund] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [balance, setBalance] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => { 
    fetchBalance();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) fetchBalance();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;
      setEmail(user.email);

      // USE wallet_balance - not balance
      const { data } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setBalance(data.wallet_balance || 0);
      }
    } catch (e) {
      console.log("Fetch error", e);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleFund = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) return alert("Min ₦100");
    if (!window.PaystackPop) return alert("Refresh page");
    
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email || email;
    if (!userEmail) return alert("Please login again");

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: numAmount * 100,
      currency: "NGN",
      ref: "CHEAPAY_" + Date.now(),
      callback: (res) => verifyPayment(res.reference),
      onClose: () => setIsPaying(false)
    });
    setIsPaying(true);
    handler.openIframe();
  };

  const verifyPayment = async (reference) => {
    try {
      const { data } = await supabase.functions.invoke('verify-paystack', { 
        body: { reference } 
      });
      if (data?.success) {
        await fetchBalance();
        setShowFund(false);
        setAmount("");
        alert(`₦${data.amount} added!`);
      } else {
        alert(data?.error || "Verification failed");
      }
    } catch (e) { 
      alert(e.message); 
    }
    setIsPaying(false);
  };

  return (
    <>
      <div style={{ background: "linear-gradient(135deg, #111 0%, #222 100%)", color: "white", padding: "24px", borderRadius: "20px", margin: "15px" }}>
        <p style={{ opacity: 0.6, fontSize: "13px" }}>WALLET BALANCE</p>
        <h1 style={{ fontSize: "36px", margin: "8px 0 20px", fontWeight: "800" }}>₦{balance.toLocaleString()}</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setShowFund(true)} style={{ flex: 1, background: "#00ff88", color: "#000", padding: "14px", borderRadius: "12px", border: "none", fontWeight: "700" }}>+ Fund Wallet</button>
          <button onClick={onViewHistory} style={{ flex: 1, background: "#2a2a2a", color: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid #333", fontWeight: "600" }}>History</button>
        </div>
      </div>

      {showFund && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowFund(false)}>
          <div style={{ background: "#1a1a1a", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "white" }}>Fund Wallet</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "15px 0" }}>
              {quickAmounts.map(q => (
                <button key={q} onClick={() => setAmount(q)} style={{ background: amount == q ? "#00ff88" : "#2a2a2a", color: amount == q ? "#000" : "#fff", border: "none", padding: "10px 16px", borderRadius: "20px", fontWeight: "600" }}>₦{q.toLocaleString()}</button>
              ))}
            </div>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888", fontWeight: "700", fontSize: "20px" }}>₦</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ width: "100%", background: "#222", border: "2px solid #333", borderRadius: "14px", padding: "16px 16px 16px 40px", color: "white", fontSize: "24px", fontWeight: "700", boxSizing: "border-box" }} />
            </div>
            <button onClick={handleFund} disabled={isPaying || !amount} style={{ width: "100%", background: !amount ? "#333" : "#00ff88", color: !amount ? "#888" : "#000", padding: "16px", borderRadius: "14px", border: "none", fontWeight: "800" }}>{isPaying ? "Processing..." : `Pay ₦${Number(amount||0).toLocaleString()}`}</button>
          </div>
        </div>
      )}
    </>
  );
}
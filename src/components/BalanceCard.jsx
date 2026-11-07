import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function BalanceCard({ onViewHistory, setPage }) {
  const [amount, setAmount] = useState("");
  const [showFund, setShowFund] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [balance, setBalance] = useState(0);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const pendingAmount = useRef(0);
  const balanceRef = useRef(0);
  balanceRef.current = balance;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { 
    fetchBalance();
    let channel = null;
    let channel2 = null;

    const setupChannel = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      // Listen to wallets table for THIS user only
      channel = supabase
        .channel(`wallet-balance-live-${userId}`)
        .on("postgres_changes", { 
          event: "*", 
          schema: "public", 
          table: "wallets",
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          const newBal = payload?.new?.balance;
          if (newBal !== undefined) setBalance(Number(newBal));
          else fetchBalance();
        })
        .subscribe();

      // Listen to profiles table too - some transactions update profiles.wallet_balance
      channel2 = supabase
        .channel(`profile-balance-live-${userId}`)
        .on("postgres_changes", { 
          event: "*", 
          schema: "public", 
          table: "profiles",
          filter: `id=eq.${userId}`
        }, (payload) => {
          const newBal = payload?.new?.wallet_balance;
          if (newBal !== undefined) setBalance(Number(newBal));
          else fetchBalance();
        })
        .subscribe();
    };
    setupChannel();

    // Universal refresh - listens to ALL transaction events
    const onWalletUpdated = () => fetchBalance();
    const events = [
      "wallet-updated",
      "balance-updated",
      "transaction-success",
      "transaction-completed",
      "airtime-success",
      "data-success",
      "cable-success",
      "electricity-success",
      "transfer-success"
    ];
    events.forEach(ev => window.addEventListener(ev, onWalletUpdated));
    window.addEventListener("focus", onWalletUpdated);
    document.addEventListener("visibilitychange", onWalletUpdated);

    // Safety net: check every 3 seconds while BalanceCard is on screen
    // This makes EVERY transaction reflect immediately even if realtime fails
    const interval = setInterval(() => {
      fetchBalance();
    }, 3000);

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) fetchBalance();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (channel2) supabase.removeChannel(channel2);
      events.forEach(ev => window.removeEventListener(ev, onWalletUpdated));
      window.removeEventListener("focus", onWalletUpdated);
      document.removeEventListener("visibilitychange", onWalletUpdated);
      clearInterval(interval);
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const user = session.user;
      setEmail(user.email);
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      if (wallet) {
        setBalance(Number(wallet.balance || 0));
        return Number(wallet.balance || 0);
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) {
        setBalance(Number(profile.wallet_balance || 0));
        return Number(profile.wallet_balance || 0);
      }
      setBalance(0);
      return 0;
    } catch (e) {
      console.log("Fetch error", e);
      return null;
    }
  };

  const waitForBalanceUpdate = async (expectedAdd) => {
    const oldBalance = balanceRef.current;
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 1200));
      const fresh = await fetchBalance();
      if (fresh !== null && fresh > oldBalance) return fresh;
      if (expectedAdd && fresh !== null && fresh >= oldBalance + expectedAdd - 1) return fresh;
    }
    return await fetchBalance();
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleFund = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) return showToast("error", "Minimum funding na ₦100.00");
    if (!window.PaystackPop) return showToast("error", "Payment no load. Refresh page make you try again");
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email || email;
    if (!userEmail) return showToast("error", "Please login again");
    pendingAmount.current = numAmount;
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: numAmount * 100,
      currency: "NGN",
      ref: "CHEAPAY_" + Date.now(),
      callback: (res) => verifyPayment(res.reference),
      onClose: () => {
        setIsPaying(false);
        showToast("error", "Payment cancelled. No money was added.");
      }
    });
    setIsPaying(true);
    handler.openIframe();
  };

  const verifyPayment = async (reference) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-paystack', { 
        body: { reference } 
      });
      if (data?.success) {
        const added = Number(data?.amount ?? data?.data?.amount ?? pendingAmount.current ?? 0);
        setShowFund(false);
        setAmount("");
        showToast("success", `₦${formatMoney(added)} added to your wallet`);
        await waitForBalanceUpdate(added);
        window.dispatchEvent(new Event("wallet-updated"));
      } else {
        showToast("error", data?.error || error?.message || "Verification failed. No money was added.");
      }
    } catch (e) { 
      showToast("error", "Network error. Check your history before you retry.");
      await waitForBalanceUpdate(0);
    }
    setIsPaying(false);
  };
 
  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #f3d807f1 0%, #f3d807f1 40%, #f3d807f1 75%, #907601 100%)', color: "#000", padding: "18px 18px 16px", borderRadius: "15px", margin: "15px"}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#000" }}>Available</span>
            <button onClick={() => setShowBalance(!showBalance)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
              {showBalance ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              )}
            </button>
          </div>

          <button onClick={() => setShowFund(true)} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.35)", color: "#000", padding: "7px 16px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            Fund wallet
          </button>
        </div>

        <div onClick={onViewHistory} style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", cursor: "pointer", width: "fit-content" }}>
          <h1 style={{ fontSize: "27px", margin: 0, fontWeight: "800", letterSpacing: "-0.5px", color: "#000" }}>
            {showBalance ? `₦${formatMoney(balance)}` : "₦****"}
          </h1>
          <span style={{ fontSize: "22px", fontWeight: "700", marginTop: "2px" }}>›</span>
        </div>
      </div>

      {showFund && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowFund(false)}>
          <div style={{ background: "#1a1a1a", width: "100%", borderRadius: "24px 24px 0 0", padding: "24px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "white" }}>Fund Wallet</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "15px 0" }}>
              {quickAmounts.map(q => (
                <button key={q} onClick={() => setAmount(q)} style={{ background: amount == q ? "#f3d807f1" : "#2a2a2a", color: amount == q ? "#000" : "#fff", border: "none", padding: "10px 16px", borderRadius: "20px", fontWeight: "600", cursor: "pointer" }}>₦{formatMoney(q)}</button>
              ))}
            </div>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888", fontWeight: "700", fontSize: "20px" }}>₦</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ width: "100%", background: "#222", border: "2px solid #333", borderRadius: "14px", padding: "16px 16px 16px 40px", color: "white", fontSize: "24px", fontWeight: "700", boxSizing: "border-box" }} />
            </div>
            <button onClick={handleFund} disabled={isPaying || !amount} style={{ width: "100%", background: !amount ? "#333" : "#f3d807f1", color: !amount ? "#888" : "#000", padding: "16px", borderRadius: "14px", border: "none", fontWeight: "800", cursor: "pointer" }}>{isPaying ? "Processing..." : `Pay ₦${formatMoney(amount)}`}</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          background: toast.type === 'success' ? "#f3d807f1" : "#dc2626",
          color: "#fff", padding: "13px 18px", borderRadius: "12px",
          fontSize: "14px", fontWeight: 700, zIndex: 99999, maxWidth: "90%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", textAlign: "center"
        }}>
          {toast.type === 'success' ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}
    </>
  );
}
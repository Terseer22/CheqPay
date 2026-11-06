import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import '../styles/bottom.css'

const BottomNavigation = ({ hide = false }) => {
  const [stats, setStats] = useState({ deposits: 0, spent: 0, balance: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoadingStats(false); return; }
    const user = session.user;

    let balance = 0;
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (wallet) {
      balance = Number(wallet.balance || 0);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .maybeSingle();
      balance = Number(profile?.wallet_balance || 0);
    }

    const { data: txns } = await supabase
      .from("transactions")
      .select("amount, type, status")
      .eq("user_id", user.id);

    let deposits = 0;
    let spent = 0;

    if (txns) {
      txns.forEach(t => {
        if (t.status === "failed" || t.status === "cancelled") return;
        const amt = Number(t.amount) || 0;
        const type = (t.type || "").toLowerCase();

        if (["deposit", "fund", "funding", "credit", "topup", "top_up", "add_money", "wallet_funding"].includes(type)) {
          deposits += amt;
        } else if (["spent", "spend", "debit", "transfer", "airtime", "data", "cable", "electricity", "withdraw", "payment", "buy_airtime", "buy_data", "bill"].includes(type)) {
          spent += amt;
        }
      });
    }

    setStats({ deposits, spent, balance });
    setLoadingStats(false);
  };

  useEffect(() => {
    loadStats();
    const walletChannel = supabase
      .channel("stats-wallet-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, () => loadStats())
      .subscribe();
    const txChannel = supabase
      .channel("stats-transactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => loadStats())
      .subscribe();
    const onWalletUpdated = () => loadStats();
    window.addEventListener("wallet-updated", onWalletUpdated);
    window.addEventListener("focus", onWalletUpdated);
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) loadStats();
    });
    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(txChannel);
      window.removeEventListener("wallet-updated", onWalletUpdated);
      window.removeEventListener("focus", onWalletUpdated);
      listener.subscription.unsubscribe();
    };
  }, []);

  if (hide) return null;

  // FIX: 150 -> 150.00
  const formatNaira = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div
      className="mobile-bottom-stats"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: '#fff', borderTop: '1px solid #EEF0F2',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        padding: '6px 8px calc(6px + env(safe-area-inset-bottom))',
        display: 'flex', gap: 6,
      }}
    >
      {/* TOTAL DEPOSITS - SMALL */}
      <div style={{ flex: 1, background: '#E6F9EE', borderRadius: 10, padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <TrendingUp size={10} color="#16A34A" />
          <span style={{ fontSize: 7, fontWeight: 700, color: '#16A34A', letterSpacing: '0.2px' }}>TOTAL DEPOSITS</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {loadingStats ? <span style={{ color: '#ccc' }}>₦ ---</span> : formatNaira(stats.deposits)}
        </div>
      </div>

      {/* TOTAL SPENT - SMALL */}
      <div style={{ flex: 1, background: '#FEF2F2', borderRadius: 10, padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <TrendingDown size={10} color="#DC2626" />
          <span style={{ fontSize: 7, fontWeight: 700, color: '#DC2626', letterSpacing: '0.2px' }}>TOTAL SPENT</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {loadingStats ? <span style={{ color: '#ccc' }}>₦ ---</span> : formatNaira(stats.spent)}
        </div>
      </div>

      {/* BALANCE - SMALL */}
      <div style={{ flex: 1, background: '#111', borderRadius: 10, padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Wallet size={10} color="#FFEB3B" />
          <span style={{ fontSize: 7, fontWeight: 600, color: '#FFEB3B', letterSpacing: '0.2px' }}>BALANCE</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {loadingStats ? <span style={{ color: '#666' }}>₦ ---</span> : formatNaira(stats.balance)}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
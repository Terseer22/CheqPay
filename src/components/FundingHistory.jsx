import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import Transactions from "../pages/Transactions";
import { Clock, History } from "lucide-react";

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function FundingHistory() {
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data && data.length > 0) setTx(data[0]);
      setLoading(false);
    };
    fetchOne();
  }, []);

  const isFunding = (t) => {
    const raw = (t?.type || t?.service || t?.category || "").toLowerCase();
    return raw === 'funding' || raw === 'credit' || raw === 'in';
  };

  const getServiceType = (t) => {
    if (!t) return "Airtime";
    if (isFunding(t)) return "Funding";
    const raw = (t.type || t.service || "airtime").toLowerCase();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  if (showAll) return <Transactions onBack={() => setShowAll(false)} />;
  if (loading) return <div style={{ background: "#fff", borderRadius: "16px", padding: "14px 16px", marginTop: "16px" }}><p style={{ fontSize: "13px", color: "#999", margin: 0 }}>Loading...</p></div>;

  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "14px 16px", marginTop: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* REAL ICON - no more 🕒 emoji */}
          <div style={{ width: "22px", height: "22px", background: "#eccc17", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <History size={16} color="black" strokeWidth={2.2} />
          </div>
          <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>Transaction history</p>
        </div>
        <p onClick={() => setShowAll(true)} style={{ fontSize: "13px", color: "#888", fontWeight: 600, margin: 0, cursor: "pointer" }}>View all {">"}</p>
      </div>
      {!tx ? (
        <p style={{ fontSize: "13px", color: "#999", marginTop: "14px", textAlign: "center" }}>No transactions yet</p>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>{new Date(tx.created_at).toLocaleDateString()}</p>
            <span style={{ fontSize: "12px", fontWeight: 700, background: "#f3f4f6", padding: "4px 8px", borderRadius: "6px" }}>{getServiceType(tx)}</span>
          </div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: "14px", color: isFunding(tx) ? "#16a34a" : "#dc2626" }}>
            {isFunding(tx) ? "+" : "-"}₦{formatMoney(tx.amount)}
          </p>
        </div>
      )}
    </div>
  );
}
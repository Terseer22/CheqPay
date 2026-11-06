import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Tv, Zap, Wallet, ArrowDownUp, Smartphone, Signal } from "lucide-react";

const formatMoney = (n) => Number(n || 0).toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function Transactions({ onBack }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchAll();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    setTxs(data || []);
    setTimeout(() => setLoading(false), 400);
  };

  const isFundingTx = (t) => {
    const type = (t.type || t.service || t.category || "").toLowerCase();
    return type === "funding" || type === "credit" || type === "in";
  };

  const getServiceType = (t) => {
    if (isFundingTx(t)) return "Funding";
    const text = `${t.provider || ''} ${t.description || ''} ${t.category || ''}`.toLowerCase();
    if (text.includes("airtime") || text.includes("mtn") || text.includes("airtel") || text.includes("glo") || text.includes("9mobile")) return "Airtime";
    if (text.includes("data") || text.includes("gb")) return "Data";
    if (text.includes("dstv") || text.includes("gotv") || text.includes("startimes") || text.includes("cable")) return "Cable";
    if (text.includes("electric") || text.includes("ikedc") || text.includes("ekedc") || text.includes("aedc") || text.includes("phedc") || text.includes("jed")) return "Electricity";
    if (t.category) return t.category.charAt(0).toUpperCase() + t.category.slice(1);
    if (t.type) return t.type.charAt(0).toUpperCase() + t.type.slice(1);
    return "Airtime";
  };

  // REAL ICONS - no more emoji
  const getIcon = (service) => {
    if (service === "Airtime") return <Smartphone size={20} color="#2563eb" strokeWidth={2.2} />;
    if (service === "Data") return <Signal size={20} color="#7c3aed" strokeWidth={2.2} />;
    if (service === "Cable") return <Tv size={20} color="#db2777" strokeWidth={2.2} />;
    if (service === "Electricity") return <Zap size={20} color="#f59e0b" strokeWidth={2.2} />;
    if (service === "Funding") return <Wallet size={20} color="#16a34a" strokeWidth={2.2} />;
    return <ArrowDownUp size={20} color="#64748b" strokeWidth={2.2} />;
  };

  const getIconBg = (service) => {
    if (service === "Airtime") return "#dbeafe";
    if (service === "Data") return "#ede9fe";
    if (service === "Cable") return "#fce7f3";
    if (service === "Electricity") return "#fef3c7";
    if (service === "Funding") return "#dcfce7";
    return "#f3f4f6";
  };

  const filtered = filter === "All" ? txs : txs.filter(t => getServiceType(t) === filter);

  const grouped = filtered.reduce((acc, tx) => {
    const date = new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      paddingTop: "20px", overflowY: "auto"
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        @keyframes softFade { 0% { opacity: 0.4; } 50% { opacity: 0.9; } 100% { opacity: 0.4; } }
        .sk { background: linear-gradient(90deg, #EDEEF1 25%, #F6F7F9 50%, #EDEEF1 75%); background-size: 200px 100%; animation: shimmer 1.4s infinite linear; border-radius: 10px; }
        .sk-fade { animation: softFade 1.6s ease-in-out infinite; }
      `}</style>

      <div style={{
        background: "#f8f9fb", width: "100%", maxWidth: "480px", minHeight: "100vh",
        borderRadius: "24px 24px 0 0", boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
        animation: "slideUp 0.3s ease"
      }}>
        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "24px 24px 0 0", position: "sticky", top: 0, zIndex: 2, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={onBack} style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #eee", background: "#fff", cursor: "pointer", fontSize: "18px" }}>←</button>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>Transaction History</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                  {loading ? "Loading..." : `${txs.length} transactions`}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", overflowX: "hidden" }}>
              {[90, 70, 60, 80, 90, 70].map((w, i) => (
                <div key={i} className="sk" style={{ width: w, height: 30, borderRadius: 10, flexShrink: 0 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", overflowX: "auto", scrollbarWidth: "none" }}>
              {["All", "Airtime", "Data", "Cable", "Electricity", "Funding"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
                    border: filter === f ? "none" : "1px solid #e5e7eb",
                    background: filter === f ? "#ebc710" : "#fff",
                    color: filter === f ? "#141414" : "#050404", cursor: "pointer"
                  }}>{f}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "16px" }}>
          {loading ? (
            <>
              <div style={{ marginBottom: "20px" }}>
                <div className="sk" style={{ width: 140, height: 12, margin: "0 0 10px 4px" }} />
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "14px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="sk" style={{ width: 42, height: 42, borderRadius: 12 }} />
                      <div>
                        <div className="sk" style={{ width: 80, height: 13, marginBottom: 6 }} />
                        <div className="sk" style={{ width: 120, height: 11 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="sk" style={{ width: 70, height: 14, marginLeft: "auto", marginBottom: 6 }} />
                      <div className="sk" style={{ width: 40, height: 11, marginLeft: "auto" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "20px" }}>
                <div className="sk" style={{ width: 110, height: 12, margin: "0 0 10px 4px" }} />
                {[0, 1].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "14px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="sk" style={{ width: 42, height: 42, borderRadius: 12 }} />
                      <div>
                        <div className="sk" style={{ width: 70, height: 13, marginBottom: 6 }} />
                        <div className="sk" style={{ width: 100, height: 11 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="sk" style={{ width: 60, height: 14, marginLeft: "auto", marginBottom: 6 }} />
                      <div className="sk" style={{ width: 35, height: 11, marginLeft: "auto" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "20px" }}>
                <div className="sk" style={{ width: 130, height: 12, margin: "0 0 10px 4px" }} />
                {[0, 1].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "14px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="sk" style={{ width: 42, height: 42, borderRadius: 12 }} />
                      <div>
                        <div className="sk" style={{ width: 90, height: 13, marginBottom: 6 }} />
                        <div className="sk" style={{ width: 110, height: 11 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="sk" style={{ width: 65, height: 14, marginLeft: "auto", marginBottom: 6 }} />
                      <div className="sk" style={{ width: 45, height: 11, marginLeft: "auto" }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
              <div style={{ fontSize: "40px", opacity: 0.3 }}>🧾</div>
              <p style={{ color: "#888", fontSize: "14px", marginTop: "10px" }}>No {filter} transactions</p>
            </div>
          ) : (
            Object.keys(grouped).map(date => (
              <div key={date} style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", margin: "0 0 10px 4px", letterSpacing: "0.5px" }}>{date}</p>
                {grouped[date].map(tx => {
                  const service = getServiceType(tx);
                  const isFunding = isFundingTx(tx);
                  return (
                    <div key={tx.id} style={{ background: "#fff", borderRadius: "14px", padding: "14px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: getIconBg(service), display: "flex", alignItems: "center", justifyContent: "center" }}>{getIcon(service)}</div>
                        <div>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111" }}>{service}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.status || "Success"}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: isFunding ? "#16a34a" : "#dc2626" }}>{isFunding ? "+" : "-"}₦{formatMoney(tx.amount)}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9ca3af" }}>{tx.provider || ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
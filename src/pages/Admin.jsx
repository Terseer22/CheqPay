import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Admin({ setPage }) {
  const [reqs, setReqs] = useState([]);
  const [usersWallets, setUsersWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const protectAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPage("login");
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).maybeSingle();
      if (!data?.is_admin) {
        alert("You no be admin!");
        setPage("mobileHome");
        return;
      }
      loadAll();
    };
    protectAdmin();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    
    const { data: requests } = await supabase
     .from("funding_requests")
     .select("*")
     .eq("status", "pending")
     .order("created_at", { ascending: false });
    setReqs(requests || []);

    // REAL USERS - NO FAKE AMOUNT
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    
    if (profiles) {
      const withWallets = await Promise.all(
        profiles.map(async (p) => {
          const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", p.id).maybeSingle();
          // Use real balance: wallets.balance > profiles.wallet_balance > 0
          const realBalance = wallet?.balance ?? p.wallet_balance ?? 0;
          return { ...p, realBalance };
        })
      );
      setUsersWallets(withWallets);
    }
    
    setLoading(false);
  };

  const handleApprove = async (req) => {
    try {
      await supabase.from("funding_requests").update({ status: "approved" }).eq("id", req.id);

      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", req.user_id).maybeSingle();
      const currentBal = wallet?.balance ?? 0;
      const newBalance = Number(currentBal) + Number(req.amount);

      await supabase.from("wallets").upsert({ user_id: req.user_id, balance: newBalance }, { onConflict: "user_id" });
      await supabase.from("profiles").update({ wallet_balance: newBalance }).eq("id", req.user_id);

      alert(`Approved ₦${Number(req.amount).toLocaleString()}! New balance: ₦${newBalance.toLocaleString()}`);
      loadAll();

    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleReject = async (id) => {
    await supabase.from("funding_requests").update({ status: "rejected" }).eq("id", id);
    setReqs(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading admin data...</div>;

  return (
    <div style={{ padding: 20, background: '#FCEEF2', minHeight: '100vh', paddingBottom: 80 }}>
      <button onClick={() => setPage("mobileHome")} style={{ background: '#000', color: '#fff', padding: '10px 18px', borderRadius: 20, border: 'none', marginBottom: 20, cursor: 'pointer' }}>
        ← Back to Home
      </button>

      <h2>Cheqpay Admin Panel</h2>
      <p style={{ color: '#666' }}><b>{reqs.length}</b> pending manual funding</p>

      {reqs.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 10, borderRadius: 12, background: '#fff' }}>
          <b style={{ fontSize: 18 }}>₦{Number(r.amount).toLocaleString()}</b> - {new Date(r.created_at).toLocaleString()}<br/>
          <small>User: {r.user_id?.slice(0,8)}...</small><br/>
          {r.proof_url && <a href={r.proof_url} target="_blank" rel="noreferrer" style={{ color: '#7c3aed', fontWeight: 700 }}>View Proof</a>}
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <button onClick={() => handleApprove(r)} style={{ background: "green", color: "white", padding: "8px 15px", border: 'none', borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>Approve</button>
            <button onClick={() => handleReject(r.id)} style={{ background: "red", color: "white", padding: "8px 15px", border: 'none', borderRadius: 6, cursor: "pointer" }}>Reject</button>
          </div>
        </div>
      ))}

      <hr style={{ margin: "30px 0" }} />
      
      <h3>All Users — Real Balances</h3>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>This matches your SQL screenshot — no fake amount</p>
      
      {usersWallets.map(u => (
        <div key={u.id} style={{ background: "#fff", padding: "12px", marginBottom: "8px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: 'center', border: "1px solid #eee" }}>
          <div>
            <b>{u.full_name || u.username || "No name"}</b><br/>
            <small style={{ color: "#666" }}>{u.email}</small> {u.is_admin && <span style={{ background: '#000', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, marginLeft: 6 }}>ADMIN</span>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <b style={{ color: u.realBalance > 0 ? "#16a34a" : "#888" }}>₦{Number(u.realBalance || 0).toLocaleString()}</b><br/>
            <small style={{ fontSize: 10, color: '#aaa' }}>{u.username || "no username"}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
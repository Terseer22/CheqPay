import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Admin({ setPage }) {
  const [reqs, setReqs] = useState([]);

  // 1. Protect admin - MUST be inside component
  useEffect(() => {
    const protectAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPage("login");
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single();
      if (!data?.is_admin) {
        alert("You no be admin!");
        setPage("home");
      }
    };
    protectAdmin();
  }, [setPage]);

  const load = async () => {
    const { data } = await supabase
     .from("funding_requests")
     .select("*")
     .eq("status", "pending")
     .order("created_at", { ascending: false });
    setReqs(data || []);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (req) => {
    try {
      await supabase.from("funding_requests").update({ status: "approved" }).eq("id", req.id);

      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", req.user_id).maybeSingle();

      if (!wallet) {
        await supabase.from("wallets").insert({ user_id: req.user_id, balance: req.amount });
      } else {
        await supabase.from("wallets").update({ balance: wallet.balance + req.amount }).eq("user_id", req.user_id);
      }

      alert(`Approved ₦${req.amount} for user!`);
      setReqs(prev => prev.filter(r => r.id!== req.id));

    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const handleReject = async (id) => {
    await supabase.from("funding_requests").update({ status: "rejected" }).eq("id", id);
    setReqs(prev => prev.filter(r => r.id!== id));
  };

  return (
    <div style={{ padding: 20, background: '#FCEEF2', minHeight: '100vh' }}>
      <button
        onClick={() => setPage("home")}
        style={{ background: '#000', color: '#fff', padding: '10px 18px', borderRadius: 20, border: 'none', marginBottom: 20 }}
      >
        ← Back to Home
      </button>

      <h2>Cheqpay Admin - Manual Funding</h2>
      <p>{reqs.length} pending</p>

      {reqs.map((r) => (
        <div key={r.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 10, borderRadius: 8, background: '#fff' }}>
          <b>₦{r.amount}</b> - {new Date(r.created_at).toLocaleString()}<br/>
          <a href={r.proof_url} target="_blank" rel="noreferrer">View Proof</a>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => handleApprove(r)} style={{ background: "green", color: "white", padding: "8px 15px", marginRight: 10, border: 'none', borderRadius: 6 }}>Approve</button>
            <button onClick={() => handleReject(r.id)} style={{ background: "red", color: "white", padding: "8px 15px", border: 'none', borderRadius: 6 }}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
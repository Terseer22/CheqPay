import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function FundingHistory({ setPage }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    
    // 1. Get current logged in user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setPage("login");
      return;
    }
    const userId = session.user.id;

    // 2. Check if na admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
    const admin = profile?.is_admin || false;
    setIsAdmin(admin);

    // 3. MAGIC FIX: If admin, see all. If normal user, see only him own
    let query = supabase.from("funding_requests").select("*").order("created_at", { ascending: false });
    
    if (!admin) {
      // Normal user - filter by user_id
      query = query.eq("user_id", userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.log("History error:", error.message);
    }
    
    if (data) setHistory(data);
    setLoading(false);
  };

  if (loading) return <div style={{padding:50, textAlign:'center'}}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8f7', padding: 20 }}>
      <button onClick={() => setPage("home")} style={{ background: 'white', border: '1px solid #ddd', padding: '8px 14px', borderRadius: 10, fontWeight: 700 }}>← Back</button>
      
      <div style={{ maxWidth: 500, margin: '20px auto' }}>
        <h2 style={{ color: '#10231c', marginBottom: 20 }}>
          {isAdmin ? "All Funding Requests (Admin)" : "My Funding History"}
        </h2>
        
        {history.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 30, textAlign: 'center' }}>
            <p>No history yet</p>
            <button onClick={() => setPage("fund")} style={{ background: '#0a7ddf', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 12, marginTop: 15, fontWeight:700 }}>Fund Wallet</button>
          </div>
        ) : history.map(item => (
          <div key={item.id} style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#10231c', margin:0 }}>₦{Number(item.amount).toLocaleString()}</p>
              <small style={{ color: '#7b8782' }}>{new Date(item.created_at).toLocaleString()}</small>
              {isAdmin && <small style={{display:'block', color:'#0a7ddf'}}>User: {item.user_id?.slice(0,8)}...</small>}
            </div>
            <span style={{ 
              background: item.status === 'approved' ? '#e8f8f2' : item.status === 'pending' ? '#fff8e6' : '#fde8e8',
              color: item.status === 'approved' ? '#00a86b' : item.status === 'pending' ? '#c69200' : '#d32f2f',
              padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase'
            }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
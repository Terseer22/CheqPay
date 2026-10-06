import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import MobileHeader from "../components/mobileheader";
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import TransactionCard from "../components/TransactionCard";
import ServicesGrid from "../components/ServicesGrid";
import SecurityBanner from "../components/SecurityBanner";
import BottomNavigation from "../components/BottomNavigation";

export default function MobileHome({ setPage }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (user.email === 'terseeranandeakor@gmail.com') {
        setIsAdmin(true);
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      if (data?.is_admin) setIsAdmin(true);
    };
    check();
  }, []);

  return (
    <main style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: 80 }}>
      <MobileHeader setPage={setPage} />
      <BalanceCard setPage={setPage} />
      <TransactionCard />
      
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Transaction History</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={()=>setPage("bulk-sms")} style={{ background: '#7c3aed', color: '#fff', padding: '8px 14px', borderRadius: 20, fontSize: 13, border: 'none', fontWeight: 600 }}>
            📩 Bulk SMS
          </button>
          {isAdmin && (
            <button onClick={()=>setPage("admin")} style={{ background: '#000', color: '#fff', padding: '8px 14px', borderRadius: 20, fontSize: 13, border: 'none' }}>
              Admin Panel
            </button>
          )}
        </div>
      </div>

      <QuickActions setPage={setPage} />
      
      {/* BULK SMS BANNER */}
      <div onClick={()=>setPage("bulk-sms")} style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Bulk SMS Service</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>Send to 1000 numbers at once • ₦4.5/SMS</div>
        </div>
        <div style={{ background: '#fff', color: '#7c3aed', padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Send Now →</div>
      </div>

      <ServicesGrid setPage={setPage} />
      <SecurityBanner />
      <BottomNavigation setPage={setPage} />
    </main>
  );
}
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
      
      console.log("Checking admin for:", user.email);
      
      // METHOD 1: Check by email directly (100% sure)
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
      
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <strong>Transaction History</strong>
        {isAdmin && (
          <button onClick={()=>setPage("admin")} style={{ background: '#000', color: '#fff', padding: '8px 14px', borderRadius: 20, fontSize: 13, border: 'none' }}>
            Admin Panel
          </button>
        )}
      </div>
      <QuickActions setPage={setPage} />
      <ServicesGrid setPage={setPage} />
      <SecurityBanner />
      <BottomNavigation setPage={setPage} />
    </main>
  );
}
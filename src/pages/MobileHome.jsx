import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import MobileHeader from "../components/mobileheader";
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import ServicesGrid from "../components/ServicesGrid";
import SecurityBanner from "../components/SecurityBanner";
import BottomNavigation from "../components/BottomNavigation";
import AirtimeCard from "../components/AirtimeCard";
import DataStation from "../components/DataStation";
import CableStation from "../components/CableStation";
import ElectricityStation from "../components/ElectricityStation";
import FundingHistory from "../components/FundingHistory";

export default function MobileHome({ setPage, page }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = Date.now();
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;
      if (user.email === 'terseeranandeakor@gmail.com') setIsAdmin(true);
    });

    // Show skeleton for at least 1000ms so e feel smooth, not flash
    const elapsed = Date.now() - start;
    const timer = setTimeout(() => setLoading(false), Math.max(0, 1000 - elapsed));
    return () => clearTimeout(timer);
  }, []);

  // --- SKELETON SCREEN - BLANK COPY OF REAL HOME ---
  if (loading) return (
    <main style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        @keyframes softFade { 0% { opacity: 0.4; } 50% { opacity: 0.9; } 100% { opacity: 0.4; } }
        .sk { background: linear-gradient(90deg, #EDEEF1 25%, #F6F7F9 50%, #EDEEF1 75%); background-size: 200px 100%; animation: shimmer 1.4s infinite linear; border-radius: 10px; }
        .sk-dark { background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 75%); background-size: 200px 100%; animation: shimmer 1.4s infinite linear; border-radius: 10px; }
        .sk-fade { animation: softFade 1.6s ease-in-out infinite; }
        .sk-input { background: #F2F3F5; border: 1px solid #EEF0F2; border-radius: 12px; height: 48px; width: 100%; animation: softFade 1.6s ease-in-out infinite; }
      `}</style>

      {/* 1. MobileHeader - blank */}
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <div className="sk" style={{ width:42, height:42, borderRadius:'50%' }} />
        <div style={{ flex:1 }}>
          <div className="sk" style={{ width:90, height:11, marginBottom:6 }} />
          <div className="sk" style={{ width:140, height:16 }} />
        </div>
        <div className="sk" style={{ width:38, height:38, borderRadius:'50%' }} />
        <div className="sk" style={{ width:38, height:38, borderRadius:'50%' }} />
      </div>

      {/* 2. BalanceCard - blank */}
      <div style={{ margin:'8px 16px 16px', background:'#111', borderRadius:20, padding:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="sk-dark" style={{ width:110, height:12 }} />
          <div className="sk-dark" style={{ width:70, height:22, borderRadius:20 }} />
        </div>
        <div className="sk-dark" style={{ width:'60%', height:32, marginTop:16 }} />
        <div className="sk-dark" style={{ width:'40%', height:12, marginTop:8 }} />
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <div className="sk-dark" style={{ flex:1, height:44, borderRadius:12 }} />
          <div className="sk-dark" style={{ flex:1, height:44, borderRadius:12 }} />
        </div>
      </div>

      {/* 3. FundingHistory - blank */}
      <div style={{ background:'#f7f7f7', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
          <div className="sk" style={{ width:130, height:16 }} />
          <div className="sk" style={{ width:60, height:12 }} />
        </div>
        {[0,1,2].map(i => (
          <div key={i} style={{ background:'#fff', borderRadius:14, padding:14, display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <div className="sk" style={{ width:44, height:44, borderRadius:12 }} />
            <div style={{ flex:1 }}>
              <div className="sk" style={{ width:'70%', height:13, marginBottom:6 }} />
              <div className="sk" style={{ width:'45%', height:11 }} />
            </div>
            <div className="sk" style={{ width:60, height:14 }} />
          </div>
        ))}
      </div>

      {/* 4. AirtimeCard - blank */}
      <div style={{ background:'#f2f3f4', padding:'20px' }}>
        <div className="sk" style={{ width:150, height:16, marginBottom:14 }} />
        <div className="sk-input" style={{ marginBottom:10 }} />
        <div style={{ display:'flex', gap:10 }}>
          <div className="sk" style={{ flex:1, height:42, borderRadius:12 }} />
          <div className="sk" style={{ flex:1, height:42, borderRadius:12 }} />
          <div className="sk" style={{ flex:1, height:42, borderRadius:12 }} />
        </div>
        <div className="sk" style={{ width:'100%', height:46, borderRadius:12, marginTop:12 }} />
      </div>

      {/* 5. DataStation - blank */}
      <div style={{ background:'#eceef3', padding:'20px' }}>
        <div className="sk" style={{ width:130, height:16, marginBottom:14 }} />
        <div className="sk-input" style={{ marginBottom:10 }} />
        <div style={{ display:'flex', gap:10 }}>
          {[0,1,2,3].map(i => <div key={i} className="sk" style={{ flex:1, height:60, borderRadius:12 }} />)}
        </div>
      </div>

      {/* 6. CableStation - blank */}
      <div style={{ background:'#f7f7f7', padding:'20px' }}>
        <div className="sk" style={{ width:140, height:16, marginBottom:14 }} />
        <div className="sk-input" style={{ marginBottom:10 }} />
        <div className="sk-input" />
      </div>

      {/* 7. ElectricityStation - blank */}
      <div style={{ background:'#f7f7f7', padding:'20px' }}>
        <div className="sk" style={{ width:160, height:16, marginBottom:14 }} />
        <div className="sk-input" style={{ marginBottom:10 }} />
        <div className="sk-input" />
      </div>

      {/* 8. QuickActions - blank circles */}
      <div style={{ padding:'16px', display:'flex', justifyContent:'space-between' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div className="sk" style={{ width:54, height:54, borderRadius:'50%' }} />
            <div className="sk" style={{ width:46, height:10 }} />
          </div>
        ))}
      </div>

      {/* 9. ServicesGrid - blank */}
      <div style={{ padding:'0 16px 16px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{ background:'#fff', borderRadius:14, padding:12, display:'flex', flexDirection:'column', alignItems:'center', gap:8, border:'1px solid #EEF0F2' }}>
            <div className="sk" style={{ width:36, height:36, borderRadius:10 }} />
            <div className="sk" style={{ width:44, height:10 }} />
          </div>
        ))}
      </div>

      {/* 10. SecurityBanner - blank */}
      <div style={{ margin:'0 16px 16px', background:'#F6F7F9', borderRadius:14, padding:14, display:'flex', alignItems:'center', gap:12 }}>
        <div className="sk" style={{ width:36, height:36, borderRadius:10 }} />
        <div style={{ flex:1 }}>
          <div className="sk" style={{ width:'80%', height:13, marginBottom:6 }} />
          <div className="sk" style={{ width:'60%', height:11 }} />
        </div>
      </div>

      {/* Bottom Nav - blank */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #EEF0F2', padding:'12px 20px', display:'flex', justifyContent:'space-between' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div className="sk" style={{ width:24, height:24, borderRadius:6 }} />
            <div className="sk" style={{ width:32, height:8 }} />
          </div>
        ))}
      </div>
    </main>
  );

  return (
    <main style={{ background: '#f2f3f4', minHeight: '100vh', paddingBottom: 80, }}>
      <MobileHeader setPage={setPage} page="home" />

     <BalanceCard setPage={setPage} />
        
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
        {isAdmin && (
          <button onClick={()=>setPage("admin")} style={{ background: '#000', color: '#fff', padding: '8px 14px', borderRadius: 20, fontSize: 13, border: 'none' }}>
            Admin Panel
          </button>
        )}
      </div>

      <div style={{background:'#f2f3f4', minHeight:'10vh', padding:'12px'}}> <FundingHistory setPage={setPage} /></div>
      <div style={{background:'#f2f3f4', minHeight:'10vh', padding:'12px'}}> <AirtimeCard setPage={setPage} /></div>
      <div style={{background:'#eceef3', minHeight:'10vh', padding:'12px'}}> <DataStation setPage={setPage} /></div>
      <div style={{background:'#f7f7f7', minHeight:'10vh', padding:'12px'}}> <CableStation setPage={setPage} /></div>
      <div style={{background:'#f7f7f7', minHeight:'10vh', padding:'12px'}}> <ElectricityStation setPage={setPage} /></div>
    
      
      
      <SecurityBanner />
      <BottomNavigation setPage={setPage} page="home" />
    </main>
  );
}
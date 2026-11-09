import { useEffect, useState } from "react";
import { Menu, User, Settings, HelpCircle, LogOut, X, ChevronRight, LayoutDashboard } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import Logo from "./logo";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const MobileHeader = ({ setPage, page, currentPage }) => {
  const [profile, setProfile] = useState(null);
  const [welcomeText, setWelcomeText] = useState("Welcome back!");
  const [showMenu, setShowMenu] = useState(false);
  const [balance, setBalance] = useState(0);

  const activePage = page || currentPage || "";

  const hour = parseInt(new Date().toLocaleString("en-US", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    hour12: false
  }));

  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data);
        if (data.has_seen_welcome === false || data.has_seen_welcome === null) {
          setWelcomeText("Welcome!");
          await supabase.from("profiles").update({ has_seen_welcome: true }).eq("id", user.id);
        }
      }
      const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle();
      if (wallet) {
        setBalance(wallet.balance ?? 0);
      } else if (data) {
        setBalance(data.wallet_balance ?? data.balance ?? 0);
      }
    };
    init();
  }, []);

  const displayName = profile?.username || "User";

  const goTo = (pageName) => {
    setShowMenu(false);
    if (setPage) setPage(pageName);
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await supabase.auth.signOut();
    if (setPage) setPage("login");
  };

  const menuItemStyle = { display:'flex', alignItems:'center', gap:12, padding:'14px 12px', cursor:'pointer', borderRadius:12, fontSize:14, fontWeight:600 };
  const iconBoxStyle = { width:38, height:38, borderRadius:10, background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 };
  const isHomeActive = activePage === "home" || activePage === "dashboard" || activePage === "mobileHome";

  return (
    <>
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      display:'flex', 
      justifyContent:'space-between', 
      alignItems:'center', 
      padding:'12px 16px', 
      background:'#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Menu size={24} onClick={() => setShowMenu(true)} style={{ cursor:'pointer' }} />

      <div onClick={() => setPage && setPage("profile")} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', textAlign:'left' }}>
        <div style={{ width:38, height:38, borderRadius:'60%', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink: 0 }}>
          <img src={profile?.avatar_url || DEFAULT_AVATAR} onError={(e) => { e.target.src = DEFAULT_AVATAR }} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" />
        </div>
        <div style={{ lineHeight:'1.2' }}>
          <div style={{ fontSize:13, fontWeight:'600' }}>{greeting}, {displayName}</div>
          <div style={{ fontSize:11, color:'#888' }}>{welcomeText}</div>
        </div>
      </div>
    </header>

    {showMenu && (
      <>
        <div onClick={() => setShowMenu(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1001 }} />

        <div style={{ position:'fixed', top:0, left:0, bottom:0, width:'70%', maxWidth:300, background:'#fff', zIndex:1002, padding:16, display:'flex', flexDirection:'column', boxShadow:'0 0 30px rgba(0,0,0,0.2)' }}>
          
          {/* TOP - IMAGE + USERNAME ON TOP, BALANCE BELOW */}
          <div onClick={() => goTo("profile")} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#f9f9f9', borderRadius:14, cursor:'pointer', marginBottom:14 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', overflow:'hidden', background:'#fff', flexShrink:0 }}>
              <img src={profile?.avatar_url || DEFAULT_AVATAR} onError={(e)=>{e.target.src=DEFAULT_AVATAR}} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="avatar" />
            </div>

            <div style={{ flex:1, minWidth:0, lineHeight:'1.3' }}>
              <div style={{ fontSize:15, fontWeight:800, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {displayName}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                <span style={{ fontSize:12, color:'#888', fontWeight:600 }}>Balance:</span>
                <span style={{ fontSize:12, fontWeight:500, color:'#0a0' }}>₦{Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>

            <div onClick={() => goTo("mobileHome")} style={{ 
              ...menuItemStyle, 
              background: isHomeActive ? '#f3d807f1' : '#0d0d01',
              color: isHomeActive ? '#090101' : '#000'
            }}>
              <span style={{ ...iconBoxStyle, background: isHomeActive ? 'rgba(255,255,255,0.2)' : '#010000', color: isHomeActive ? '#000000' : '#f5103a' }}>
                <LayoutDashboard size={18} />
              </span>
              Dashboard
              <ChevronRight size={16} style={{ marginLeft:'auto', color: isHomeActive ? '#000000' : '#aaa' }} />
            </div>
              
            <div onClick={() => goTo("profile")} style={{ ...menuItemStyle, background: activePage === "profile" ? '#f5f5f5' : 'transparent' }}>
              <span style={iconBoxStyle}><User size={18} /></span>
              Profile
              <ChevronRight size={16} style={{ marginLeft:'auto', color:'#aaa' }} />
            </div>

            <div onClick={() => goTo("settings")} style={{ ...menuItemStyle, background: activePage === "settings" ? '#f5f5f5' : 'transparent' }}>
              <span style={iconBoxStyle}><Settings size={18} /></span>
              Settings
              <ChevronRight size={16} style={{ marginLeft:'auto', color:'#aaa' }} />
            </div>

            {/* F.A.Q - FIXED */}
            <div onClick={() => goTo("faq")} style={{ ...menuItemStyle, background: activePage === "faq" ? '#f5f5f5' : 'transparent' }}>
              <span style={iconBoxStyle}><HelpCircle size={18} /></span>
              F.A.Q
              <ChevronRight size={16} style={{ marginLeft:'auto', color:'#aaa' }} />
            </div>
          </div>

          <div onClick={handleLogout} style={{ ...menuItemStyle, color:'#f5103a', background:'black', marginTop:12 }}>
            <span style={{ ...iconBoxStyle, background:'rgba(23, 8, 2, 0.2)', color:'#f5103a' }}><LogOut size={18} /></span>
            Logout
          </div>

        </div>
      </>
    )}
    </>
  );
};
export default MobileHeader;
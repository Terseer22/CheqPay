import { useEffect, useState } from "react";
import { Bell, Settings } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import Logo from "./logo";

const MobileHeader = ({ setPage }) => {
  const [profile, setProfile] = useState(null);
  const [welcomeText, setWelcomeText] = useState("Welcome back!");

  // Use Lagos time - no matter system time
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
      if (!data) return;
      setProfile(data);
      if (data.has_seen_welcome === false || data.has_seen_welcome === null) {
        setWelcomeText("Welcome!");
        await supabase.from("profiles").update({ has_seen_welcome: true }).eq("id", user.id);
      }
    };
    init();
  }, []);

  const displayName = profile?.username || "User";

  return (
    <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#fff' }}>
      <Logo />
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div onClick={() => setPage && setPage("profile")} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <div style={{ width:38, height:38, borderRadius:'50%', background:'#FF4D6D', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'bold', overflow:'hidden' }}>
            {profile?.avatar_url? <img src={profile.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : displayName[0]?.toUpperCase()}
          </div>
          <div style={{ lineHeight:'1.2' }}>
            <div style={{ fontSize:13, fontWeight:'600' }}>{greeting}, {displayName}</div>
            <div style={{ fontSize:11, color:'#888' }}>{welcomeText}</div>
          </div>
        </div>
        <Bell size={18} />
        <Settings size={18} onClick={() => setPage && setPage("profile")} style={{ cursor:'pointer' }} />
      </div>
    </header>
  );
};
export default MobileHeader;
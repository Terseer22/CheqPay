import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import "../styles/messagecard.css";

export default function MessageCard({ username, user, setPage }) {
  const [displayName, setDisplayName] = useState(username || "user");

  useEffect(() => {
    const getName = async () => {
      // 1. If parent already send correct name, use am
      if (username) { setDisplayName(username); return; }
      // 2. Try from user prop passed from parent
      const metaName = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.username;
      if (metaName) { setDisplayName(metaName); return; }

      // 3. Fetch from Supabase - profiles table
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      if (!authUser) return;

      if (authUser.user_metadata?.username) {
        setDisplayName(authUser.user_metadata.username);
        return;
      }
      // Try profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profile?.username) {
        setDisplayName(profile.username);
      } else if (authUser.email) {
        // Last fallback: use email prefix - e.g cheqcee from cheqcee@gmail.com
        setDisplayName(authUser.email.split("@")[0]);
      }
    };
    getName();
  }, [username, user]);

  return (
    <div className="cheqpay-card">
      <div className="cheqpay-logo-row">
        <div className="cheqpay-check"><img className="vehzalogo"  src="/vehzalogo.png"></img></div>
        <div>
          <h2 className="cheqpay-title">Vehza</h2>
          <p className="cheqpay-tagline">FAST • SECURE • RELIABLE</p>
        </div>
      </div>

      <p className="cheqpay-dear">
        Dear <span>{displayName}</span>,
      </p>

      <p className="cheqpay-main-text">
     Welcome to Vehza, your one-stop platform for affordable data, airtime, cable, and electricity payments, with zero funding charges
      </p>

      <p className="cheqpay-sub-text">
       Thank you for choosing vehza.
      </p>

     

      <div className="cheqpay-badge-wrap">
        <div className="cheqpay-badge">
        
          Zero Funding Charges
        </div>
      </div>
    </div>
  );
}
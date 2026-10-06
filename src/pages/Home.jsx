import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import MobileHome from "./MobileHome";

export default function Home({ setPage }) {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email === 'terseeranandeakor@gmail.com') {
        setIsAdmin(true);
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      if (data?.is_admin) setIsAdmin(true);
    };
    checkAdmin();
  }, []);

  return <MobileHome setPage={setPage} isAdmin={isAdmin} />;
}
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jmgneojoytdwoewueopj.supabase.co";
const supabaseKey = "sb_publishable_AMT3p0nuWN3bufYQAW_U8A_vwEyd7Yp";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jmgneojoytdwoewueopj.supabase.co";
const supabaseKey = "sb_publishable_AMT3p0nuWN3bufYQAW_U8A_vwEyd7Yp";

// No custom storage - make Supabase handle am by itself
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
import { useState, useEffect } from "react";
import MobileHome from "./pages/MobileHome";
import DesktopHome from "./pages/DesktopHome"
import BulkSmsPage from "./pages/BulkSmsPage"
import Login from "./pages/login"
import SignUp from "./pages/Signup"
import Airtime from "./pages/Airtime";
import Profile from "./pages/Profile"
import FundWallet from "./pages/FundWallet";
import { supabase } from "./supabase/supabaseClient";
import ProfilePin from "./pages/ProfilePin";
import Transactions from "./pages/Transactions";
import ResetPassword from "./pages/ResetPassword";

// Pages wey need login before you fit enter
const PROTECTED_PAGES = [
  "mobileHome",
  "airtime",
  "fundwallet",
  "profile",
  "pinSettings",
  "bulk-sms",
  "transactions",
]

export default function App() {
  const [page, setPage] = useState("login");
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // ADD THIS - track if user login

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768);
    check();
    window.addEventListener("resize", check);

    // CHECK IF USER DON LOGIN BEFORE
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setPage("mobileHome")
      } else {
        setUser(null)
        setPage("login")
      }
      setLoading(false)
    });

    // LISTEN - if user logout, carry am comot for dashboard immediately
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        // If e dey protected page and e logout, carry am go login
        setPage((currentPage) => PROTECTED_PAGES.includes(currentPage) ? "login" : currentPage)
      }
    });

    return () => {
      window.removeEventListener("resize", check);
      subscription.unsubscribe()
    }
  }, []);

  if (loading) {
    return <div style={{ background: "#0a0e1a", minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>
  }

  // PUBLIC PAGES - no need login
  if (page === "reset-password") return <ResetPassword setPage={setPage} />
  if (page === "login") return <Login setPage={setPage} />;
  if (page === "signup") return <SignUp setPage={setPage} />;

  // 🔒 THE GUARD - if user never login and e try enter protected page, block am
  if (!user && PROTECTED_PAGES.includes(page)) {
    return <Login setPage={setPage} />;
  }

  // PROTECTED PAGES - only reach here if user don login
  if (page === "airtime") return <Airtime setPage={setPage} />;
  if (page === "fundwallet") return <FundWallet setPage={setPage} />;
  if (page === "profile") return <Profile setPage={setPage} />;
  if (page === "pinSettings") return <ProfilePin setPage={setPage} />
  if (page === "bulk-sms") return <BulkSmsPage setPage={setPage} />;
  if (page === "transactions") return <Transactions setPage={setPage} />;

  // HOME LOGIC
  if (page === "mobileHome") {
    return isDesktop ?
      <DesktopHome setPage={setPage} /> :
      <MobileHome setPage={setPage} />;
  }

  // ❌ BEFORE: return <MobileHome /> - na this dey leak dashboard
  // ✅ AFTER: If page no match anything, go login, no go home
  return <Login setPage={setPage} />;
}
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
import WhatsAppFloat from "./components/WhatsAppFloat";

// Pages wey need login before you fit enter
const PROTECTED_PAGES = [
  "mobileHome",
  "airtime",
  "fundwallet",
  "profile",
  "pinSettings",
  "bulk-sms",
  "transactions",
  "faq",
]

export default function App() {
  const [page, setPage] = useState("login");
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768);
    check();
    window.addEventListener("resize", check);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
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

  // PUBLIC PAGES - no need login, NO WHATSAPP HERE
  if (page === "reset-password") return <ResetPassword setPage={setPage} />
  if (page === "login") return <Login setPage={setPage} />;
  if (page === "signup") return <SignUp setPage={setPage} />;

  // 🔒 THE GUARD
  if (!user && PROTECTED_PAGES.includes(page)) {
    return <Login setPage={setPage} />;
  }

  // PROTECTED PAGES - ALL WITH WHATSAPP FLOATING BUTTON
  if (page === "airtime") return <><Airtime setPage={setPage} /><WhatsAppFloat /></>;
  if (page === "fundwallet") return <><FundWallet setPage={setPage} /><WhatsAppFloat /></>;
  if (page === "profile") return <><Profile setPage={setPage} /><WhatsAppFloat /></>;
  if (page === "pinSettings") return <><ProfilePin setPage={setPage} /><WhatsAppFloat /></>;
  if (page === "bulk-sms") return <><BulkSmsPage setPage={setPage} /><WhatsAppFloat /></>;
  if (page === "transactions") return <><Transactions setPage={setPage} /><WhatsAppFloat /></>;

  // HOME LOGIC - FAQ GO THROUGH MOBILEHOME TOO + WHATSAPP
  if (page === "mobileHome" || page === "faq") {
    return (
      <>
        {isDesktop ?
          <DesktopHome setPage={setPage} page={page} user={user} /> :
          <MobileHome setPage={setPage} page={page} user={user} />}
        <WhatsAppFloat />
      </>
    );
  }

  return <Login setPage={setPage} />;
}
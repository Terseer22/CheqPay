import { useState, useEffect } from "react";
import MobileHome from "./pages/MobileHome";
import DesktopHome from "./pages/DesktopHome"
import BulkSmsPage from "./pages/BulkSmsPage"
import Login from "./pages/login"
import Airtime from "./pages/Airtime";
import DataStation from "./pages/DataStation";
import Profile from "./pages/Profile"
import CableStation from "./pages/CableStation"
import ElectriciyStation from "./pages/ElectricityStation"

export default function App() {
  const [page, setPage] = useState("mobileHome");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (page === "airtime") return <Airtime setPage={setPage} />;
  if (page === "data") return <DataStation setPage={setPage} />;
  if (page === "profile") return <Profile setPage={setPage} />;
  if (page === "login") return <Login setPage={setPage} />;
  if (page === "electricity") return <ElectriciyStation setPage={setPage} />;
  if (page === "cable") return <CableStation setPage={setPage} />;
  if (page === "bulk-sms") return <BulkSmsPage setPage={setPage} />;

  // HOME LOGIC
  if (page === "mobileHome") {
    return isDesktop ? 
      <DesktopHome setPage={setPage} /> : 
      <MobileHome setPage={setPage} />;
  }

  return <MobileHome setPage={setPage} />;
}
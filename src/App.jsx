import { useState, lazy, Suspense } from "react";

// Lazy load all pages - e go load only when user need am
const Login = lazy(() => import("./pages/login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const FundWallet = lazy(() => import("./pages/FundWallet.jsx"));
const FundingHistory = lazy(() => import("./pages/FundingHistory.jsx"));
const MobileHome = lazy(() => import("./pages/MobileHome.jsx"));
const DesktopHome = lazy(() => import("./pages/DesktopHome.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const DataStation = lazy(() => import("./pages/DataStation.jsx"));
const Airtime = lazy(() => import("./pages/Airtime.jsx"));
const CableStation = lazy(() => import("./pages/CableStation.jsx"));
const ElectricityStation = lazy(() => import("./pages/ElectricityStation.jsx"));
const ExamPinPage = lazy(() => import("./pages/ExamPinPage.jsx"));

function App() {
  const [page, setPage] = useState("login");

  return (
    <Suspense fallback={<div style={{padding: 20, textAlign: 'center'}}>Loading CheqPay...</div>}>
      {page === "data" || page === "datastation" ? <DataStation setPage={setPage} /> : null}
      {page === "airtime" ? <Airtime setPage={setPage} /> : null}
      {page === "cable" ? <CableStation setPage={setPage} /> : null}
      {page === "electricity" ? <ElectricityStation setPage={setPage} /> : null}
      {page === "exam" ? <ExamPinPage setPage={setPage} /> : null}
      {page === "desktopHome" ? <DesktopHome setPage={setPage} /> : null}
      {page === "login" ? <Login setPage={setPage} /> : null}
      {page === "signup" ? <Signup setPage={setPage} /> : null}
      {page === "home" ? <Home setPage={setPage} /> : null}
      {page === "profile" ? <Profile setPage={setPage} /> : null}
      {page === "fundWallet" || page === "fund" ? <FundWallet setPage={setPage} /> : null}
      {page === "fundingHistory" ? <FundingHistory setPage={setPage} /> : null}
      {page === "mobileHome" ? <MobileHome setPage={setPage} /> : null}
      {page === "admin" ? <Admin setPage={setPage} /> : null}
    </Suspense>
  );
}

export default App;
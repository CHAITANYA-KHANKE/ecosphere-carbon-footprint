import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EcoTips = lazy(() => import("./pages/EcoTips"));
const Home = lazy(() => import("./pages/Home"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));

function PageLoader() {
  return <div className="grid min-h-screen place-items-center bg-[#f4f8f7] text-sm font-semibold text-slate-500 dark:bg-[#06110f] dark:text-slate-300" role="status">Loading EcoTrack...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader/>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="tips" element={<EcoTips />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

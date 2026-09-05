import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./state/app";
import { AppShell } from "./components/AppShell";
import { Home } from "./pages/Home";
import { Preferences } from "./pages/Preferences";
import { ReachSetup } from "./pages/ReachSetup";
import { ReachResults } from "./pages/ReachResults";
import { Confidence } from "./pages/Confidence";
import { Settings } from "./pages/Settings";
import { About } from "./pages/About";
import { FindNeed } from "./pages/FindNeed";
import { RouteComparison } from "./pages/RouteComparison";
import { ParkMatch } from "./pages/ParkMatch";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="reach" element={<ReachSetup />} />
          <Route path="reach/results" element={<ReachResults />} />
          <Route path="route" element={<RouteComparison />} />
          <Route path="find" element={<FindNeed />} />
          <Route path="parks" element={<ParkMatch />} />
          <Route path="confidence" element={<Confidence />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

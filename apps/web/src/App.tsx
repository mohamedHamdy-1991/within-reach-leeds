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
import { PreviewStub } from "./pages/PreviewStub";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="reach" element={<ReachSetup />} />
          <Route path="reach/results" element={<ReachResults />} />
          <Route path="route" element={<PreviewStub title="Take me there" phase="Phase 5 brings route comparison with the live router" />} />
          <Route path="find" element={<PreviewStub title="I need something" phase="Phase 5 brings place search with the validated data release" />} />
          <Route path="parks" element={<PreviewStub title="Find a park" phase="Phase 5 brings ParkMatch with the validated data release" />} />
          <Route path="confidence" element={<Confidence />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

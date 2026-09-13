import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@within-reach/design-system/tokens.css";
import "@within-reach/design-system/fonts.css";
import "@within-reach/design-system/components.css";
import "./styles/shell.css";
import "./styles/app.css";
import "./styles/glass.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// The offline shell caches the interface only; registration is best-effort.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

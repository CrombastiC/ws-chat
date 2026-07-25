import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Global error handler to catch runtime errors
window.onerror = (msg, url, line, col, error) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding:20px;color:#ff6b6b;font-family:monospace;white-space:pre-wrap;">
<h2>Runtime Error</h2>
<p>${msg}</p>
<p>${url}:${line}:${col}</p>
<p>${error?.stack || ""}</p>
</div>`;
  }
  return false;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

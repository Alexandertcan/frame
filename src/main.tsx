import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/archivo";
import "@fontsource-variable/manrope";
import App from "./App";
import "./styles.css";
import "./experience.css";
import "./account-pages.css";
import "./comfort.css";
import "./workspace-glass.css";
import "./workspace-wizard-glass.css";
import "./home-motion.css";
import "./computer-showcase.css";
import "./navigation-glass.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

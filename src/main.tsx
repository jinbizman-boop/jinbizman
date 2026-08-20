import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/artdirection.css";
import "./styles/telos-master.css";
import "./styles/executive-home-v2.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element is required");
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);

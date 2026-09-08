import React from "react";
import ReactDOM from "react-dom/client";
import { DemoGhostProvider } from "@demoghostjs/react";
import { App } from "./App";
import "demoghost/css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DemoGhostProvider>
      <App />
    </DemoGhostProvider>
  </React.StrictMode>
);

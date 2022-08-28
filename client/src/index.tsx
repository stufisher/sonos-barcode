import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CacheProvider } from "rest-hooks";

const root = ReactDOM.createRoot(document.getElementById("root") as Element);
root.render(
  <React.StrictMode>
    <CacheProvider>
      <App />
    </CacheProvider>
  </React.StrictMode>
);

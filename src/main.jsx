import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LoanProvider from "./LoanContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoanProvider>
      <App />
    </LoanProvider>
  </React.StrictMode>
);

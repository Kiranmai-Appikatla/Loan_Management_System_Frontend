// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoanProvider, { LoanContext } from "./LoanContext.jsx";
import Login from "./components/Login.jsx";
import Borrower from "./components/Borrower.jsx";
import Lender from "./components/Lender.jsx";
import Admin from "./components/Admin.jsx";
import Analyst from "./components/Analyst.jsx";
import Home from "./components/Home.jsx";

export default function App() {
  return (
    <LoanProvider>
      <Router>
        <RoutesWrapper />
      </Router>
    </LoanProvider>
  );
}

function RoutesWrapper() {
  const { currentUser } = React.useContext(LoanContext);

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Borrower Dashboard */}
      {currentUser && currentUser.role === "Borrower" && (
        <Route path="/borrower" element={<Borrower />} />
      )}

      {/* Lender Dashboard */}
      {currentUser && currentUser.role === "Lender" && (
        <Route path="/lender" element={<Lender />} />
      )}

      {/* Admin Dashboard */}
      {currentUser && currentUser.role === "Admin" && (
        <Route path="/admin" element={<Admin />} />
      )}

      {/* Analyst Dashboard */}
      {currentUser && currentUser.role === "Analyst" && (
        <Route path="/analyst" element={<Analyst />} />
      )}

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

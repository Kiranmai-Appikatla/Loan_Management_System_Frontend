import { useState } from "react";
import Login from "./Login.jsx";
import "./Home.css";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="home-container">
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="navbar">
        <div className="logo-container">
          <h1 className="logo">LoanVerse</h1>
          <p className="logo-subtitle">Modern Credit Platform</p>
        </div>

        {/* Smooth scrolling navigation */}
        <div className="nav-links">
          <a href="#home" className="nav-item active">Home</a>
          <a href="#about" className="nav-item">About</a>
          <a href="#pricing" className="nav-item">Pricing</a>
          <a href="#contact" className="nav-item">Contact</a>
          <a href="#faq" className="nav-item">FAQ</a>
        </div>

        {/* Buttons */}
        <div className="nav-buttons">
          <button 
            type="button"
            className="nav-btn login-btn"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>

          <button 
            type="button" 
            className="nav-btn get-in-touch-btn"
            onClick={() => setShowRegister(true)}  // Register modal
          >
            Register
          </button>
        </div>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <div id="home" className="hero">
        <h2 className="hero-title">
          End-to-end loan <br /> management system
        </h2>

        <p className="hero-subtitle">
          Transform your lending programs with LoanVerse’s centralized,
          full-suite loan management system.
        </p>

        <div className="hero-actions">
          <button type="button" className="cta-btn primary-cta">
            Learn More
          </button>

          <a href="#about" className="cta-link">
            Explore Platform →
          </a>
        </div>
      </div>

      {/* ---------------- ABOUT SECTION ---------------- */}
      <section id="about" className="section">
        <h2>About LoanVerse</h2>
        <p>
          LoanVerse provides seamless management for borrowers, lenders, admins, and analysts
          in a unified credit platform.
        </p>
      </section>

      {/* ---------------- PRICING SECTION ---------------- */}
      <section id="pricing" className="section">
        <h2>Pricing</h2>
        <p>Simple plans – Basic, Premium, and Enterprise.</p>
      </section>

      {/* ---------------- CONTACT SECTION ---------------- */}
      <section id="contact" className="section">
        <h2>Contact Us</h2>
        <p>Email: support@loanverse.com</p>
      </section>

      {/* ---------------- FAQ SECTION ---------------- */}
      <section id="faq" className="section">
        <h2>Frequently Asked Questions</h2>
        <p>No worries — we got you covered!</p>
      </section>

      {/* ---------------- LOGIN MODAL ---------------- */}
      {showLogin && (
        <div className="overlay">
          <div className="modal">
            <button 
              className="close-btn"
              onClick={() => setShowLogin(false)}
            >
              ✖
            </button>

            <Login isRegisterMode={false} />  
            {/* Login mode */}
          </div>
        </div>
      )}

      {/* ---------------- REGISTER MODAL ---------------- */}
      {showRegister && (
        <div className="overlay">
          <div className="modal">
            <button 
              className="close-btn"
              onClick={() => setShowRegister(false)}
            >
              ✖
            </button>

           <Login isRegisterMode={true} hideSwitch={true} />

            {/* Register mode */}
          </div>
        </div>
      )}
    </div>
  );
}

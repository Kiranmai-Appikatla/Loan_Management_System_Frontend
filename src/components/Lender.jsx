import { useState, useContext } from "react";
import { LoanContext } from "../LoanContext";
import "./Lender.css";
import { useNavigate } from "react-router-dom";

export default function Lender() {
  const navigate = useNavigate();
  const { loans, setLoans, currentUser } = useContext(LoanContext);

  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");

  if (!currentUser) return <p>Please log in to access your dashboard.</p>;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLoan = {
      id: Date.now(),
      amount: parseFloat(amount),
      interestRate: parseFloat(interestRate),
      duration: parseInt(duration),
      lender: currentUser.name,
      status: "available",
      requests: [],
    };
    setLoans([...loans, newLoan]);
    setAmount("");
    setInterestRate("");
    setDuration("");
  };

  const handleApproval = (loanId, borrowerName, approve) => {
    setLoans(
      loans.map((loan) => {
        if (loan.id === loanId) {
          const updatedRequests = (loan.requests || []).map((req) =>
            req.borrowerName === borrowerName
              ? {
                  ...req,
                  status: approve ? "approved" : "rejected",
                  payments: approve
                    ? req.payments
                    : [],
                }
              : req
          );
          return { ...loan, requests: updatedRequests };
        }
        return loan;
      })
    );
  };

  const myLoanOffers = loans.filter((loan) => loan.lender === currentUser.name);

  const allPendingRequests = myLoanOffers.flatMap((loan) =>
    loan.requests
      ?.filter((req) => req.status === "requested")
      .map((req) => ({
        ...req,
        loanId: loan.id,
        loanAmount: loan.amount,
        loanRate: loan.interestRate,
        loanDuration: loan.duration,
      })) || []
  );

  const renderPayments = (payments = []) => (
    <div className="payment-tracker">
      <h4>Payment Status:</h4>
      <div className="payments-grid">
        {payments.map((p, i) => (
          <div key={i} className={`payment-item ${p.paid ? "paid" : "pending"}`}>
            <span>Month {p.month}</span>
            <span>₹{p.amount}</span>
            <span className="payment-status">
              {p.paid ? "✅ Paid" : "⏳ Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="lender-container">
      <header className="dashboard-header">
        <h1>Welcome, {currentUser.name}</h1>
        <p>Your Lender Dashboard</p>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠 Home
        </button>
      </header>

      <div className="lender-content">
        <section className="offer-loan-section">
          <h2 className="section-title">Offer New Loan</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Interest Rate (%)"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Duration (months)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <button type="submit">Offer Loan</button>
          </form>
        </section>

        <section className="my-loans-section">
          <h2 className="section-title">
            Pending Borrower Requests ({allPendingRequests.length})
          </h2>

          <div className="loans-grid">
            {allPendingRequests.length > 0 ? (
              allPendingRequests.map((req) => (
                <div key={req.borrowerName} className="loan-card requested-card">
                  <div className="loan-detail">
                    <span className="detail-label">Borrower:</span>
                    <span className="detail-value">{req.borrowerName}</span>
                  </div>
                  <div className="loan-detail">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">₹{req.loanAmount}</span>
                  </div>
                  <div className="loan-detail">
                    <span className="detail-label">Rate:</span>
                    <span className="detail-value">{req.loanRate}%</span>
                  </div>
                  <div className="approval-buttons">
                    <button onClick={() => handleApproval(req.loanId, req.borrowerName, true)}>Approve</button>
                    <button onClick={() => handleApproval(req.loanId, req.borrowerName, false)}>Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-loans-message">
                <p>No new requests.</p>
              </div>
            )}
          </div>
        </section>

        <section className="my-loans-section">
          <h2 className="section-title">Loan History & Tracking</h2>
          <div className="loans-grid">
            {myLoanOffers.length > 0 ? (
              myLoanOffers.map((loan) => (
                <div key={loan.id} className="loan-card">
                  <h3 className="loan-card-title">Offer ID: {loan.id} • ₹{loan.amount}</h3>

                  {(loan.requests || []).length > 0 ? (
                    <div className="borrower-grid">
                      {loan.requests.map((req, index) => (
                        <div key={index} className="borrower-card">
                          <div className="borrower-header">
                            <span className="borrower-name">{req.borrowerName}</span>
                            <span className={`status-badge ${req.status}`}>{req.status}</span>
                          </div>
                          {req.status === "approved" && renderPayments(req.payments)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No requests yet.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="no-loans-message">
                <p>No loan offers yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
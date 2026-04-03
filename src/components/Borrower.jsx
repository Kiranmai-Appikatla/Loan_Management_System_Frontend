import { useContext } from "react";
import { LoanContext } from "../LoanContext";
import "./Borrower.css";
import { useNavigate } from "react-router-dom";

export default function Borrower() {
  const navigate = useNavigate();
  const { loans, setLoans, currentUser, requestLoan } = useContext(LoanContext);

  if (!currentUser) return <p>Please log in to access your dashboard.</p>;

  const calculateMonthlyPayment = (amt, rate, dur) => {
    const duration = parseInt(dur);
    if (!duration || duration <= 0) return 0;
    const totalAmount = parseFloat(amt) * (1 + parseFloat(rate) / 100);
    return totalAmount / duration;
  };

  const handleRequest = (loanId) => {
    requestLoan(loanId, currentUser);
    alert(`Request for Loan ID ${loanId} sent to the lender.`);
  };

  const handlePayment = (loanId, monthIndex) => {
    setLoans(
      loans.map((loan) => {
        if (loan.id === loanId) {
          const updatedRequests = (loan.requests || []).map((req) => {
            if (
              req.borrowerName === currentUser.name &&
              req.status === "approved"
            ) {
              const updatedPayments = req.payments.map((p, i) =>
                i === monthIndex ? { ...p, paid: true } : p
              );
              const allPaid = updatedPayments.every((p) => p.paid);
              return {
                ...req,
                payments: updatedPayments,
                status: allPaid ? "completed" : req.status,
              };
            }
            return req;
          });
          return { ...loan, requests: updatedRequests };
        }
        return loan;
      })
    );
  };

  const availableLoans = loans.filter((loan) => {
    const requests = loan.requests || [];
    const alreadyRequested = requests.some(
      (req) => req.borrowerName === currentUser.name
    );
    return loan.status === "available" && !alreadyRequested;
  });

  const myLoanStatuses = loans.flatMap((loan) =>
    (loan.requests || [])
      .filter((req) => req.borrowerName === currentUser.name)
      .map((req) => ({
        ...req,
        loanId: loan.id,
        lender: loan.lender,
        amount: loan.amount,
        interestRate: loan.interestRate,
        duration: loan.duration,
        overallStatus: req.status,
      }))
  );

  const myApprovedRequests = myLoanStatuses.filter(
    (req) => req.overallStatus === "approved" || req.overallStatus === "completed"
  );

  const myPendingRequests = myLoanStatuses.filter(
    (req) => req.overallStatus === "requested" || req.overallStatus === "rejected"
  );

  return (
    <div className="borrower-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {currentUser.name}</h1>
        <p>Your personalized Borrower Dashboard</p>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠 Home
        </button>
      </header>

      {/* Available Loans */}
      <section>
        <h2 className="section-heading">Available Loans</h2>
        <div className="loans-grid">
          {availableLoans.length > 0 ? (
            availableLoans.map((loan) => (
              <div key={loan.id} className="loan-card">
                <div className="loan-header">
                  <span className="lender-name">From: {loan.lender}</span>
                  <span className="loan-amount">₹{loan.amount}</span>
                </div>
                <div className="loan-details">
                  <p><b>Interest:</b> {loan.interestRate}%</p>
                  <p><b>Duration:</b> {loan.duration} months</p>
                  <button
                    className="request-btn"
                    onClick={() => handleRequest(loan.id)}
                  >
                    Request Loan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-message">No loans are currently available.</p>
          )}
        </div>
      </section>

      {/* My Pending/Rejected Requests */}
      <section>
        <h2 className="section-heading">My Request Statuses</h2>
        <div className="loans-grid">
          {myPendingRequests.length > 0 ? (
            myPendingRequests.map((loan) => (
              <div
                key={`${loan.loanId}-${loan.borrowerName}-${loan.overallStatus}`}
                className={`loan-card status-${loan.overallStatus}`}
              >
                <div className="loan-header">
                  <span className="lender-name">Lender: {loan.lender}</span>
                  <span className="loan-amount">₹{loan.amount}</span>
                </div>
                <div className="loan-details">
                  <p>
                    <b>Status:</b>{" "}
                    <span className={`status-badge ${loan.overallStatus}`}>
                      {loan.overallStatus}
                    </span>
                  </p>
                  <p><b>Rate:</b> {loan.interestRate}% | <b>Duration:</b> {loan.duration} months</p>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-message">No pending or rejected requests.</p>
          )}
        </div>
      </section>

      {/* My Active Loans */}
      <section>
        <h2 className="section-heading">My Active Loans</h2>
        <div className="loans-grid">
          {myApprovedRequests.length > 0 ? (
            myApprovedRequests.map((loan) => (
              <div
                key={`${loan.loanId}-${loan.borrowerName}-approved`}
                className="loan-card"
              >
                <div className="loan-header">
                  <span className="lender-name">From: {loan.lender}</span>
                  <span className="loan-amount">₹{loan.amount}</span>
                </div>
                <div className="loan-details">
                  <p><b>Interest:</b> {loan.interestRate}%</p>
                  <p><b>Duration:</b> {loan.duration} months</p>
                  <span className={`status-badge ${loan.overallStatus}`}>
                    {loan.overallStatus}
                  </span>
                </div>

                {loan.overallStatus !== "completed" && loan.payments && (
                  <div className="payments">
                    <h4>Monthly Payments</h4>
                    <div className="payments-grid">
                      {loan.payments.map((payment, index) => (
                        <div
                          key={`${loan.loanId}-month-${index}`}
                          className={`payment-item ${payment.paid ? "paid" : "pending"}`}
                        >
                          <span>Month {payment.month}</span>
                          <span>₹{payment.amount}</span>
                          {!payment.paid ? (
                            <button
                              className="pay-btn"
                              onClick={() => handlePayment(loan.loanId, index)}
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="paid-status">✅ Paid</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-message">You have no approved or active loans.</p>
          )}
        </div>
      </section>
    </div>
  );
}
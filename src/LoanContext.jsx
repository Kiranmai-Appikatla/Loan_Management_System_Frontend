import { createContext, useState, useEffect } from "react";

export const LoanContext = createContext();

export default function LoanProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("users"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(null);

  const [loanOffers, setLoanOffers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("loanOffers"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [loans, setLoans] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("loans"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("loanOffers", JSON.stringify(loanOffers));
  }, [loanOffers]);

  useEffect(() => {
    localStorage.setItem("loans", JSON.stringify(loans));
  }, [loans]);

  // Borrower requests a loan
  const requestLoan = (loanId, borrower) => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id === loanId) {
          const requests = loan.requests || [];
          const alreadyRequested = requests.some(req => req.borrowerName === borrower.name);
          if (!alreadyRequested) {
            const monthlyPayment = parseFloat(
              ((loan.amount * (1 + loan.interestRate / 100)) / loan.duration).toFixed(2)
            );
            const payments = Array.from({ length: loan.duration }, (_, i) => ({
              month: i + 1,
              amount: monthlyPayment,
              paid: false
            }));
            requests.push({
              borrowerName: borrower.name,
              status: "requested",
              payments
            });
          }
          return { ...loan, requests };
        }
        return loan;
      })
    );
  };

  return (
    <LoanContext.Provider
      value={{
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        loanOffers,
        setLoanOffers,
        loans,
        setLoans,
        requestLoan
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}
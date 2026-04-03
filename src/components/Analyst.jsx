import React, { useContext, useMemo, useState } from "react";
import { LoanContext } from "../LoanContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import "./Analyst.css";
import { useNavigate } from "react-router-dom";

export default function Analyst() {
  const navigate = useNavigate();

  const { loans } = useContext(LoanContext);

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");

  // --- Flatten all active agreements for display ---
  const flattenedAgreements = useMemo(() => {
    return loans.flatMap((loan) => {
      const activeRequests = loan.requests?.filter(
        (req) =>
          req.status === "approved" ||
          req.status === "requested" ||
          req.status === "completed"
      ) || [];

      if (activeRequests.length > 0) {
        return activeRequests.map((req) => ({
          id: loan.id,
          lender: loan.lender,
          amount: loan.amount,
          interestRate: loan.interestRate,
          duration: loan.duration,
          borrower: req.borrowerName,
          status: req.status,
          key: `${loan.id}-${req.borrowerName}`,
        }));
      }

      // Available offer with no requests
      if (loan.status === "available") {
        return [
          {
            id: loan.id,
            lender: loan.lender,
            amount: loan.amount,
            interestRate: loan.interestRate,
            duration: loan.duration,
            borrower: "-",
            status: "available",
            key: `${loan.id}-available`,
          },
        ];
      }
      return [];
    });
  }, [loans]);

  // --- Analytics summary ---
  const analytics = useMemo(() => {
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const avgInterestRate = loans.length
      ? (loans.reduce((sum, loan) => sum + (loan.interestRate || 0), 0) / loans.length).toFixed(2)
      : "0.00";
    const availableLoansCount = loans.filter((l) => l.status === "available").length;
    const activeAgreementsCount = flattenedAgreements.filter(
      (a) => a.status === "approved" || a.status === "requested"
    ).length;

    return {
      totalLoans,
      activeLoans: activeAgreementsCount,
      availableLoans: availableLoansCount,
      totalAmount,
      avgInterestRate,
    };
  }, [loans, flattenedAgreements]);

  // --- Status distribution (pie) ---
  const statusData = useMemo(() => {
    const counts = flattenedAgreements.reduce((acc, agreement) => {
      const s = agreement.status || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    loans.forEach((loan) => {
      if (loan.status === "available" && !loan.requests?.some((r) => r.status !== "rejected")) {
        counts.available = (counts.available || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [flattenedAgreements, loans]);

  // --- Top lenders bar chart ---
  const lenderBars = useMemo(() => {
    const map = {};
    loans.forEach((loan) => {
      const name = loan.lender || "Unknown";
      map[name] = (map[name] || 0) + (loan.amount || 0);
    });
    const arr = Object.entries(map).map(([name, total]) => ({ name, total }));
    arr.sort((a, b) => b.total - a.total);
    return arr.slice(0, 8);
  }, [loans]);

  // --- Filtered + sorted table ---
  const filteredLoans = useMemo(() => {
    let list = [...flattenedAgreements];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (l) =>
          String(l.lender || "").toLowerCase().includes(q) ||
          String(l.borrower || "").toLowerCase().includes(q) ||
          String(l.id || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      list = list.filter(
        (l) => (l.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    switch (sortKey) {
      case "highest":
        list.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        break;
      case "lowest":
        list.sort((a, b) => (a.amount || 0) - (b.amount || 0));
        break;
      case "interest":
        list.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
        break;
      default:
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [flattenedAgreements, query, statusFilter, sortKey]);

  // --- CSV Export ---
  const downloadCSV = (rows) => {
    if (!rows?.length) {
      alert("No rows to export.");
      return;
    }

    const header = [
      "LoanOfferID",
      "Lender",
      "Borrower",
      "Amount",
      "InterestRate",
      "Duration",
      "Status",
    ];
    const csvRows = [header.join(",")];

    rows.forEach((r) => {
      const wrap = (v) => `"${String(v).replace(/"/g, '""')}"`;
      const values = [
        r.id,
        wrap(r.lender || ""),
        wrap(r.borrower || ""),
        r.amount || 0,
        r.interestRate || 0,
        r.duration || 0,
        wrap(r.status || ""),
      ];
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loans_export_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const PIE_COLORS = ["#6a5acd", "#43a047", "#ffb300", "#e53935", "#9c27b0", "#607d8b"];

  return (
    <div className="analyst-root">
      <div className="analyst-inner">
       <header className="analyst-header">
  <div>
    <h2 className="section-title">Loan Analytics Dashboard</h2>
    <p className="subtitle">Snapshot & detailed view of system loans</p>
  </div>

  <div className="analyst-actions">
    {/* Export CSV button */}
    <button className="export-btn" onClick={() => downloadCSV(filteredLoans)}>
      Export visible CSV
    </button>

    {/* ⭐ New Home Button */}
    <button className="home-btn" onClick={() => navigate("/")}>
      🏠 Home
    </button>
  </div>
</header>


        {/* Stat cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Loan Offers</div>
            <div className="stat-value">{analytics.totalLoans}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Agreements</div>
            <div className="stat-value">{analytics.activeLoans}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Available Offers</div>
            <div className="stat-value">{analytics.availableLoans}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Offered Amount</div>
            <div className="stat-value">₹{analytics.totalAmount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Avg Interest</div>
            <div className="stat-value">{analytics.avgInterestRate}%</div>
          </div>
        </div>

        {/* Charts + Filters */}
        <div className="charts-filters">
          <div className="charts">
            <div className="chart-card">
              <h4 className="chart-title">Agreement/Offer Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={35}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h4 className="chart-title">Top Lenders by Offer Amount</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={lenderBars}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Amount" fill="#6a5acd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="filters-card">
            <div className="filter-row">
              <input
                type="text"
                placeholder="Search lender/borrower/id..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-row">
              <label>
                Status:
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>available</option>
                  <option>requested</option>
                  <option>approved</option>
                  <option>completed</option>
                  <option>rejected</option>
                </select>
              </label>

              <label>
                Sort:
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                  <option value="interest">Highest Interest</option>
                </select>
              </label>
            </div>

            <div className="filter-hint">
              Showing <strong>{filteredLoans.length}</strong> rows.
            </div>
          </div>
        </div>

        {/* Loans table */}
        <div className="loans-table-container">
          <h3 className="table-title">Detailed Loan Information</h3>
          <div className="loans-table">
            <table>
              <thead>
                <tr>
                  <th>Offer ID</th>
                  <th>Lender</th>
                  <th>Borrower</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.key || `${loan.id}-${loan.borrower}`}>
                    <td>{loan.id}</td>
                    <td>{loan.lender}</td>
                    <td>{loan.borrower}</td>
                    <td>₹{loan.amount}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.duration}m</td>
                    <td>
                      <span className={`status-badge ${loan.status}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLoans.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      No loans match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

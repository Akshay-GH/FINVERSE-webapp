import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lodder } from "../Components/Lodder";

const STATUS_STYLES = {
  approved: "bg-emerald-100 text-emerald-700",
  pending_otp: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700",
  failed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS = {
  approved: "Completed",
  pending_otp: "Pending OTP",
  blocked: "Blocked",
  failed: "Failed",
};

export function TransactionHistory() {
  const API_BASE = "http://localhost:3000/api/v1";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, [token, navigate]);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (filter !== "all") {
          params.set("type", filter);
        }

        const response = await fetch(
          `${API_BASE}/transactions/history?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load transactions");
        }

        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : [],
        );
        setTotal(data.total ?? 0);
      } catch (err) {
        setError(err.message || "Unable to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [page, filter, limit]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-surface)]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Transactions
            </p>
            <h1 className="text-2xl font-semibold text-[var(--brand-deep)]">
              Transaction History
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        <section className="surface-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--brand-deep)]">
                Activity log
              </h2>
              <p className="text-sm text-slate-500">
                Track every credit and debit in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Filter
              </span>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
              >
                <option value="all">All transactions</option>
                <option value="credit">Credits only</option>
                <option value="debit">Debits only</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <Lodder label="Loading transactions" />
            ) : error ? (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
                No transactions found.
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const statusLabel =
                    STATUS_LABELS[transaction.status] || transaction.status;
                  const statusClass =
                    STATUS_STYLES[transaction.status] ||
                    "bg-slate-100 text-slate-600";
                  const isCredit = transaction.direction === "credit";

                  return (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-slate-800">
                          {transaction.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          From {transaction.sender.name || "Unknown"} (
                          {transaction.sender.email || "N/A"})
                        </div>
                        <div className="text-xs text-slate-500">
                          To {transaction.receiver.name || "Unknown"} (
                          {transaction.receiver.email || "N/A"})
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 text-left md:items-end md:text-right">
                        <div
                          className={`text-lg font-semibold ${
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isCredit ? "+" : "-"} Rs {transaction.amount}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {transaction.fraudStatus || "Fraud check"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-slate-600 md:flex-row">
            <p>
              Page {page} of {totalPages} • {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-60"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </button>
              <button
                className="btn-primary px-4 py-2 text-xs font-semibold disabled:opacity-60"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

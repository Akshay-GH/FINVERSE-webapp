import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { LogOut } from "lucide-react";
import { UserComponent } from "../Components/UserComponent";
import { Lodder } from "../Components/Lodder";

export function Dashboard() {
  // const API_BASE = "https://finverse-webapp.onrender.com/api/v1";
  const API_BASE = "http://localhost:3000/api/v1";
  const [balance, setBalance] = useState(0);
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token")?.split(" ")[1];

  const fullName = useMemo(() => {
    if (!token) return "";
    try {
      const { firstName, lastName } = jwtDecode(token);
      return `${firstName} ${lastName}`;
    } catch (e) {
      console.error("Invalid token:", e);
      return "";
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, [token, navigate]);

  // Fetch balance
  useEffect(() => {
    const loadBalance = async () => {
      setBalanceLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/accounts/balance`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          throw new Error("Insufficient Balance");
        }
        const data = await res.json();
        setBalance(data.balance ?? 0);
      } catch (err) {
        setError(err.message || "Balance fetch failed.");
      } finally {
        setBalanceLoading(false);
      }
    };
    loadBalance();
  }, []);

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/users/bulk/?filter=${filter}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          throw new Error("Unable to load users right now.");
        }
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Users fetch failed.");
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, [filter]);

  return (
    <div className="min-h-screen bg-[var(--brand-surface)]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-[var(--brand-deep)]">
              Finverse
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/transactions"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Transaction history
            </Link>
            <div className="relative flex items-center gap-3">
              <p className="hidden text-sm font-semibold text-slate-600 md:block">
                Hello, {fullName || "Guest"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
              >
                {fullName[0]?.toUpperCase() || "G"}
              </button>
              <div
                className={`absolute right-0 top-12 transform transition-all duration-300 ${
                  open
                    ? "opacity-100 translate-y-0"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        <section className="surface-card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Your balance</p>
            {balanceLoading ? (
              <div className="mt-3">
                <Lodder label="Loading balance" />
              </div>
            ) : (
              <p className="mt-2 text-3xl font-semibold text-[var(--brand-deep)]">
                Rs {balance}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-[var(--brand-soft)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary-ink)]">
              Insights
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Keep transfers under control with real-time updates.
            </p>
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--brand-deep)]">
                Send money
              </h2>
              <p className="text-sm text-slate-500">
                Search by name to transfer instantly.
              </p>
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30 md:w-80"
              type="text"
              placeholder="Search users..."
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {error && (
            <div
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mt-6 space-y-3">
            {usersLoading ? (
              <Lodder label="Loading users" />
            ) : users.length === 0 ? (
              <p className="text-sm text-slate-500">
                No users found. Try another search.
              </p>
            ) : (
              users.map((user, index) => (
                <UserComponent
                  key={index}
                  name={`${user.firstName} ${user.lastName}`}
                  Id={user.userId}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

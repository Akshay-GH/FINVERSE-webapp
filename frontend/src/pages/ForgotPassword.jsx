import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TopNav } from "../Components/TopNav";
import { Lodder } from "../Components/Lodder";

export function ForgotPassword() {
  const API_BASE = "https://finverse-webapp.onrender.com/api/v1";
  // const API_BASE = "http://localhost:3000/api/v1";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/forgot-password`, {
        method: "POST",
        body: JSON.stringify({ username: email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Unable to process request.");
        return;
      }

      setMessage(
        data.message ||
          "If an account exists for this email, an OTP has been sent.",
      );
      const encodedEmail = encodeURIComponent(email);
      navigate(`/reset-password?email=${encodedEmail}`);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-surface)]">
      <TopNav />
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <span className="section-chip inline-flex px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Reset access
          </span>
          <h1 className="text-3xl font-semibold text-[var(--brand-deep)] md:text-4xl">
            Forgot your password? We will send a one-time code.
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Enter your email to receive a 6-digit OTP. It expires in 10 minutes.
          </p>
          <div className="surface-card p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Security tips</p>
            <ul className="mt-3 space-y-2">
              <li>Never share your OTP with anyone.</li>
              <li>Only enter it on the Finverse reset screen.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-[var(--brand-deep)]">
              Request OTP
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              We will email a reset code if your account exists.
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
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

          {message && (
            <div
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              role="status"
            >
              {message}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending OTP" : "Send OTP"}
            </button>
            {loading && <Lodder label="Sending reset code" />}
            <p className="text-center text-sm text-slate-600">
              Remembered your password?{" "}
              <Link to="/signin" className="font-semibold text-sky-600">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

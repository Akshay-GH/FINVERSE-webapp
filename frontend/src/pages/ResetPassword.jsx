import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { TopNav } from "../Components/TopNav";
import { Lodder } from "../Components/Lodder";

export function ResetPassword() {
  const API_BASE = "https://finverse-webapp.onrender.com/api/v1";
  // const API_BASE = "http://localhost:3000/api/v1";
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  }, [location.search]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ username: email, otp }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Unable to verify OTP.");
        return;
      }

      setVerified(true);
      setMessage(data.message || "OTP verified. Set a new password.");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: "POST",
        body: JSON.stringify({ username: email, otp, newPassword }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Unable to reset password.");
        return;
      }

      setMessage("Password reset successful. Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 1200);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
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
        setError(data.error || data.message || "Unable to resend OTP.");
        return;
      }

      setCooldown(60);
      setMessage(
        data.message || "If an account exists, a new OTP has been sent.",
      );
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
            Verify access
          </span>
          <h1 className="text-3xl font-semibold text-[var(--brand-deep)] md:text-4xl">
            Confirm the OTP and set a new password.
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Enter the code from your email. Once verified, you can set a new
            password.
          </p>
          <div className="surface-card p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Need a new code?</p>
            <p className="mt-2">
              Resend is available every 60 seconds for your security.
            </p>
          </div>
        </div>

        <form className="surface-card p-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-[var(--brand-deep)]">
              Reset password
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Verify your OTP to continue.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
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
            <div>
              <label className="text-sm font-semibold text-slate-700">
                OTP
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                New password
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={!verified}
                required
              />
            </div>
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
              className="btn-secondary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              onClick={handleVerify}
              disabled={loading || !email || !otp}
              type="button"
            >
              {loading ? "Verifying" : verified ? "OTP verified" : "Verify OTP"}
            </button>
            <button
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              onClick={handleReset}
              disabled={loading || !verified || !newPassword}
              type="button"
            >
              {loading ? "Resetting" : "Set new password"}
            </button>
            {loading && <Lodder label="Processing" />}
            <button
              className="text-sm font-semibold text-sky-600 disabled:text-slate-400"
              type="button"
              onClick={handleResend}
              disabled={loading || cooldown > 0 || !email}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
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

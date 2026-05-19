import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaymentSuccessPopup from "../Components/PaymentSuccessful";
import { Lodder } from "../Components/Lodder";

export function SendMoney() {
  const API_BASE = "https://finverse-webapp.onrender.com/api/v1";
  // const API_BASE = "http://localhost:3000/api/v1";
  const [amount, setAmount] = useState(0);
  const { to, name } = useParams();
  const [showpopUp, setPopUp] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const getDeviceId = () => {
    const stored = localStorage.getItem("deviceId");
    if (stored) return stored;
    const created = crypto?.randomUUID
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("deviceId", created);
    return created;
  };

  const handleTransfer = async () => {
    // Validate amount
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount greater than Rs 0.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${API_BASE}/accounts/transfer`, {
        method: "POST",
        body: JSON.stringify({ to, amount: Number(amount), deviceId }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to process the transfer.");
        return;
      }

      if (data.status === "otp_required") {
        setOtpRequired(true);
        setTransactionId(data.transactionId || "");
        setMessage("OTP sent to your email. Verify to complete transfer.");
        return;
      }

      document.getElementById("amount").value = "";
      setPopUp(() => true);
    } catch (error) {
      console.error("Transfer error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !transactionId) {
      setError("Enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/accounts/transfer/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ transactionId, otp }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to verify OTP.");
        return;
      }

      setOtpRequired(false);
      setOtp("");
      document.getElementById("amount").value = "";
      setPopUp(() => true);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!transactionId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/accounts/transfer/resend-otp`, {
        method: "POST",
        body: JSON.stringify({ transactionId }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to resend OTP.");
        return;
      }

      setCooldown(60);
      setMessage("OTP resent. Check your email.");
    } catch (error) {
      console.error("OTP resend error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-surface)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-12">
        <div className="surface-card w-full max-w-xl p-8">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Transfer
            </p>
            <h1 className="text-2xl font-semibold text-[var(--brand-deep)]">
              Send money
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Confirm recipient and enter the amount.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-base font-semibold text-[var(--brand-primary-ink)]">
                {name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">UPI recipient</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Amount in Rs
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                type="number"
                id="amount"
                placeholder="Enter amount"
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                {message}
              </div>
            )}

            {otpRequired && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
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
                  />
                </div>
                <button
                  className="btn-secondary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying" : "Verify OTP"}
                </button>
                <button
                  className="text-sm font-semibold text-sky-600 disabled:text-slate-400"
                  onClick={handleResendOtp}
                  disabled={loading || cooldown > 0}
                  type="button"
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            )}

            <button
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              onClick={handleTransfer}
              disabled={loading || otpRequired}
            >
              {loading ? "Processing" : "Initiate transfer"}
            </button>
            {loading && <Lodder label="Processing transfer" />}
          </div>
        </div>
      </div>

      {showpopUp && (
        <PaymentSuccessPopup
          amount={amount}
          onClose={() => {
            setPopUp(false);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
}

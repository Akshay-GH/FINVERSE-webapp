import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lodder } from "../Components/Lodder";
import { TopNav } from "../Components/TopNav";

export function SignupPage() {
  const API_BASE = "https://finverse-webapp.onrender.com/api/v1";
  // const API_BASE = "http://localhost:3000/api/v1";
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorBody, setErrorBody] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorBody("");

    try {
      const response = await fetch(`${API_BASE}/users/signup`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorBody(
          data.message || data.error || "Unable to create your account.",
        );
        setLoading(false);
        return;
      }

      navigate("/signin");
    } catch (error) {
      setErrorBody("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-surface)]">
      <TopNav />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <span className="section-chip inline-flex px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Get started
          </span>
          <h1 className="text-3xl font-semibold text-[var(--brand-deep)] md:text-4xl">
            Create your Finverse account and start moving money smarter.
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            Open a secure wallet in minutes and enjoy a clean Paytm-inspired
            experience for every transfer.
          </p>
          <div className="surface-card p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Why Finverse?</p>
            <ul className="mt-3 space-y-2">
              <li>Instant transfers with live balance updates.</li>
              <li>Personalized dashboard to track every move.</li>
              <li>Trusted, token-secured access.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-[var(--brand-deep)]">
              Sign up
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Enter your details to create an account.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                First name
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                type="text"
                placeholder="Asha"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Last name
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                type="text"
                placeholder="Kapoor"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                type="email"
                placeholder="you@example.com"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {errorBody && (
            <div
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {errorBody}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account" : "Create account"}
            </button>
            {loading && <Lodder label="Creating your account" />}
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
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

import { Link } from "react-router-dom";

export function TopNav({ showCta = false }) {
  return (
    <nav className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold text-[var(--brand-deep)]"
        >
          <span className="h-3 w-3 rounded-full bg-[var(--brand-primary)]"></span>
          Finverse
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <Link to="/" className="hover:text-[var(--brand-deep)]">
            Home
          </Link>
          <Link to="/signin" className="hover:text-[var(--brand-deep)]">
            Sign in
          </Link>
          <Link to="/signup" className="hover:text-[var(--brand-deep)]">
            Create account
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {showCta ? (
            <>
              <Link
                to="/signin"
                className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn-primary inline-flex items-center justify-center px-5 py-2 text-sm font-semibold"
              >
                Get started
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Back to home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

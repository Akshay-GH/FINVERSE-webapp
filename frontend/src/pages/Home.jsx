import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Wallet, Banknote } from "lucide-react";
import { TopNav } from "../Components/TopNav";

export function Home() {
  return (
    <div className="min-h-screen bg-[var(--brand-surface)]">
      <TopNav showCta />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[var(--brand-primary)]/20 blur-[120px]"></div>
        <div className="pointer-events-none absolute left-0 top-40 h-96 w-96 rounded-full bg-blue-200/40 blur-[140px]"></div>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 pt-14 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <span className="section-chip inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              Pay smart with Finverse
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-[var(--brand-deep)] md:text-5xl">
              Instant transfers, clean tracking, and a modern wallet you can
              trust.
            </h1>
            <p className="max-w-xl text-lg text-[var(--text-muted)]">
              Send money in seconds, keep balances up to date, and get a clean
              overview of your spending—all in one Paytm-inspired experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary px-6 py-3 text-sm">
                Create free account
              </Link>
              <Link
                to="/signin"
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm font-semibold"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                Bank-grade security
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[var(--brand-primary)]" />
                Smart balance tracking
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="surface-card relative overflow-hidden p-6 md:p-8">
              <div className="absolute right-6 top-6 h-12 w-12 rounded-full bg-[var(--brand-primary)]/20"></div>
              <p className="text-sm font-semibold text-slate-500">
                Available balance
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--brand-deep)]">
                Rs 8,240.50
              </p>
              <div className="mt-8 grid gap-4">
                {[
                  {
                    title: "Transfer to Raj",
                    amount: "- Rs 1,250",
                    label: "UPI transfer",
                  },
                  {
                    title: "Wallet top-up",
                    amount: "+ Rs 3,500",
                    label: "Auto reload",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.amount}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between rounded-xl bg-[var(--brand-soft)] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary-ink)]">
                    Smart insights
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    You saved Rs 1,320 this month
                  </p>
                </div>
                <Banknote className="h-6 w-6 text-[var(--brand-primary)]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Instant payouts",
                copy: "Transfer to friends, vendors, and teams in seconds with zero confusion.",
              },
              {
                title: "Unified dashboard",
                copy: "Keep tabs on your balance, recipients, and transfers from one view.",
              },
              {
                title: "Security-first",
                copy: "Token-based authentication and proactive checks keep every move protected.",
              },
            ].map((feature) => (
              <div key={feature.title} className="surface-card p-6">
                <h3 className="text-lg font-semibold text-[var(--brand-deep)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {feature.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="surface-card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-primary-ink)]">
                Ready to move faster?
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--brand-deep)]">
                Open your Finverse wallet in under two minutes.
              </h2>
            </div>
            <Link to="/signup" className="btn-primary px-6 py-3 text-sm">
              Get started
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

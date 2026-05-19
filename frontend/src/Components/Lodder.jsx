export function Lodder({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--brand-primary)]"></span>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
}

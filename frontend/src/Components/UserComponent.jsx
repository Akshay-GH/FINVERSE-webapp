import { useNavigate } from "react-router-dom";

export function UserComponent({ name, Id }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/send/${Id}/${name}`);
  };
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-primary-ink)]">
          {name[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">Finverse user</p>
        </div>
      </div>
      <button
        className="btn-primary px-4 py-2 text-xs font-semibold"
        onClick={handleClick}
      >
        Send money
      </button>
    </div>
  );
}

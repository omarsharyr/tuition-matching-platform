import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ brand = "Tuition Match", items = [], footer }) {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-4 border-b font-semibold">{brand}</div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(({ label, to, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                ${active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {Icon ? <Icon size={18} /> : null}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {footer}
    </aside>
  );
}

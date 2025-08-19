import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardFrame from "../../components/DashboardFrame";
import { LayoutDashboard, Users2, ClipboardList, FileText, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const items = [
    { label: "Dashboard", to: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", to: "/dashboard/admin/users", icon: Users2 },
    { label: "Posts", to: "/dashboard/admin/posts", icon: ClipboardList },
    { label: "Applications", to: "/dashboard/admin/applications", icon: FileText },
  ];

  const footer = (
    <button
      onClick={() => { localStorage.clear(); window.location.href = "/"; }}
      className="m-3 flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl"
    >
      <LogOut size={18} /> Logout
    </button>
  );

  return (
    <DashboardFrame
      sidebar={<Sidebar brand="Admin" items={items} footer={footer} />}
      title="Admin Dashboard"
    >
      <Outlet />
    </DashboardFrame>
  );
}

import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardFrame from "../../components/DashboardFrame";
import { ClipboardList, FileText, MessagesSquare, UserRound, LogOut } from "lucide-react";

export default function StudentDashboard() {
  const items = [
    { label: "My Posts", to: "/dashboard/student/posts", icon: ClipboardList },
    { label: "Applications", to: "/dashboard/student/applications", icon: FileText },
    { label: "Messages", to: "/dashboard/student/messages", icon: MessagesSquare },
    { label: "Profile", to: "/dashboard/student/profile", icon: UserRound },
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
      sidebar={<Sidebar brand="Student" items={items} footer={footer} />}
      title="Student Dashboard"
    >
      <Outlet />
    </DashboardFrame>
  );
}

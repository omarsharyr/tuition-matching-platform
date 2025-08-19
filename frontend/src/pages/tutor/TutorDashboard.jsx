import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardFrame from "../../components/DashboardFrame";
import { Briefcase, FileText, MessagesSquare, UserRound, LogOut } from "lucide-react";

export default function TutorDashboard() {
  const items = [
    { label: "Job Board", to: "/dashboard/tutor/jobs", icon: Briefcase },
    { label: "My Applications", to: "/dashboard/tutor/applications", icon: FileText },
    { label: "Messages", to: "/dashboard/tutor/messages", icon: MessagesSquare },
    { label: "Profile", to: "/dashboard/tutor/profile", icon: UserRound },
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
      sidebar={<Sidebar brand="Tutor" items={items} footer={footer} />}
      title="Tutor Dashboard"
    >
      <Outlet />
    </DashboardFrame>
  );
}

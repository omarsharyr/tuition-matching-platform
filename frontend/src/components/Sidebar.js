import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/DashboardLayout.css";

const linksByRole = {
  student: [
    { to: "/student/dashboard", label: "Overview" },
    { to: "/student/jobs", label: "My Jobs" },
    { to: "/student/post", label: "Post Job" },
    { to: "/student/applications", label: "Applications" },
    { to: "/chat", label: "Chat" },
    { to: "/student/reviews", label: "Reviews" },
    { to: "/profile", label: "Profile" },
  ],
  tutor: [
    { to: "/tutor/dashboard", label: "Overview" },
    { to: "/tutor/jobs", label: "Job Board" },
    { to: "/tutor/applications", label: "My Applications" },
    { to: "/chat", label: "Chat" },
    { to: "/profile", label: "Profile" },
  ],
  admin: [
    { to: "/dashboard/admin", label: "Overview" },
    { to: "/admin/verification", label: "Verification" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/jobs", label: "Jobs" },
    { to: "/admin/applications", label: "Applications" },
    { to: "/admin/reviews", label: "Reviews" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/settings", label: "Settings" },
  ],
};

export default function Sidebar({ role = "tutor" }) {
  const links = linksByRole[role] || linksByRole.tutor;
  return (
    <aside className="dash-sidebar" aria-label="Sidebar">
      <nav>
        <ul className="dash-side-list">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  "dash-side-link" + (isActive ? " is-active" : "")
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

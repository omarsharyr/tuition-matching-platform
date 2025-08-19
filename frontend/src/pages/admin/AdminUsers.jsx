import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [pending, setPending] = useState([]);

  const load = () => api.get("/admin/users/pending").then(r => setPending(r.data));
  useEffect(() => { load(); }, []);

  const verify = (id, status) =>
    api.patch(`/admin/users/${id}/verify`, { status }).then(load);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Users (Pending Verification)</h2>
      <table className="w-full text-sm bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <thead className="text-left text-gray-500">
          <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody>
          {pending.map(u => (
            <tr key={u._id} className="border-t">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">
                <button onClick={() => verify(u._id, "VERIFIED")} className="h-8 px-3 rounded-xl bg-gray-900 text-white text-xs mr-2">Approve</button>
                <button onClick={() => verify(u._id, "REJECTED")} className="h-8 px-3 rounded-xl border text-xs">Reject</button>
              </td>
            </tr>
          ))}
          {!pending.length && <tr><td className="p-3 text-gray-500" colSpan={4}>No pending users.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

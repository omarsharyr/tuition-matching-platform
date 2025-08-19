import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function MyApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    api.get("/applications/my").then(res => setApps(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">My Applications</h2>
      <table className="w-full text-sm bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <thead className="text-left text-gray-500">
          <tr><th className="p-3">Post</th><th className="p-3">Status</th><th className="p-3">Updated</th></tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a._id} className="border-t">
              <td className="p-3">{a.post?.classLevel} • {a.post?.subjects?.join(", ")}</td>
              <td className="p-3">{a.status}</td>
              <td className="p-3">{new Date(a.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function StudentApplications() {
  const [postId, setPostId] = useState(""); // choose a post to view apps for
  const [apps, setApps] = useState([]);

  const load = () => postId && api.get(`/applications/post/${postId}`).then(r => setApps(r.data));

  useEffect(() => { load(); }, [postId]);

  const act = (id, action) =>
    api.patch(`/applications/${id}/${action}`).then(load);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Tutor Applications</h2>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Enter Post ID to load applications"
          value={postId}
          onChange={e => setPostId(e.target.value)}
          className="h-10 px-3 rounded-xl border border-gray-200 w-96"
        />
        <button onClick={load} className="h-10 px-3 rounded-xl bg-gray-900 text-white text-sm">Load</button>
      </div>

      <table className="w-full text-sm bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <thead className="text-left text-gray-500">
          <tr><th className="p-3">Tutor</th><th className="p-3">Pitch</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a._id} className="border-t">
              <td className="p-3">{a.tutor?.name || a.tutor?._id}</td>
              <td className="p-3">{a.pitch}</td>
              <td className="p-3">{a.status}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button onClick={() => act(a._id, "shortlist")} className="h-8 px-3 rounded-xl border text-xs">Shortlist</button>
                  <button onClick={() => act(a._id, "select")} className="h-8 px-3 rounded-xl bg-gray-900 text-white text-xs">Select</button>
                  <button onClick={() => act(a._id, "reject")} className="h-8 px-3 rounded-xl border text-xs">Reject</button>
                </div>
              </td>
            </tr>
          ))}
          {!apps.length && (
            <tr><td className="p-3 text-gray-500" colSpan={4}>No applications.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

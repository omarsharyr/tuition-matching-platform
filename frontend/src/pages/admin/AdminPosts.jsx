import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);

  const load = () => api.get("/student/posts/browse").then(r => setPosts(r.data));
  useEffect(() => { load(); }, []);

  const del = (id) =>
    window.confirm("Delete post and all related applications?")
      && api.delete(`/admin/posts/${id}`).then(load);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Manage Tuition Posts</h2>
      <table className="w-full text-sm bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <thead className="text-left text-gray-500">
          <tr><th className="p-3">Post</th><th className="p-3">Location</th><th className="p-3">Payment</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p._id} className="border-t">
              <td className="p-3">{p.classLevel} • {p.subjects?.join(", ")}</td>
              <td className="p-3">{p.location}</td>
              <td className="p-3">{p.payment} BDT</td>
              <td className="p-3">
                <button onClick={() => del(p._id)} className="h-8 px-3 rounded-xl border text-xs text-red-600">Delete</button>
              </td>
            </tr>
          ))}
          {!posts.length && <tr><td className="p-3 text-gray-500" colSpan={4}>No posts.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function JobBoard() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Example browse API (adjust if different):
    api.get("/student/posts/browse").then(res => setPosts(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Browse Tuition Jobs</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(p => (
          <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="font-medium text-gray-900">{p.classLevel} • {p.subjects?.join(", ")}</div>
            <div className="text-sm text-gray-500 mt-1">{p.location} • {p.schedule} • {p.payment} BDT</div>
            <button
              onClick={() => api.post("/applications", { postId: p._id, pitch: "I am interested!" })}
              className="mt-3 h-9 px-3 rounded-xl bg-gray-900 text-white text-sm"
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

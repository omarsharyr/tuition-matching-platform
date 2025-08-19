import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);

  const load = () => api.get("/student/posts/my").then(r => setPosts(r.data));
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">My Posts</h2>
      <button
        onClick={() =>
          api.post("/student/posts", {
            classLevel: "Class 7",
            subjects: ["Bangla"],
            location: "Mirpur",
            schedule: "2 days/week",
            payment: 4500,
          }).then(load)
        }
        className="mb-4 h-9 px-3 rounded-xl bg-gray-900 text-white text-sm"
      >
        + Create Post (demo)
      </button>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(p => (
          <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="font-medium text-gray-900">{p.classLevel} • {p.subjects?.join(", ")}</div>
            <div className="text-sm text-gray-500 mt-1">{p.location} • {p.schedule} • {p.payment} BDT</div>
          </div>
        ))}
      </div>
    </div>
  );
}

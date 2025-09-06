// frontend/src/pages/student/TuitionPostForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function TuitionPostForm() {
  const { id } = useParams(); // if present => edit mode
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    classLevel: "",
    subjects: "",
    location: "",
    preferredGender: "Any",
    daysPerWeek: 3,
    timeSlots: "",
    expectedPayment: "",
    notes: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const { data } = await api.get("/student/posts");
      const item = (data || []).find((x) => x._id === id);
      if (item) {
        setForm({
          title: item.title || "",
          classLevel: item.classLevel || "",
          subjects: (item.subjects || []).join(", "),
          location: item.location || "",
          preferredGender: item.preferredGender || "Any",
          daysPerWeek: item.daysPerWeek || 3,
          timeSlots: item.timeSlots || "",
          expectedPayment: item.expectedPayment || "",
          notes: item.notes || "",
        });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load post");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        expectedPayment: Number(form.expectedPayment || 0),
        daysPerWeek: Number(form.daysPerWeek || 3),
      };
      if (id) {
        await api.put(`/student/posts/${id}`, payload);
      } else {
        await api.post("/student/posts", payload);
      }
      navigate("/student/dashboard", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">{id ? "Edit Tuition Post" : "Create Tuition Post"}</h2>
        {err && <div className="alert alert-danger">{err}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-control" name="title" value={form.title} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Class Level</label>
            <input className="form-control" name="classLevel" value={form.classLevel} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Subjects (comma separated)</label>
            <input className="form-control" name="subjects" value={form.subjects} onChange={onChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-control" name="location" value={form.location} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Tutor Gender</label>
            <select className="form-control" name="preferredGender" value={form.preferredGender} onChange={onChange}>
              <option>Any</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Days per week</label>
            <input className="form-control" type="number" min="1" max="7" name="daysPerWeek" value={form.daysPerWeek} onChange={onChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Time Slots</label>
            <input className="form-control" name="timeSlots" value={form.timeSlots} onChange={onChange} placeholder="Sat/Mon/Wed | 5-7pm" />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Payment</label>
            <input className="form-control" type="number" name="expectedPayment" value={form.expectedPayment} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" name="notes" value={form.notes} onChange={onChange} />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button className="btn" type="button" onClick={() => window.history.back()} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

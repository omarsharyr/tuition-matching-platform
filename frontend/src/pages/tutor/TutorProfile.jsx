export default function TutorProfile() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Full Name" />
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="University" />
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Subjects" />
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Location" />
      </div>
    </div>
  );
}

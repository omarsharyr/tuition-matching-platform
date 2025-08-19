export default function StudentProfile() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Full Name" />
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Phone" />
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Location" />
        <input className="h-10 px-3 rounded-xl border border-gray-200" placeholder="Preferred Subjects" />
      </div>
    </div>
  );
}

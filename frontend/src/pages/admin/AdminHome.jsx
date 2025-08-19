export default function AdminHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-bold">7</div>
          <div className="text-sm text-gray-500">Pending Verifications</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-bold">1,248</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-bold">92</div>
          <div className="text-sm text-gray-500">Active Posts</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-2xl font-bold">34</div>
          <div className="text-sm text-gray-500">Apps Today</div>
        </div>
      </div>
    </div>
  );
}

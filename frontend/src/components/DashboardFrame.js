export default function DashboardFrame({ sidebar, children, title }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {sidebar}
        <div className="flex-1 min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-100 px-5 py-3">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </header>
          <main className="p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}

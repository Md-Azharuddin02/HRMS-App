function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>

        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map((_,i)=>(
          <div key={i} className="p-6 border rounded-xl">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">

        <div className="border rounded-xl p-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>

        <div className="border rounded-xl p-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>

      </div>

      {/* Table / Activity */}
      <div className="border rounded-xl p-6">
        <div className="h-4 w-40 bg-gray-200 rounded mb-6"></div>

        {[1,2,3,4].map((_,i)=>(
          <div key={i} className="flex justify-between mb-4">
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default DashboardSkeleton;
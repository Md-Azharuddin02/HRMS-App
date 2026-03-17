function EmployeesSkeleton() {
  const rows = Array(5).fill(0);

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4">CODE</th>
              <th className="p-4">NAME</th>
              <th className="p-4">EMAIL</th>
              <th className="p-4">DEPARTMENT</th>
              <th className="p-4">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((_, index) => (
              <tr key={index} className="border-t">
                
                <td className="p-4">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </td>

                <td className="p-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </td>

                <td className="p-4">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </td>

                <td className="p-4">
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </td>

                <td className="p-4">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default EmployeesSkeleton;
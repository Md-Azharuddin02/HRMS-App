import { useEffect } from "react";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import { Users, AlertCircle } from "lucide-react";
import { useApp } from "../store/AppContext";

function Employees() {
  const { employees, loading, error, fetchEmployees } = useApp();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div className="flex items-center gap-3">
        <Users className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Employee Management
          </h1>
          <p className="text-sm text-gray-500">
            Add, manage and monitor employee records
          </p>
        </div>
      </div>

      <div className="bg-white border shadow-lg rounded-3xl p-6">
        <EmployeeForm refresh={fetchEmployees} />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <EmployeeList employees={employees} refresh={fetchEmployees} />
      )}
    </div>
  );
}

export default Employees;

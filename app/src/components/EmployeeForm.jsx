import { useState, useCallback, memo, useEffect } from "react";
import API from "../api/api";
import { UserPlus, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function EmployeeForm({ refresh }) {
  const initialState = {
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  };

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.employee_id.trim())
      newErrors.employee_id = "Employee code is required.";

    if (!form.full_name.trim())
      newErrors.full_name = "Full name is required.";

    if (!form.department.trim())
      newErrors.department = "Department is required.";

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format.";
    }

    return newErrors;
  }, [form]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await API.post("/employees/", {
        ...form,
        employee_id: form.employee_id.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
      });

      setForm(initialState);
      setSuccess(true);
      refresh();

    } catch (err) {
      if (err.response?.status === 409) {
        setServerError("Employee ID or Email already exists.");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="w-full">
      <div className="bg-white border border-slate-200 shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Add Employee
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Register a new employee
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <InputField
              label="Employee Code"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              error={errors.employee_id}
            />

            <InputField
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              error={errors.full_name}
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <InputField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              error={errors.department}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="text-sm sm:text-base">Processing...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Add Employee</span>
              </>
            )}
          </button>

          {serverError && (
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="flex-1">{serverError}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 bg-green-50 border border-green-200 text-green-700 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="flex-1">Employee added successfully.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const InputField = memo(function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
}) {
  return (
    <div className="flex flex-col space-y-1.5 sm:space-y-2">
      <label className="text-xs sm:text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base
        ${
          error
            ? "border-red-400 focus:ring-red-400 bg-red-50"
            : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400"
        }`}
      />

      {error && (
        <span className="text-xs text-red-600 font-medium">{error}</span>
      )}
    </div>
  );
});

export default memo(EmployeeForm);
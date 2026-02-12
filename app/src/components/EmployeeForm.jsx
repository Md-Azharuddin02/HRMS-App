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

  /* ================= VALIDATION ================= */

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

  /* ================= HANDLERS ================= */

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

  /* Auto hide success message */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Add Employee
              </h2>
              <p className="text-sm text-slate-500">
                Register a new employee
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-5">

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
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Employee
              </>
            )}
          </button>

          {serverError && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {serverError}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4" />
              Employee added successfully.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */

const InputField = memo(function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-slate-600">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition text-sm
        ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-slate-300 focus:ring-indigo-500"
        }`}
      />

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
});

export default memo(EmployeeForm);

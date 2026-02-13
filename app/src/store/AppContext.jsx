import { createContext, useContext, useState, useCallback } from "react";
import API from "../api/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/employees/");
      setEmployees(res.data);
    } catch {
      setError("Failed to fetch employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        employees,
        loading,
        error,
        fetchEmployees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
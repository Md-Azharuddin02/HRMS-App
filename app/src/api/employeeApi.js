
import API from "../api/api";

 const updateEmployee = (id, data) => {
  return API.put(`/employees/${id}`, data);
};
export default updateEmployee;
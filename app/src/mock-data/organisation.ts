import type { AppSettings, Department, Employee, RolePermissions } from "../types";

export const departments: Department[] = [
  { id: "DEP-DEV", name: "Development", code: "DEV", description: "Builds and maintains the product platform, APIs and web clients.", headId: "EMP-003", color: "#2563eb" },
  { id: "DEP-QA", name: "Testing / QA", code: "QA", description: "Owns test plans, regression suites and release sign-off.", headId: "EMP-009", color: "#0d9488" },
  { id: "DEP-DES", name: "Design", code: "DES", description: "Product design, research and brand assets.", headId: "EMP-013", color: "#d97706" },
  { id: "DEP-MKT", name: "Marketing", code: "MKT", description: "Campaigns, content, SEO and paid acquisition.", headId: "EMP-017", color: "#db2777" },
  { id: "DEP-HR", name: "HR", code: "HR", description: "People operations, hiring, payroll inputs and policy.", headId: "EMP-004", color: "#7c3aed" },
];

type Row = [id: string, first: string, last: string, dept: string, designation: string, joined: string, role: Employee["role"], status?: Employee["status"]];

const rows: Row[] = [
  ["EMP-001", "Arjun", "Mehta", "DEP-DEV", "Chief Technology Officer", "2019-04-01", "super_admin"],
  ["EMP-002", "Priya", "Sharma", "DEP-HR", "Operations Manager", "2020-01-15", "admin"],
  ["EMP-003", "Rahul", "Verma", "DEP-DEV", "Engineering Lead", "2020-06-08", "department_head"],
  ["EMP-004", "Sneha", "Iyer", "DEP-HR", "HR Manager", "2020-09-21", "hr"],
  ["EMP-005", "Karan", "Patel", "DEP-DEV", "Frontend Developer", "2022-02-14", "employee"],
  ["EMP-006", "Aisha", "Khan", "DEP-DEV", "Backend Developer", "2021-07-05", "employee"],
  ["EMP-007", "Vikram", "Singh", "DEP-DEV", "Full Stack Developer", "2023-03-20", "employee"],
  ["EMP-008", "Neha", "Gupta", "DEP-DEV", "Junior Frontend Developer", "2026-08-01", "employee", "probation"],
  ["EMP-009", "Rohan", "Das", "DEP-QA", "QA Lead", "2021-01-11", "department_head"],
  ["EMP-010", "Pooja", "Nair", "DEP-QA", "QA Engineer", "2022-05-16", "employee"],
  ["EMP-011", "Imran", "Sheikh", "DEP-QA", "Automation Engineer", "2023-08-07", "employee"],
  ["EMP-012", "Divya", "Reddy", "DEP-QA", "QA Engineer", "2024-01-08", "employee"],
  ["EMP-013", "Meera", "Joshi", "DEP-DES", "Design Lead", "2021-03-29", "department_head"],
  ["EMP-014", "Aditya", "Rao", "DEP-DES", "UI Designer", "2022-10-03", "employee"],
  ["EMP-015", "Sana", "Ali", "DEP-DES", "UX Researcher", "2023-06-12", "employee"],
  ["EMP-016", "Nikhil", "Bose", "DEP-DES", "Graphic Designer", "2024-04-15", "employee"],
  ["EMP-017", "Tanvi", "Kapoor", "DEP-MKT", "Marketing Manager", "2021-09-01", "department_head"],
  ["EMP-018", "Faizan", "Ahmed", "DEP-MKT", "SEO Specialist", "2022-12-05", "employee"],
  ["EMP-019", "Ritika", "Menon", "DEP-MKT", "Content Writer", "2023-11-20", "employee"],
  ["EMP-020", "Siddharth", "Jain", "DEP-MKT", "Performance Marketer", "2024-07-01", "employee"],
  ["EMP-021", "Kavya", "Pillai", "DEP-HR", "HR Executive", "2023-02-06", "employee"],
  ["EMP-022", "Manish", "Tiwari", "DEP-HR", "Talent Acquisition Specialist", "2022-08-22", "employee", "on_leave"],
];

const cities = ["Bengaluru", "Hyderabad", "Pune", "Remote"];

export const employees: Employee[] = rows.map(([id, firstName, lastName, departmentId, designation, joiningDate, role, status], i) => ({
  id,
  firstName,
  lastName,
  email: `${firstName}.${lastName}@workforcehub.io`.toLowerCase(),
  phone: `+91 98${String(45000000 + i * 137911).slice(0, 8)}`,
  departmentId,
  designation,
  joiningDate,
  status: status ?? "active",
  role,
  location: cities[i % cities.length],
}));

export const rolePermissions: RolePermissions = {
  super_admin: [
    "dashboard.org", "employees.view", "employees.manage", "departments.manage", "attendance.viewAll",
    "worklogs.viewAll", "tasks.create", "tasks.viewAll", "leaves.approve", "reports.view",
    "admin.access", "roles.manage", "settings.manage",
  ],
  admin: [
    "dashboard.org", "employees.view", "employees.manage", "departments.manage", "attendance.viewAll",
    "worklogs.viewAll", "tasks.create", "tasks.viewAll", "leaves.approve", "reports.view", "admin.access",
  ],
  department_head: [
    "dashboard.org", "employees.view", "attendance.viewAll", "worklogs.viewAll", "tasks.create",
    "tasks.viewAll", "leaves.approve", "reports.view",
  ],
  hr: [
    "dashboard.org", "employees.view", "employees.manage", "attendance.viewAll", "leaves.approve", "reports.view",
  ],
  employee: [],
};

export const settings: AppSettings = {
  companyName: "WorkforceHub",
  workStartTime: "09:30",
  workEndTime: "18:30",
  lateGraceMinutes: 15,
  standardHours: 8,
  weekendDays: [0, 6],
  leaveAllowances: { casual: 12, sick: 10, earned: 15 },
  timezone: "Asia/Kolkata",
  dateFormat: "dd MMM yyyy",
  apiBaseUrl: "",
  emailNotifications: true,
};

/** One demo user per role for the role switcher. */
export const demoUsers: Record<Employee["role"], string> = {
  super_admin: "EMP-001",
  admin: "EMP-002",
  department_head: "EMP-003",
  hr: "EMP-004",
  employee: "EMP-005",
};

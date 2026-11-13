# WorkforceHub — Team & Workforce Management (Frontend)

A responsive React + TypeScript frontend for managing a team of 11–25 people across departments: attendance, work logs, tasks, leave, notifications, reports and admin settings.

**Frontend only.** All data comes from a mock service layer in the browser. There is no backend, API or real authentication yet; the role switcher only previews what each role would see.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Lucide icons · Recharts · Vitest

## Getting started

```bash
cd app
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build for production |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Modules

- **Dashboard**: headcount, present/absent, currently working, task totals (completed, pending, overdue), attendance chart, department stats, recent activity and notifications. Employees get a personal dashboard.
- **Departments**: Development, Testing/QA, Design, Marketing and HR, each with members, assigned tasks and live stats.
- **Employees**: searchable, filterable, sortable directory, plus profiles with tasks, attendance and leave.
- **Attendance**: check in/out, breaks, worked hours, late arrivals, a daily team status view and history.
- **Work logs**: daily reports with completed, ongoing, blockers and remarks; history and team view.
- **Tasks**: create and assign tasks, priority and status, list and board views, overdue flags, detail page with activity history and comments.
- **Leave**: apply, balances, approve or reject with notes, history.
- **Notifications**: task assignments, overdue tasks, leave applications and decisions, unread counter, mark as read.
- **Reports**: daily, weekly, monthly or custom ranges; employee-wise and department-wise tables; CSV export and print to PDF.
- **Admin panel**: employees, departments, role-permission matrix, application settings and system configuration.

## Roles

Switch roles from the top bar: **Super Admin, Admin, Department Head, HR, Employee**. Navigation, dashboards and actions change per role, and Department Heads only see their own department. Permissions can be edited in **Admin → Roles & permissions**.

> This is UI-only visibility. Real authorisation must be enforced by the backend.

## Architecture

```
app/src
├── components/   reusable UI kit (ui/), form fields (form/), domain badges (domain/)
├── layouts/      app shell: sidebar, top bar, navigation config
├── pages/        one file per route
├── modules/      feature components (tasks, leave, attendance, reports, admin, …)
├── hooks/        useQuery, useMutation, useForm, useTable, useSession, useDirectory
├── services/     service contracts + mock implementations (the only data access layer)
├── mock-data/    seed data, generated relative to today
├── types/        shared domain types
└── utils/        dates, attendance maths, report maths, permissions, CSV export
```

## Connecting a real backend

Pages and components never touch mock data directly; they call the services exported from `src/services/index.ts`.

1. Keep the interfaces in `src/services/contracts.ts`.
2. Rewrite each `src/services/*Service.ts` to call your API (for example a Google Apps Script web app) and return the same shapes defined in `src/types`.
3. Delete `src/services/mock/` and `src/mock-data/` once nothing imports them.

`useMutation` refreshes every open screen after any successful write, so the UI stays in sync without further changes.

Mock data is saved in `localStorage` and reseeds each day. You can also reset it from **Admin → System → Reset demo data**.

## Author

**Md Azharuddin** · [GitHub](https://github.com/Md-Azharuddin02) · [LinkedIn](https://www.linkedin.com/in/mdazharuddin02/)

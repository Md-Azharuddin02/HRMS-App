# WorkforceHub — Team & Workforce Management

A responsive React + TypeScript frontend for managing a team of 11–25 people across departments: attendance, work logs, tasks, leave, notifications, reports and admin settings.

This repo is the React frontend. Data, sign-in and permissions are handled by the [HRMS API](https://github.com/Md-Azharuddin02/HRMS-APIs) (FastAPI + PostgreSQL).

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Lucide icons · Recharts · Vitest

## Getting started

Start the [API](https://github.com/Md-Azharuddin02/HRMS-APIs#run-locally) first (it listens on `http://localhost:8000`), then:

```bash
cd app
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:8000
npm install
npm run dev
```

Sign in with the Super Admin you created with the API's seed script.

**Deploying (Vercel):** set `VITE_API_URL` to your API's public URL in the project's environment variables, and add the Vercel URL to the API's `CORS_ORIGINS`.

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
- **Attendance**: one continuous session per day.
  - Check in, take any number of breaks, resume, and check out. The session closes automatically at the end of the workday.
  - Breaks are recorded automatically after inactivity (warning at 55 min, break at 60, both configurable) and when the app was closed while working.
  - Live team view of who is working, on a break, not in yet or done, with break reasons.
- **Work logs**: daily reports with completed, ongoing, blockers and remarks; history and team view. After submitting (or from any of your saved logs), **Share on WhatsApp** opens WhatsApp with the report filled in so you can send it to your team group.
- **Tasks**: create and assign tasks, priority and status, list and board views, overdue flags, detail page with activity history and comments.
- **Leave**: apply, balances, approve or reject with notes, history.
- **Notifications**: task assignments, overdue tasks, leave applications and decisions, unread counter, mark as read.
- **Reports**: daily, weekly, monthly or custom ranges; employee-wise and department-wise tables; CSV export and print to PDF.
- **Admin panel**: employees, departments, role-permission matrix, application settings and system configuration.

## Desktop only

The app opens only on laptops and desktops. Phones and tablets, including iPads that request the desktop site, see a full-screen notice. Detection uses client hints, the user agent and touch support, not screen width (`src/utils/device.ts`).

**Limits of this check and of attendance tracking in the browser:**
- Device detection can be spoofed.
- Browsers don't guarantee that a tab close is detectable. The app records a "closed" break when it is next opened, and a reopen within 60 seconds counts as a refresh.
- OS screen locks aren't visible to a web page.
- localStorage only holds hints. Sessions, breaks and timestamps are stored and validated by the API.

## Roles

**Super Admin, Admin, Department Head, HR, Employee.** Each person signs in with their own account. Their role decides the navigation, dashboard and actions they see, and Department Heads only see their own department. A Super Admin can edit what each role may do in **Admin → Roles & permissions**.

The API enforces the same permissions and data scope on every request, so hiding a button is never the only protection.

## Architecture

```
app/src
├── components/   reusable UI kit (ui/), form fields (form/), domain badges (domain/)
├── layouts/      app shell: sidebar, top bar, navigation config, change-password dialog
├── pages/        one file per route, plus the sign-in page
├── modules/      feature components (tasks, leave, attendance, reports, admin, …)
├── hooks/        useQuery, useMutation, useForm, useTable, useSession, useDirectory
├── services/     REST client (http.ts) and one service per API area, typed by contracts.ts
├── types/        shared domain types (match the API's camelCase JSON)
└── utils/        dates, attendance maths, permissions, CSV export
```

**Auth.** The short-lived access token is kept in memory only. The refresh token is an httpOnly cookie, so a page reload signs you back in silently. A 401 triggers one shared refresh and the request is retried.

**Data.** Pages call the services in `src/services`. `useMutation` refreshes every open screen after a successful write.

## Author

**Md Azharuddin** · [GitHub](https://github.com/Md-Azharuddin02) · [LinkedIn](https://www.linkedin.com/in/mdazharuddin02/)

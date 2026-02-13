<div align="center">

# 🎨 HRMS Lite – Frontend

### A Modern, Responsive React Application for Human Resource Management

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)

**Production-ready frontend with stunning UI/UX and seamless API integration**

[Features](#-features) • [Installation](#️-installation) • [Architecture](#-architecture) • [Screenshots](#-screenshots)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👥 Employee Management
- ✅ Add new employees with validation
- ✅ View employee directory
- ✅ Delete employees with confirmation
- ✅ Duplicate validation handling
- ✅ Real-time loading states
- ✅ Error handling with user feedback

</td>
<td width="50%">

### 📅 Attendance Management
- ✅ Employee selection dropdown
- ✅ Mark daily attendance
- ✅ View attendance history
- ✅ Beautiful empty states
- ✅ Skeleton loading animations
- ✅ Status badges (Present/Absent)

</td>
</tr>
</table>

---

## 🎨 UI/UX Features

<div align="center">

| Feature | Description |
|:-------:|:------------|
| 🎭 **Modern Design** | Clean, professional interface with gradient accents |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop devices |
| 🎯 **Intuitive Navigation** | Sidebar layout with active route indicators |
| ⚡ **Fast Loading** | Lazy-loaded routes and optimized components |
| 🎬 **Smooth Animations** | Beautiful loaders and transitions |
| ✅ **Form Validation** | Real-time validation with helpful error messages |
| 🎨 **Tailwind CSS** | Utility-first styling for rapid development |
| 🔄 **State Management** | Context API for global state handling |

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Technology | Purpose | Version |
|:----------:|:-------:|:-------:|
| **React** | UI Library | 18.x |
| **Vite** | Build Tool | Latest |
| **Tailwind CSS** | Styling | Latest |
| **React Router** | Routing | v6 |
| **Context API** | State Management | Built-in |
| **Axios** | HTTP Client | Latest |
| **Lucide React** | Icon Library | Latest |

</div>

---

## ⚙️ Installation

### 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend API running (see [HRMS Backend](https://github.com/YOUR_USERNAME/HRMS-Backend))

### 🚀 Quick Start

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/HRMS-App.git
cd HRMS-App
```

#### 2️⃣ Install Dependencies
```bash
npm install
# or
yarn install
```

#### 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**For production:**
```env
VITE_API_BASE_URL=https://hrms-api-uwae.onrender.com
```

#### 4️⃣ Start Development Server
```bash
npm run dev
# or
yarn dev
```

#### 🎉 Access the Application

- **Local Development**: `http://localhost:5173`
- **Network Access**: Check terminal for network URL

---

## 📁 Project Architecture
```
src/
├── 📂 api/
│   └── api.js                 # Axios configuration & base URL
│
├── 📂 components/
│   ├── AttendanceForm.jsx     # Mark attendance component
│   ├── AttendanceList.jsx     # Attendance history display
│   ├── EmployeeForm.jsx       # Add employee form
│   ├── EmployeeList.jsx       # Employee directory table
│   └── Loader.jsx             # Beautiful loading animation
│
├── 📂 layout/
│   └── Layout.jsx             # Main layout with sidebar
│
├── 📂 pages/
│   ├── Attendance.jsx         # Attendance management page
│   └── Employees.jsx          # Employee management page
│
├── 📂 store/
│   └── AppContext.jsx         # Global state management
│
├── App.jsx                    # Root component with routing
├── main.jsx                   # Application entry point
└── index.css                  # Global styles & Tailwind
```

---

## 🔗 Backend Connection

### Setup

1. Ensure backend server is running
2. Update `.env` with correct API URL
3. Backend must be accessible from frontend

### API Integration
```javascript
// api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default API;
```

### Environment Variables

| Variable | Description | Example |
|:---------|:------------|:--------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

---

## 🎯 Key Components

### 🏢 Employee Management
```
┌─────────────────────────────────────┐
│  EmployeeForm                       │
│  • Add new employees                │
│  • Real-time validation             │
│  • Success/error feedback           │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  EmployeeList                       │
│  • Display all employees            │
│  • Delete with confirmation         │
│  • Responsive table/card view       │
└─────────────────────────────────────┘
```

### 📅 Attendance Management
```
┌─────────────────────────────────────┐
│  Employee Selector                  │
│  • Dropdown with all employees      │
│  • Search functionality             │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  AttendanceForm                     │
│  • Date picker                      │
│  • Status selector                  │
│  • Duplicate prevention             │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  AttendanceList                     │
│  • History display                  │
│  • Status badges                    │
│  • Date formatting                  │
└─────────────────────────────────────┘
```

---

## 📱 Responsive Design

<table>
<tr>
<td width="33%">

### 📱 Mobile
- Hamburger menu
- Stacked layouts
- Touch-optimized
- Card views

</td>
<td width="33%">

### 📱 Tablet
- Adaptive sidebar
- Grid layouts
- Optimized spacing
- Hybrid views

</td>
<td width="33%">

### 💻 Desktop
- Full sidebar
- Table views
- Multi-column
- Enhanced UI

</td>
</tr>
</table>

---

## 🎨 Design System

### Color Palette
```css
Primary:    Indigo (600-700)
Secondary:  Purple (600-700)
Success:    Green (600-700)
Error:      Red (600-700)
Background: Slate (50-100)
Text:       Slate (600-900)
```

### Typography

- **Headings**: Bold, Gradient accents
- **Body**: Regular, Slate colors
- **Labels**: Semibold, Small caps

### Components

- **Buttons**: Gradient backgrounds, Shadow effects
- **Cards**: Rounded corners, Subtle shadows
- **Forms**: Clean inputs, Inline validation
- **Tables**: Hover states, Striped rows

---

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag & drop 'dist' folder to Netlify
```

---

## ⚠️ Current Limitations

- 🔐 No authentication/authorization
- 📄 No pagination for large datasets
- 🔍 Limited search and filter options
- 💾 No offline support
- 📊 No analytics dashboard
- 🌙 No dark mode

---

## 🚀 Future Roadmap

<table>
<tr>
<td>

### Phase 1: Core Features
- [ ] JWT Authentication
- [ ] Protected routes
- [ ] User roles (Admin/Manager)
- [ ] Search functionality
- [ ] Pagination support

</td>
<td>

### Phase 2: Enhanced UX
- [ ] Dark mode toggle
- [ ] Toast notifications
- [ ] Advanced filters
- [ ] Export to Excel/PDF
- [ ] Bulk operations

</td>
<td>

### Phase 3: Analytics
- [ ] Dashboard with stats
- [ ] Attendance charts
- [ ] Department analytics
- [ ] Monthly reports
- [ ] Email notifications

</td>
</tr>
</table>

---

## 📜 Available Scripts

| Script | Description |
|:-------|:------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Md Azharuddin**

-GitHub:https://github.com/Md-Azharuddin02
-LinkedIn: https://www.linkedin.com/in/mdazharuddin02/
- Portfolio: [yourwebsite.com](https://portfolio-tech-tan.vercel.app/)

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ using React, Vite, and Tailwind CSS**

[Report Bug](https://github.com/YOUR_USERNAME/HRMS-App/issues) • [Request Feature](https://github.com/YOUR_USERNAME/HRMS-App/issues)

</div>

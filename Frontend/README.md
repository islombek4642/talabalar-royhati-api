# 🎓 Talabalar Ro'yhati - Admin Panel

> Modern admin dashboard for student management system built with Next.js 16, TypeScript, and TailwindCSS

Full-featured admin panel to manage students, admins, and system settings.

## ✨ Features

### 🎯 Student Management
- ✅ View all students (paginated table)
- ✅ Add new students with validation
- ✅ Edit student information
- ✅ Delete students (with confirmation)
- ✅ CSV Import/Export
- ✅ Advanced search and filtering
- ✅ Sort by any column

### 👥 Admin Management (Super Admin)
- ✅ View all admins
- ✅ Create new admin accounts
- ✅ Promote/demote admin roles
- ✅ Delete admin accounts
- ✅ Role-based access control

### 🔐 Authentication & Security
- ✅ Secure admin login
- ✅ JWT token management
- ✅ Protected routes (middleware)
- ✅ Role-based permissions
- ✅ Session management

### 📊 Dashboard
- ✅ Statistics overview
- ✅ Quick action buttons
- ✅ Recent activity
- ✅ System status

### ⚙️ Settings
- ✅ Profile management
- ✅ Password change
- ✅ System preferences

### 🎨 UI/UX
- ✅ Modern responsive design
- ✅ Sidebar navigation
- ✅ Custom modal components
- ✅ Color-coded confirmations (Warning/Danger/Info)
- ✅ Loading states & spinners
- ✅ Toast notifications
- ✅ Form validation with real-time feedback
- ✅ Accessibility (WCAG compliant)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Icons:** Lucide React
- **Notifications:** React Hot Toast (optional)

## 📦 Installation

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 🚀 Quick Start

### Prerequisites
- Backend API must be running on `http://localhost:3000`
- PostgreSQL database configured
- Initial admin account created (see root README)

### Start Development Server
```bash
cd Frontend
npm run dev
```

**Admin Panel:** http://localhost:3002/admin/login

### Default Admin Credentials
```
Username: admin
Password: Admin@123456
```

> Change these credentials after first login!

## 📁 Project Structure

```
Frontend/
├── app/
│   └── admin/
│       ├── dashboard/
│       │   ├── admins/              # Admin management
│       │   │   ├── components/      # Admin modals & components
│       │   │   └── page.tsx         # Admin list page
│       │   ├── students/            # Student management
│       │   │   ├── components/      # Student modals & components
│       │   │   │   ├── AddStudentModal.tsx
│       │   │   │   ├── EditStudentModal.tsx
│       │   │   │   ├── ImportModal.tsx
│       │   │   │   └── ConfirmModal.tsx
│       │   │   └── page.tsx         # Student list page
│       │   ├── settings/            # Settings page
│       │   │   └── page.tsx
│       │   ├── api-docs/            # API documentation
│       │   ├── monitoring/          # System monitoring
│       │   ├── layout.tsx           # Dashboard layout
│       │   └── page.tsx             # Main dashboard
│       └── login/
│           └── page.tsx             # Admin login page
├── lib/
│   └── api.ts                       # API client
├── store/
│   └── authStore.ts                 # Authentication state
├── types/
│   └── index.ts                     # TypeScript types
└── .env.example                     # Environment template
```

## 🔑 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📱 Pages & Routes

| Route | Description | Required Role |
|-------|-------------|---------------|
| `/admin/login` | Admin login page | Public |
| `/admin/dashboard` | Main dashboard | Admin/Super Admin |
| `/admin/dashboard/students` | Student management | Admin/Super Admin |
| `/admin/dashboard/admins` | Admin management | Super Admin only |
| `/admin/dashboard/settings` | Settings page | Admin/Super Admin |
| `/admin/dashboard/api-docs` | API documentation | Admin/Super Admin |
| `/admin/dashboard/monitoring` | System monitoring | Super Admin only |

## 🎯 API Endpoints Used

### Authentication
```
POST   /api/v1/auth/login
GET    /api/v1/admin/profile
```

### Student Management
```
GET    /api/v1/students
GET    /api/v1/students/:id
POST   /api/v1/students
PATCH  /api/v1/students/:id
DELETE /api/v1/students/:id
POST   /api/v1/students/import
GET    /api/v1/students/export.csv
```

### Admin Management (Super Admin)
```
GET    /api/v1/admin/list
POST   /api/v1/admin
PATCH  /api/v1/admin/:id
DELETE /api/v1/admin/demote/:id
```

## 🧪 Testing Admin Panel

### 1. Login
1. Navigate to `/admin/login`
2. Enter admin credentials
3. Should redirect to `/admin/dashboard`

### 2. Student Management
1. Go to "Talabalar" section
2. **Add:** Click "Yangi Talaba" button
3. **Edit:** Click edit icon on any student
4. **Delete:** Click delete icon (confirmation modal)
5. **Import:** Upload CSV file
6. **Export:** Download student list as CSV
7. **Search:** Use search box to filter
8. **Sort:** Click column headers to sort

### 3. Admin Management (Super Admin)
1. Go to "Adminlar" section
2. **View:** See all admin accounts
3. **Add:** Create new admin
4. **Promote:** Change admin role
5. **Delete:** Remove admin access

### 4. Settings
1. Go to "Sozlamalar"
2. Update profile information
3. Change password
4. View system settings

## 🎨 Custom Components

### ConfirmModal
Color-coded confirmation modals:
- **Warning** - Yellow theme for caution actions
- **Danger** - Red theme for destructive actions
- **Info** - Blue theme for informational dialogs

### Modal Features
- Backdrop click to close
- Escape key support
- Loading states
- Form validation
- Error handling

## ⚠️ Troubleshooting

### Port Conflict
If port 3000 is in use, Next.js will automatically use 3002:
```bash
# Backend: http://localhost:3000
# Frontend: http://localhost:3002
```

### Authentication Issues
```bash
# Clear localStorage and login again
localStorage.clear()
location.reload()
```

### API Connection
Ensure backend is running and `NEXT_PUBLIC_API_URL` is correct in `.env.local`

## 🔧 Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 Form Validations

### Student Form
- Full name: min 2 characters, required
- Email: valid email format, unique
- Faculty: required
- Group: required
- Phone: +998XXXXXXXXX format, optional
- Birth date: YYYY-MM-DD format
- Enrollment year: 4-digit year
- Status: active | graduated | expelled | academic_leave

### Admin Form
- Username: min 3 characters, unique
- Email: valid email format, unique
- Password: min 8 characters (for new admins)
- Role: ADMIN | SUPER_ADMIN

### CSV Import
- File size: max 5MB
- Format: CSV only
- Headers: full_name,email,faculty,group,phone,birth_date,enrollment_year,status
- Validation: All fields validated on import

## 🎨 Design Features

- **Color Scheme:** Professional blue/gray palette
- **Layout:** Sidebar navigation + content area
- **Responsive:** Mobile, tablet, desktop optimized
- **Icons:** Lucide React library (600+ icons)
- **Typography:** System fonts for performance
- **Animations:** Smooth transitions and hover effects
- **Accessibility:** WCAG 2.1 Level AA compliant

## 🔐 Security Features

- JWT token management in localStorage
- Auto-logout on token expiration (401 response)
- Role-based access control (RBAC)
- Protected routes via Next.js middleware
- XSS protection (React escaping)
- CSRF protection (backend)
- Rate limiting (backend)
- Input sanitization

## 📊 State Management

**Zustand Store (`authStore.ts`):**
- Admin authentication state
- User profile data
- Login/Logout actions
- Token management
- Persistent storage (localStorage)
- Hydration on mount

## 🚀 Deployment

### Build for Production
```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Production)
Set in Vercel dashboard or `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 📚 Additional Resources

### Documentation
- **Main README** - See root `README.md` for full system documentation
- **API Documentation** - Available at `/admin/dashboard/api-docs`
- **Backend API** - OpenAPI spec at `http://localhost:3000/api-docs`

### Technologies
- [Next.js Documentation](https://nextjs.org/docs) - React framework
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Lucide Icons](https://lucide.dev/) - Icon library
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 🤝 Contributing

See main repository contributing guidelines.

## 👨‍💻 Author

**Islombek** - [GitHub](https://github.com/islombek4642)

## 📄 License

MIT License

---

**Part of Talabalar Ro'yhati - Student Management System**

# 🎓 Talabalar Portali - Frontend

Modern va professional student portal frontend application built with Next.js 16, TypeScript, and TailwindCSS.

## ✨ Features

### 🔐 Authentication
- ✅ Student registration
- ✅ Login/Logout
- ✅ Password visibility toggle
- ✅ Protected routes (middleware)
- ✅ JWT token management

### 👤 Profile Management
- ✅ View profile
- ✅ Edit profile (name, phone, faculty, group, birth date)
- ✅ Profile picture upload (max 5MB, JPG/PNG/WebP)
- ✅ Delete profile picture
- ✅ Image preview before upload

### 🔒 Security
- ✅ Password change with validation
- ✅ Password strength indicator
- ✅ Current password verification
- ✅ Secure JWT storage

### 🎨 UI/UX
- ✅ Modern gradient design
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Sidebar navigation with active states
- ✅ Mobile hamburger menu
- ✅ Loading states & spinners
- ✅ Error handling with user-friendly messages
- ✅ Form validation (Zod)
- ✅ 404 & error pages

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
# Install dependencies
npm install

# Install toast notifications (optional but recommended)
npm install react-hot-toast

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Run development server
npm run dev
```

## 🚀 Quick Start

1. **Backend API** should be running on `http://localhost:3000`
2. **Frontend** will run on `http://localhost:3002` (if 3000 is taken)

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## 📁 Project Structure

```
Frontend/
├── app/
│   ├── dashboard/
│   │   ├── components/          # Dashboard components
│   │   ├── profile/edit/        # Profile edit page
│   │   ├── settings/password/   # Password change page
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   └── page.tsx             # Main dashboard
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── error.tsx                # Global error page
│   ├── not-found.tsx            # 404 page
│   ├── providers.tsx            # Toast provider
│   └── layout.tsx               # Root layout
├── lib/
│   ├── api.ts                   # Axios client with interceptors
│   ├── profilePicture.ts        # Profile picture service
│   └── validation.ts            # Reusable Zod validations
├── store/
│   └── authStore.ts             # Zustand auth store
├── types/
│   └── index.ts                 # TypeScript types
└── middleware.ts                # Route protection middleware
```

## 🔑 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📱 Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/dashboard` | Student dashboard | Yes |
| `/dashboard/profile/edit` | Edit profile | Yes |
| `/dashboard/settings/password` | Change password | Yes |

## 🎯 API Endpoints Used

```
POST   /api/v1/student/register
POST   /api/v1/student/login
GET    /api/v1/student/me
PATCH  /api/v1/student/me
POST   /api/v1/student/change-password
POST   /api/v1/student/me/profile-picture
DELETE /api/v1/student/me/profile-picture
```

## 🧪 Testing

1. **Register:** `/register` - Create new student account
2. **Login:** `/login` - Login with credentials
3. **Dashboard:** Redirects after successful login
4. **Edit Profile:** Click "Profilni Tahrirlash" button
5. **Change Password:** Click "Parolni O'zgartirish" button
6. **Upload Picture:** Use upload button in dashboard
7. **Logout:** Click "Chiqish" in sidebar

## ⚠️ Known Issues

- **Port Conflict:** If port 3000 is taken, Next.js uses 3002 automatically
- **Toast Notifications:** Requires `react-hot-toast` installation
- **Image URLs:** Currently hardcoded to `localhost:3000`

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

### Registration
- Full name: min 2 characters
- Email: valid email format
- Password: min 6 characters
- Phone: +998XXXXXXXXX format (optional)
- Birth date: YYYY-MM-DD format, age 16-100
- Enrollment year: 2000 to current year

### Profile Edit
- Same validations as registration
- Real-time validation feedback

### Password Change
- Current password: required
- New password: min 6 characters
- Confirm password: must match
- Password strength indicator (4 levels)

## 🎨 Design Features

- **Color Scheme:** Indigo/Blue gradient
- **Responsive:** Mobile-first design
- **Icons:** Lucide React icon library
- **Typography:** Geist Sans & Geist Mono fonts
- **Animations:** Smooth transitions and hover effects

## 🔐 Security Features

- JWT token in localStorage
- Auto-logout on token expiration
- Protected routes via middleware
- Password hashing (backend)
- CSRF protection (backend)
- Rate limiting (backend)

## 📊 State Management

**Zustand Store (`authStore.ts`):**
- User authentication state
- Student profile data
- Login/Logout actions
- Register action
- Token management
- Load from localStorage on mount

## 🚀 Deployment

```bash
# Build
npm run build

# Preview production build
npm start
```

Deploy to Vercel:
```bash
vercel deploy
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## 👨‍💻 Author

Student Portal Frontend - 2025

## 📄 License

MIT

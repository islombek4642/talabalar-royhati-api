# 📁 PROJECT STRUCTURE

Clean and organized structure for Talabalar Ro'yhati API

## 🏗️ ROOT STRUCTURE

```
talabalar-royhati-api/
├── 📂 Frontend/              # Next.js frontend application
├── 📂 src/                   # Backend source code
├── 📂 prisma/                # Database schema and migrations
├── 📂 scripts/               # Utility scripts
├── 📂 tests/                 # Test files
├── 📂 docs/                  # Documentation
├── 📂 monitoring/            # Monitoring configurations
├── 📂 uploads/               # User uploads (gitignored)
├── 📂 backups/               # Database backups (gitignored)
├── 📄 .env                   # Environment variables (gitignored)
├── 📄 .env.example           # Environment template
├── 📄 .gitignore             # Git ignore rules
├── 📄 docker-compose.yml     # Docker configuration
├── 📄 Dockerfile             # Docker build
├── 📄 package.json           # Backend dependencies
├── 📄 tsconfig.json          # TypeScript config
├── 📄 README.md              # Main documentation
└── 📄 CHANGELOG.md           # Version history
```

---

## 🎨 FRONTEND STRUCTURE

```
Frontend/
├── 📂 app/                   # Next.js app directory
│   ├── 📂 admin/            # Admin panel
│   │   ├── 📂 dashboard/   # Dashboard pages
│   │   │   ├── 📂 admins/        # Admin management
│   │   │   ├── 📂 students/      # Student management
│   │   │   ├── 📂 settings/      # Settings page
│   │   │   ├── 📂 api-docs/      # API documentation
│   │   │   └── 📂 monitoring/    # System monitoring
│   │   └── 📂 login/        # Login page
│   ├── 📄 layout.tsx        # Root layout
│   └── 📄 page.tsx          # Home page
├── 📂 lib/                   # Utility libraries
├── 📂 store/                 # State management
├── 📂 types/                 # TypeScript types
├── 📂 public/                # Static assets
├── 📄 .env.local             # Local environment (gitignored)
├── 📄 .env.example           # Environment template
├── 📄 next.config.ts         # Next.js configuration
├── 📄 tailwind.config.ts     # Tailwind CSS config
└── 📄 package.json           # Frontend dependencies
```

---

## ⚙️ BACKEND STRUCTURE

```
src/
├── 📂 controllers/           # Request handlers
│   ├── 📄 auth.controller.ts
│   ├── 📄 students.controller.ts
│   └── 📄 admin.controller.ts
├── 📂 routes/                # API routes
│   ├── 📄 auth.route.ts
│   ├── 📄 students.route.ts
│   └── 📄 admin-management.route.ts
├── 📂 services/              # Business logic
│   ├── 📄 auth.service.ts
│   ├── 📄 students.service.ts
│   ├── 📄 admin-auth.service.ts
│   └── 📄 admin-management.service.ts
├── 📂 repositories/          # Database access
│   ├── 📄 students.repo.ts
│   └── 📄 admin.repo.ts
├── 📂 middleware/            # Express middleware
│   ├── 📄 auth.middleware.ts
│   └── 📄 error.middleware.ts
├── 📂 utils/                 # Utility functions
│   ├── 📄 logger.ts
│   └── 📄 validators.ts
├── 📂 types/                 # TypeScript types
├── 📄 app.ts                 # Express app setup
└── 📄 server.ts              # Server entry point
```

---

## 🗄️ DATABASE STRUCTURE

```
prisma/
├── 📂 migrations/            # Database migrations
│   └── 📂 YYYYMMDDHHMMSS_*/
├── 📄 schema.prisma          # Database schema
└── 📄 seed-admin.ts          # Initial admin seed
```

---

## 🛠️ SCRIPTS STRUCTURE

```
scripts/
├── 📄 backup-db.js           # Database backup
├── 📄 restore-db.js          # Database restore
├── 📄 seed-admin.ts          # Seed admin user
└── 📄 cleanup.ps1            # Cleanup temporary files
```

---

## 📚 DOCUMENTATION STRUCTURE

```
docs/
├── 📄 API.md                 # API documentation
├── 📄 DEPLOYMENT.md          # Deployment guide
├── 📄 DEVELOPMENT.md         # Development setup
└── 📄 TESTING.md             # Testing guide
```

---

## 🔧 CONFIGURATION FILES

### Root Level:
- `.env` - Environment variables (secret, gitignored)
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `.dockerignore` - Docker ignore rules
- `docker-compose.yml` - Docker services
- `Dockerfile` - Docker build instructions
- `tsconfig.json` - TypeScript configuration
- `jest.config.ts` - Jest testing configuration

### Frontend Level:
- `.env.local` - Frontend environment (secret, gitignored)
- `.env.example` - Frontend environment template
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration

---

## 📊 DATA FILES

### Sample Data (Keep):
- `namuna.sample.csv` - Sample CSV template
- `students_sample_100.csv` - Example student data

### Temporary Data (Delete):
- ❌ `test_import.csv` - Test file
- ❌ `check-*.js` - Test scripts
- ❌ `test-*.js` - Test scripts

---

## 🔒 SECURITY FILES

### Ignored (Not in repo):
- `.env` - Contains secrets
- `.env.local` - Contains secrets
- `keypair.pem` - SSH keys
- `*.key` - Private keys
- `*.pem` - Certificates

### Public (In repo):
- `.env.example` - Template without secrets
- `Frontend/.env.example` - Frontend template

---

## 📦 BUILD OUTPUTS (Gitignored)

- `dist/` - Backend build output
- `.next/` - Frontend build output
- `node_modules/` - Dependencies
- `coverage/` - Test coverage reports
- `uploads/` - User uploaded files
- `backups/` - Database backups

---

## ✅ CLEAN PROJECT CHECKLIST

- [x] .gitignore updated
- [x] .env.example created
- [x] Frontend/.env.example created
- [x] Cleanup script created
- [x] Project structure documented
- [ ] Temporary files deleted
- [ ] Git cache cleaned
- [ ] Changes committed

---

## 🚀 MAINTENANCE COMMANDS

### Development:
```bash
# Backend
npm run dev

# Frontend
cd Frontend && npm run dev
```

### Database:
```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Seed admin
npx tsx prisma/seed-admin.ts
```

### Cleanup:
```bash
# Run cleanup script
.\scripts\cleanup.ps1

# Or manual cleanup
git clean -fd
```

### Testing:
```bash
# Run tests
npm test

# Coverage report
npm run test:coverage
```

---

**Last Updated**: 2025-01-26
**Status**: ✅ Organized

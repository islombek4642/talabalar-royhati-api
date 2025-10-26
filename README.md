# 🎓 Talabalar Ro'yhati - Student Management System

> Full-stack student management system with admin panel, built with Next.js, Express, Prisma & PostgreSQL

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-green)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)](https://www.postgresql.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-77%25-brightgreen)]()

Talabalar ro'yhati tizimi - to'liq student management API va modern admin panel bilan.

## ✨ Features

### 🎯 Core Features
- **Student Management** - Full CRUD operations with soft delete & restore
- **Admin Management** - Super Admin role system with permissions
- **CSV Import/Export** - Bulk operations for student data
- **Advanced Search** - Filter by faculty, group, status with pagination
- **Audit Trail** - Complete history of all changes
- **Authentication** - JWT-based secure authentication
- **Role-Based Access** - SUPER_ADMIN and ADMIN roles

### 🎨 Frontend (Next.js Admin Panel)
- **Modern UI** - Built with Next.js 16 + Tailwind CSS + Lucide icons
- **Real-time Updates** - Optimistic UI updates for better UX
- **Custom Modals** - Color-coded confirmation dialogs (Warning/Danger/Info)
- **Responsive Design** - Works on all devices
- **Accessibility** - WCAG compliant with proper form labels
- **Dashboard** - Statistics and quick actions
- **File Upload** - CSV import with validation

### 🛡️ Security & Performance
- **Rate Limiting** - 4-tier protection (General/Auth/Public/Write)
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Input Validation** - Zod schema validation
- **Prometheus Metrics** - Performance monitoring
- **Request Tracing** - Unique request IDs
- **Database Backups** - Automated with restore capability

### 📊 API & Documentation
- **OpenAPI (Swagger)** - Interactive API documentation
- **RESTful API** - Well-structured endpoints
- **Test Coverage** - 77%+ with Jest + Supertest
- **TypeScript** - Full type safety

## 📁 Project Structure

```
talabalar-royhati-api/
├── Frontend/                    # Next.js admin panel
│   ├── app/
│   │   └── admin/
│   │       ├── dashboard/       # Main dashboard
│   │       │   ├── admins/     # Admin management
│   │       │   ├── students/   # Student management
│   │       │   ├── settings/   # Settings page
│   │       │   └── api-docs/   # API documentation
│   │       └── login/          # Login page
│   ├── components/             # Reusable components
│   └── lib/                    # Utilities
│
├── src/                        # Backend API
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── repositories/          # Database access
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   └── utils/                 # Utility functions
│
├── prisma/                     # Database
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed-admin.ts          # Initial admin seed
│
├── scripts/                    # Utility scripts
│   ├── backup-db.js           # Database backup
│   ├── restore-db.js          # Database restore
│   └── cleanup.ps1            # Cleanup automation
│
├── tests/                      # Test files
├── docs/                       # Documentation
├── .env.example               # Environment template
└── openapi.yaml               # API specification
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** 13+
- **npm** or **yarn**

### 1. Clone & Install
```bash
git clone https://github.com/islombek4642/talabalar-royhati-api.git
cd talabalar-royhati-api

# Install backend dependencies
npm install

# Install frontend dependencies
cd Frontend && npm install && cd ..
```

### 2. Environment Setup
Create `.env` file (copy from `.env.example`):
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/talabalar?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/talabalar?schema=public"

# JWT
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Super Admin (Initial Setup)
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=Admin@123456

# Swagger (Optional)
SWAGGER_USERNAME=swagger
SWAGGER_PASSWORD=swagger123
```

### 3. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial admin
npx tsx prisma/seed-admin.ts
```

### 4. Start Development Servers

**Backend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Frontend:**
```bash
cd Frontend
npm run dev
# Runs on http://localhost:3002
```

### 5. Access Application
- **Frontend:** http://localhost:3002/admin/login
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health
- **Metrics:** http://localhost:3000/metrics

**Default Admin Credentials:**
- Username: `admin`
- Password: `Admin@123456`

## 📚 API Documentation

### Core Endpoints

#### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123456"
}

Response: { "access_token": "eyJ..." }
```

#### Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/students` | Public | List students (paginated) |
| `GET` | `/api/v1/students/:id` | Public | Get student by ID |
| `POST` | `/api/v1/students` | JWT | Create new student |
| `PATCH` | `/api/v1/students/:id` | JWT | Update student |
| `DELETE` | `/api/v1/students/:id` | JWT | Soft delete student |
| `GET` | `/api/v1/students/deleted` | JWT | List deleted students |
| `POST` | `/api/v1/students/:id/restore` | JWT | Restore deleted student |
| `GET` | `/api/v1/students/export.csv` | Public | Export to CSV |
| `POST` | `/api/v1/students/import` | JWT | Import from CSV |

#### Admin Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/admin/list` | Super Admin | List all admins |
| `GET` | `/api/v1/admin/profile` | JWT | Get current admin profile |
| `PATCH` | `/api/v1/admin/:id` | Super Admin | Update admin |
| `DELETE` | `/api/v1/admin/demote/:id` | Super Admin | Remove admin role |

#### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Prometheus metrics |
| `GET` | `/api-docs` | Swagger UI |

### Query Parameters

**Pagination:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Filtering:**
- `faculty` - Filter by faculty
- `group` - Filter by group
- `status` - Filter by status (active, graduated, expelled, academic_leave)
- `search` - Search in name and email

**Sorting:**
- `sort` - Sort fields (e.g., `full_name,-enrollment_year`)
  - Prefix with `-` for descending order

### 💻 Usage Examples

### Authentication
```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'

# Response: { "access_token": "eyJ..." }
```

### Student Operations

**Create Student:**
```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "full_name": "Ali Valiyev",
    "faculty": "Engineering",
    "group": "SE-21",
    "email": "ali@example.com",
    "phone": "+998901234567",
    "birth_date": "2003-05-17",
    "enrollment_year": 2021,
    "status": "active"
  }'
```

**List Students (with filters):**
```bash
curl "http://localhost:3000/api/v1/students?page=1&limit=20&faculty=Engineering&sort=full_name"
```

**Update Student:**
```bash
curl -X PATCH http://localhost:3000/api/v1/students/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "graduated"}'
```

**Delete Student (Soft Delete):**
```bash
curl -X DELETE http://localhost:3000/api/v1/students/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Restore Deleted Student:**
```bash
curl -X POST http://localhost:3000/api/v1/students/123/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### CSV Operations

**Export to CSV:**
```bash
# Download all students
curl "http://localhost:3000/api/v1/students/export.csv" -o students.csv

# With filters
curl "http://localhost:3000/api/v1/students/export.csv?faculty=Engineering&status=active" -o engineering_students.csv
```

**Import from CSV:**
```bash
curl -X POST http://localhost:3000/api/v1/students/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@students.csv"
```

**CSV Format:**
```csv
full_name,faculty,group,email,phone,birth_date,enrollment_year,status
Ali Valiyev,Engineering,SE-21,ali@example.com,+998901234567,2003-05-17,2021,active
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure
- **tests/auth.test.ts** - Authentication tests
- **tests/students.test.ts** - Student CRUD, pagination, filters, CSV operations
- **Jest config:** `jest.config.ts`
- **Coverage:** 77%+ (Target: 60%)

## 📊 Monitoring & Observability

### Prometheus Metrics
```bash
curl http://localhost:3000/metrics
```

**Available Metrics:**
- `http_request_duration_seconds` - Request duration histogram
- `http_requests_total` - Total HTTP requests counter
- `active_connections` - Active connections gauge
- `db_query_duration_seconds` - Database query duration

### Request Tracing
Every request gets a unique `X-Request-ID` header for tracking across logs.

### Health Check
```bash
curl http://localhost:3000/health
# Response: { "status": "healthy", "timestamp": "..." }
```

## 💾 Backup & Recovery

### Automated Backups
```bash
# Manual backup
npm run backup:db

# Backups stored in ./backups/
# Auto-cleanup: 30+ days old backups are removed
```

### Restore Database
```bash
# Restore from latest backup
npm run restore:db

# Restore from specific backup
npm run restore:db path/to/backup-file.sql
```

### Production Cron Setup
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * cd /path/to/project && npm run backup:db
```

## 🔒 Security

### Rate Limiting Strategy
| Type | Limit | Window |
|------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Public Reads | 30 requests | 1 minute |
| Write Operations | 10 requests | 1 minute |

### Security Headers
- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-origin protection
- **Input Validation** - Zod schema validation
- **SQL Injection** - Prisma ORM protection

### Swagger Protection
In production, Swagger UI requires basic authentication:
```env
SWAGGER_USERNAME=your_username
SWAGGER_PASSWORD=your_secure_password
```

## 🚀 Advanced Features

### Soft Delete with Restore
Students are never permanently deleted - they're marked with `deleted_at`:
```bash
# List deleted students
GET /api/v1/students/deleted

# Restore student
POST /api/v1/students/:id/restore
```

### Complete Audit Trail
All CREATE, UPDATE, DELETE operations are logged with:
- User ID and username
- IP address
- User agent
- Timestamp
- Before/after changes (JSON)

Query audit logs per student:
```bash
GET /api/v1/students/:id/audit
```

### Admin Role System
- **SUPER_ADMIN** - Full system access, can manage other admins
- **ADMIN** - Can manage students, limited system access

## 🐳 Docker Deployment

### Quick Start with Docker
```bash
# Start services
docker-compose up -d

# View logs
docker logs talabalar_api

# Stop services
docker-compose down
```

### Docker Compose Services
- **API** - Express backend (port 3000)
- **Database** - PostgreSQL 13 (port 5432)
- **Frontend** - Next.js admin panel (port 3002)

## 📖 Additional Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Detailed project organization
- **[CLEANUP_REPORT.md](CLEANUP_REPORT.md)** - Project cleanup guide
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues
- **[docs/DESIGN.md](docs/DESIGN.md)** - Architecture decisions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

**Islombek** - [GitHub](https://github.com/islombek4642)

---

**⭐ Star this repo if you find it helpful!**

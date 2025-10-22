# Talabalar Ro'yhati API

Node.js + Express + Prisma asosida talabalar ro'yhati API. CRUD, pagination, filtering, sorting, input validation (Zod), error handling, JWT auth, OpenAPI (Swagger), CSV import/export va testlar (Jest + Supertest) qo'llab-quvvatlanadi.

## Xususiyatlar
- CRUD: `students`
- Pagination, filtering, sorting
- Zod bilan validatsiya va global error handler
- Swagger (`/api-docs`)
- JWT autentifikatsiya (admin)
- CSV export va import
- Pino logging
- Jest + Supertest testlar

## Talablar
- Node.js 18+
- PostgreSQL 13+

## O'rnatish
```bash
npm install
```

## Konfiguratsiya
`.env` fayl yarating (yoki `.env.example`dan nusxa oling):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/talabalar?schema=public
JWT_SECRET=dev_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Ishga tushirish
```bash
npm run dev
```
Server: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

## Swagger (OpenAPI)
- `openapi.yaml` – hujjat manbai
- Swagger UI avtomatik `openapi.yaml`ni o'qiydi
- Bearer Auth (JWT) qo'llab-quvvatlanadi. “Authorize” oynasiga faqat tokenning o'zini (`eyJ...`) kiriting. Swagger `Bearer` prefiksini o'zi qo'shadi.

## Endpoints (asosiy)
- `GET /` – API status
- `GET /health` – healthcheck
- `POST /api/v1/auth/login` – login (admin credentials, token qaytadi)
- `GET /api/v1/students` – ro'yxat (pagination/filter/sort)
- `GET /api/v1/students/{id}` – bitta student
- `POST /api/v1/students` – yaratish (JWT talab qiladi)
- `PATCH /api/v1/students/{id}` – yangilash (JWT)
- `DELETE /api/v1/students/{id}` – o'chirish (JWT)
- `GET /api/v1/students/export.csv` – CSV eksport (public)
- `POST /api/v1/students/import` – CSV import (JWT, multipart/form-data, field: `file`)

### Query parametrlari (ro'yxat)
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `sort` (misol: `full_name,-enrollment_year`)
- `faculty`, `group`, `status` (`active|graduated|expelled|academic_leave`)
- `search` (ism/email bo'yicha qidiruv)

## Auth (JWT)
- Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
Javobdagi `access_token`ni Swagger “Authorize”ga tokenning o'zi ko'rinishida kiriting (`eyJ...`). Protected endpointlarda `Authorization: Bearer <token>` ishlatiladi.

## CRUD cURL namunalar
- Yaratish:
```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
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
- Ro'yxat:
```bash
curl "http://localhost:3000/api/v1/students?page=1&limit=10&sort=full_name,-enrollment_year"
```

## CSV Export
- Brauzer: `http://localhost:3000/api/v1/students/export.csv?faculty=Engineering&sort=full_name`
- Curl:
```bash
curl -L "http://localhost:3000/api/v1/students/export.csv?search=ali&status=active&sort=full_name" -o students.csv
```

## CSV Import
- CSV sarlavhalari: `full_name,faculty,group,email,phone,birth_date,enrollment_year,status`
- Sana formati: `YYYY-MM-DD`
- Status: `active|graduated|expelled|academic_leave`
- Swagger: `POST /api/v1/students/import` → form-data `file`
- Curl:
```bash
curl -X POST "http://localhost:3000/api/v1/students/import" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@\"d:/Software Engineering/Talabalar ro'yhati API/namuna.sample.csv\""
```

## Testlar
- Ishga tushirish:
```bash
npm test
```
- Watch rejimi:
```bash
npm run test:watch
```
- Test fayllari: `tests/`
  - `auth.test.ts` – login
  - `students.test.ts` – CRUD, pagination/filter/sort, export, import
- Jest config: `jest.config.ts`

## Loyiha tuzilmasi (asosiy)
```
src/
  app.ts
  server.ts
  config/env.ts
  controllers/students.controller.ts
  middlewares/
    auth.ts
    errorHandler.ts
    upload.ts
  repositories/students.repo.ts
  routes/
    students.route.ts
    auth.route.ts
    health.route.ts
  schemas/student.schema.ts
  services/students.service.ts
  utils/pagination.ts
openapi.yaml
```

## Xavfsizlik va cheklovlar
- Helmet + CORS yoqilgan
- Import CSV: 5MB limit, faqat CSV
- Protected endpointlar: JWT talab qiladi

## Foydali maslahatlar
- Swagger “Authorize” oynasiga tokenni faqat `eyJ...` ko'rinishida kiriting (prefikssiz). Swagger `Bearer`ni o'zi qo'shadi.
- `.env`dagi `JWT_SECRET` o'zgarsa, eski tokenlar yaroqsiz bo'ladi – yangi token oling.

## Litsenziya
MIT
trigger: Wed, Oct 22, 2025 11:34:01 AM
ci: re-run Wed, Oct 22, 2025 11:37:46 AM
ci: re-run Wed, Oct 22, 2025 11:44:30 AM
ci: re-run Wed, Oct 22, 2025  7:45:58 PM

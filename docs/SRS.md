# Software Requirements Specification (SRS)

## 1. Purpose
Talabalar Ro'yhati API: talabalarning ma'lumotlarini boshqarish (CRUD), qidirish, filtrlash, CSV import/eksport va API hujjatlari bilan ta'minlash.

## 2. Scope
- HTTP REST API (JSON) + CSV eksport/import
- Swagger (OpenAPI) hujjatlari
- Admin autentifikatsiya (JWT)

## 3. Definitions
- Student: `id, full_name, faculty, group, email?, phone?, birth_date, enrollment_year, status, created_at, updated_at`
- Status: `active|graduated|expelled|academic_leave`

## 4. Stakeholders
- Admin/Operator: CRUD, import/export
- Developer: Integratsiya va avtomatlashtirish

## 5. Functional Requirements
- Students
  - Create: POST `/api/v1/students` (JWT)
  - Read: GET `/api/v1/students`, GET `/api/v1/students/{id}`
  - Update: PATCH `/api/v1/students/{id}` (JWT)
  - Delete: DELETE `/api/v1/students/{id}` (JWT)
  - List: pagination (`page,limit`), filtering (`faculty,group,status,search`), sorting (`sort` multi-field, `-` desc)
- CSV
  - Export: GET `/api/v1/students/export.csv` (public)
  - Import: POST `/api/v1/students/import` (multipart/form-data, `file`, JWT)
- Auth
  - Login: POST `/api/v1/auth/login` → `access_token`
- Health & Root
  - GET `/` (status), GET `/health`

## 6. Non-Functional Requirements
- Security: JWT, Helmet, CORS (origin whitelisting configurable)
- Validation: Zod schemas, descriptive errors
- Observability: Pino logging
- Performance: Pagination, indexed fields (recommendation)
- Reliability: Prisma, PostgreSQL, migrations
- Compatibility: Node 18+, Postgres 13+
- Testability: Jest + Supertest integration tests

## 7. Constraints
- `.env` orqali konfiguratsiya
- OpenAPI 3.1.0

## 8. Acceptance Criteria
- Swagger’da barcha endpointlar mavjud va ishlaydi
- CRUD va import/export integration testlari o‘tadi
- JWT bilan protected endpointlar ishlaydi
- CSV import uchun xato qatorlari aniq qaytariladi

## 9. Risks
- Katta CSV fayllar: oqim/queue talab qilishi mumkin
- E-mail unique siyosati: biznes qoidalari kelishilishi kerak

## 10. Dependencies
- Express, Prisma, PostgreSQL, Zod, Swagger-UI, Multer, csv-parse, jsonwebtoken

# User Manual

## 1. Kirish
Bu qo'llanma Talabalar Ro'yhati API dan foydalanishni bosqichma-bosqich tushuntiradi.

## 2. Talablar
- Node.js 18+
- PostgreSQL 13+

## 3. O'rnatish va Konfiguratsiya
1) `npm install`
2) `.env` yarating (yoki `.env.example`dan nusxa):
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/talabalar?schema=public
JWT_SECRET=dev_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```
3) Prisma:
```
npm run prisma:generate
npm run prisma:migrate
```
4) Ishga tushirish: `npm run dev`

## 4. Swagger API hujjatlari
- URL: `http://localhost:3000/api-docs`
- Bearer auth (JWT): “Authorize” tugmasiga tokenning o'zini (`eyJ...`) kiriting.

## 5. Login (Token olish)
- Endpoint: `POST /api/v1/auth/login`
- Body:
```json
{ "username": "admin", "password": "admin123" }
```
- Javob: `{ "access_token": "...", "token_type": "Bearer" }`

## 6. CRUD amallar
- **Create**: `POST /api/v1/students` (JWT)
- **List**: `GET /api/v1/students` (public)
  - Query: `page, limit, sort, faculty, group, status, search`
- **Get by id**: `GET /api/v1/students/{id}` (public)
- **Update**: `PATCH /api/v1/students/{id}` (JWT)
- **Delete**: `DELETE /api/v1/students/{id}` (JWT)

## 7. CSV Export
- `GET /api/v1/students/export.csv` (public)
- Filtr va sort querylari qo'llanadi.

## 8. CSV Import
- `POST /api/v1/students/import` (JWT)
- Form-data: `file` maydoniga CSV fayl.
- CSV headerlari:
```
full_name,faculty,group,email,phone,birth_date,enrollment_year,status
```
- Sana: `YYYY-MM-DD`
- Status: `active|graduated|expelled|academic_leave`

## 9. Muammolarni bartaraf etish
- **401 Invalid token**: Swagger “Authorize”ga tokenni `eyJ...` ko'rinishida kiriting; headerda “Bearer ” ikki marta ketmasin.
- **Swagger yangilanmasligi**: `openapi.yaml` o'zgargach serverni qayta ishga tushiring.
- **Import xatolari**: Javobda `errors[{row,message}]` bo'limini ko'ring; CSV faqat `.csv`, 5MB limit.

## 10. Testlar
- Ishga tushirish: `npm test`
- CRUD + Auth + Import/Export testlari: `tests/`

## 11. Qo'shimcha
- Health: `GET /health`
- Root: `GET /`

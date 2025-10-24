# ⚡ Quick Setup - New Features

## 🚀 5 Daqiqada Ishga Tushirish

### 1. Dependencies O'rnatish ✅ (Bajarildi)

```bash
npm install
```

Dependencies:
- ✅ `nodemailer` - Email
- ✅ `sharp` - Image processing
- ✅ Grafana & Prometheus (Docker)

---

### 2. Prisma Migration

```bash
npx prisma generate
npx prisma migrate deploy
```

Bu `profile_picture` fieldini qo'shadi.

---

### 3. .env Sozlash

`.env` fayliga qo'shing:

```env
# File Upload
UPLOAD_DIR=./uploads/profiles

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Demo mode - hozircha kerak emas)
SMS_PROVIDER=demo
```

---

### 4. Uploads Papka Yarating

```bash
mkdir -p uploads/profiles
```

Yoki Windows'da:
```bash
mkdir uploads
mkdir uploads\profiles
```

---

### 5. Docker Rebuild

```bash
docker compose down
docker compose build
docker compose up -d
```

---

### 6. Grafana Ishga Tushirish (Optional)

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

**Access:**
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090

---

## 🧪 Test Qilish

### 1. Email Test (Console Log)

Swagger UI'da student yarating - console'da email demo ko'rinadi:
```
[EMAIL DEMO] Would send welcome email to: student@example.com
```

### 2. SMS Test (Console Log)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SMS SENT (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: +998901234567
Message: Welcome!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Profile Picture Upload

```bash
POST /api/v1/students/:id/profile-picture
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
  picture: [select file]
```

### 4. Grafana Dashboard

1. Open: http://localhost:3001
2. Login: admin / admin123
3. Explore → Prometheus
4. Query: `http_requests_total`

---

## ✅ Checklist

- [x] npm install
- [ ] npx prisma generate
- [ ] npx prisma migrate deploy
- [ ] .env faylga yangi variables qo'shish
- [ ] uploads papka yaratish
- [ ] Docker rebuild
- [ ] Grafana start (optional)

---

## 📚 To'liq Documentation

- **[NEW_FEATURES.md](NEW_FEATURES.md)** - Barcha yangi funksiyalar
- **[README.md](../README.md)** - Asosiy documentation

---

**5 DAQIQADA TAYYOR!** 🚀

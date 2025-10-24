# Troubleshooting Guide

Bu qo'llanma tez-tez uchraydigan muammolar va ularning yechimlarini o'z ichiga oladi.

## Umumiy Muammolar

### 1. API Ishga Tushmayapti

**Alomatlar:**
- Docker container ishlamayapti
- API endpoints javob bermayapti

**Diagnostika:**
```bash
# Container statusini tekshirish
docker ps -a

# Logs ko'rish
docker logs talabalar_api

# Container ichida tizimni tekshirish
docker exec -it talabalar_api sh
```

**Yechimlar:**

**1.1 Port Band Bo'lgan**
```bash
# Port 3000 bandligini tekshirish
netstat -tulpn | grep 3000
lsof -i :3000

# Yechim: Boshqa portdan foydalaning
# .env faylda PORT o'zgartiring
```

**1.2 Database Connection Xatolik**
```bash
# Database container ishlaganini tekshirish
docker ps | grep talabalar_db

# Database'ga ulanishni tekshirish
docker exec talabalar_db pg_isready -U postgres

# Yechim: DATABASE_URL to'g'riligini tekshiring
```

**1.3 Dependencies O'rnatilmagan**
```bash
# Container ichida dependencies tekshirish
docker exec talabalar_api ls node_modules

# Yechim: Rebuild qiling
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. Database Migration Muammolari

**Alomatlar:**
- "Table does not exist" xatolik
- "Column not found" xatolik

**Diagnostika:**
```bash
# Migrations holatini tekshirish
docker exec talabalar_api npx prisma migrate status
```

**Yechimlar:**

**2.1 Migration Qo'llash**
```bash
# Migrations'ni qo'llash
docker exec talabalar_api npx prisma migrate deploy

# Agar ishlamasa, Prisma client regenerate qiling
docker exec talabalar_api npx prisma generate
```

**2.2 Database Corrupted**
```bash
# Database reset (DIQQAT: barcha ma'lumotlar o'chadi!)
docker-compose down -v
docker-compose up -d

# Yoki backup'dan restore qiling
npm run restore:db backups/backup-file.sql
```

### 3. Authentication Muammolari

**Alomatlar:**
- "Unauthorized" xatolik
- Token yaroqsiz

**Yechimlar:**

**3.1 JWT Secret O'zgargan**
```bash
# .env faylda JWT_SECRET tekshiring
# Eski tokenlar ishlamaydi - yangi login qiling
```

**3.2 Token Expired**
```bash
# Default: 2 soat
# Yechim: Yangi token oling
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

**3.3 Basic Auth (Swagger)**
```bash
# Swagger ochilmasa, .env'da username/password tekshiring
SWAGGER_USERNAME=your_username
SWAGGER_PASSWORD=your_password
```

### 4. Performance Muammolari

**Alomatlar:**
- Sekin response time
- High CPU/Memory usage

**Diagnostika:**
```bash
# Resource usage
docker stats talabalar_api

# Slow queries
docker logs talabalar_api | grep "slow"
```

**Yechimlar:**

**4.1 Database Indexing**
```sql
-- PostgreSQL'da index qo'shish
CREATE INDEX idx_students_faculty ON "Student"(faculty);
CREATE INDEX idx_students_group ON "Student"("group");
CREATE INDEX idx_students_status ON "Student"(status);
```

**4.2 Container Resource Limits**
```yaml
# docker-compose.yml'da limit qo'shish
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
```

**4.3 Connection Pooling**
```typescript
// src/repositories/students.repo.ts
// Prisma automatically handles connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20'
    }
  }
});
```

### 5. Rate Limiting Muammolari

**Alomatlar:**
- "Too many requests" xatolik
- 429 status code

**Yechimlar:**

**5.1 Rate Limit Settings**
```typescript
// src/middlewares/rateLimiter.ts
// Limit'larni o'zgartiring
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200 // Increase from 100
});
```

**5.2 IP Whitelist**
```typescript
// src/middlewares/rateLimiter.ts
export const apiLimiter = rateLimit({
  skip: (req) => {
    // Internal requests bypass rate limiting
    return req.ip === '127.0.0.1' || req.ip === '::1';
  }
});
```

### 6. CSV Import/Export Muammolari

**Alomatlar:**
- CSV import ishlamayapti
- Format xatolik

**Yechimlar:**

**6.1 File Size Limit**
```typescript
// src/middlewares/upload.ts
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Increase to 10MB
  }
});
```

**6.2 CSV Format**
```csv
# To'g'ri format
full_name,faculty,group,email,phone,birth_date,enrollment_year,status
Ali Valiyev,Engineering,SE-21,ali@example.com,+998901234567,2003-05-17,2021,active
```

**6.3 Encoding Muammosi**
```bash
# UTF-8 encoding tekshirish
file -i your_file.csv

# Agar kerak bo'lsa, convert qiling
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

### 7. Docker Muammolari

**7.1 Container Restart Loop**
```bash
# Logs'ni ko'rish
docker logs --tail 100 talabalar_api

# Common causes:
# - Port conflict
# - Missing environment variables
# - Database not ready
```

**7.2 Volume Permission Issues**
```bash
# Permission fix
sudo chown -R $USER:$USER ./backups
sudo chmod -R 755 ./backups
```

**7.3 Network Issues**
```bash
# Docker network tekshirish
docker network ls
docker network inspect talabalarroyhatiapi_default

# Network reset
docker-compose down
docker network prune
docker-compose up -d
```

### 8. Nginx Muammolari

**8.1 502 Bad Gateway**
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Common causes:
# - API container not running
# - Wrong proxy_pass address
# - Firewall blocking

# Test Nginx config
sudo nginx -t
```

**8.2 SSL Certificate Issues**
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Check SSL config
openssl s_client -connect api.yourdomain.com:443
```

### 9. Backup/Restore Muammolari

**9.1 Backup Fails**
```bash
# Check pg_dump installation
which pg_dump

# Check permissions
ls -la /backups

# Manual backup
docker exec talabalar_db pg_dump -U postgres talabalar > backup.sql
```

**9.2 Restore Fails**
```bash
# Check backup file
file backup.sql

# Manual restore
docker exec -i talabalar_db psql -U postgres talabalar < backup.sql

# If database locked
docker-compose down
docker-compose up -d db
# Wait for DB to be ready
npm run restore:db
```

### 10. Monitoring va Logging

**10.1 Logs Ko'rish**
```bash
# API logs
docker logs -f talabalar_api

# Database logs
docker logs -f talabalar_db

# Nginx logs
sudo tail -f /var/log/nginx/talabalar-api.access.log
sudo tail -f /var/log/nginx/talabalar-api.error.log

# System logs
sudo journalctl -u docker -f
```

**10.2 Metrics Endpoint**
```bash
# Prometheus metrics
curl http://localhost:3000/metrics

# Health check
curl http://localhost:3000/health
```

### 11. Environment Variables

**11.1 Missing Variables**
```bash
# Check loaded variables
docker exec talabalar_api printenv

# Reload after .env change
docker-compose down
docker-compose up -d
```

**11.2 Variable Priority**
```
1. Shell environment
2. .env file
3. Default values in code
```

## Debugging Tips

### Enable Verbose Logging
```typescript
// src/config/env.ts
export const env = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug'
};
```

### Database Query Logging
```typescript
// src/repositories/students.repo.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Request Tracing
Har bir request X-Request-ID header'iga ega. Bu ID'ni logs'da qidirishingiz mumkin:

```bash
docker logs talabalar_api | grep "requestId-123"
```

## Common Error Codes

| Code | Ma'nosi | Yechim |
|------|---------|--------|
| 400  | Bad Request | Request body/query parameters tekshiring |
| 401  | Unauthorized | Token tekshiring yoki login qiling |
| 403  | Forbidden | Permission yo'q |
| 404  | Not Found | URL yoki ID tekshiring |
| 429  | Too Many Requests | Rate limit kutib turing |
| 500  | Internal Server Error | Logs'ni ko'ring |
| 502  | Bad Gateway | API container ishlamayapti |
| 503  | Service Unavailable | Database yoki dependency ishlamayapti |

## Yordam Olish

Agar muammo hal bo'lmasa:

1. **Logs to'plang**
   ```bash
   docker logs talabalar_api > api.log 2>&1
   docker logs talabalar_db > db.log 2>&1
   ```

2. **System info to'plang**
   ```bash
   docker version > system-info.txt
   docker-compose version >> system-info.txt
   docker ps -a >> system-info.txt
   ```

3. **GitHub Issue oching**
   - Error logs
   - System info
   - Reproduction steps

## Foydali Komandalar

```bash
# Full restart
docker-compose down && docker-compose up -d --build

# Clean restart (WARNING: deletes data!)
docker-compose down -v && docker-compose up -d

# Database shell
docker exec -it talabalar_db psql -U postgres -d talabalar

# API shell
docker exec -it talabalar_api sh

# Check disk space
df -h

# Check memory
free -h

# Check Docker disk usage
docker system df
```

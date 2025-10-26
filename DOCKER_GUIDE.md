# 🐳 DOCKER DEPLOYMENT GUIDE

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+
- 4GB RAM minimum
- 10GB free disk space

---

## 🚀 Quick Start

### 1. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 2. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3002 | admin / Admin@123456 |
| **Backend API** | http://localhost:3000 | - |
| **Swagger** | http://localhost:3000/api-docs | swagger / swagger123 |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **PostgreSQL** | localhost:5432 | postgres / postgres |

### 3. Initialize Database

```bash
# Run migrations
docker exec -it talabalar_api npm run prisma:migrate

# Seed admin user
docker exec -it talabalar_api npx tsx prisma/seed-admin.ts
```

---

## 📦 Services

### **db (PostgreSQL)**
- Image: postgres:15-alpine
- Port: 5432
- Database: talabalar
- User: postgres
- Password: postgres

### **api (Backend)**
- Port: 3000
- Framework: Express + TypeScript
- Features: JWT auth, CSV import/export, Swagger

### **frontend (Next.js)**
- Port: 3002
- Framework: Next.js 16 + TypeScript
- Features: Admin panel, student management

### **prometheus (Monitoring)**
- Port: 9090
- Metrics collection

### **grafana (Dashboard)**
- Port: 3001
- Visualization and monitoring

---

## 🛠️ Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100
```

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### Execute Commands in Container

```bash
# Backend shell
docker exec -it talabalar_api sh

# Frontend shell
docker exec -it talabalar_frontend sh

# Database shell
docker exec -it talabalar_db psql -U postgres -d talabalar

# Run migrations
docker exec -it talabalar_api npm run prisma:migrate

# Create backup
docker exec -it talabalar_api npm run backup:db
```

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file or use environment variables:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=talabalar

# Backend
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123456

# Swagger
SWAGGER_USERNAME=swagger
SWAGGER_PASSWORD=swagger123

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Ports

Modify `docker-compose.yml` to change ports:

```yaml
services:
  frontend:
    ports:
      - "8080:3002"  # Change 8080 to your desired port
```

---

## 📊 Monitoring

### Prometheus Metrics

Visit: http://localhost:9090

**Sample Queries:**
```promql
# Request duration
http_request_duration_seconds

# Total requests
http_requests_total

# Active connections
active_connections
```

### Grafana Dashboards

Visit: http://localhost:3001

**Default credentials:**
- Username: admin
- Password: admin123

---

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service_name

# Check if port is in use
netstat -ano | findstr :3002

# Remove old containers
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Frontend Can't Connect to Backend

```bash
# Check API is running
curl http://localhost:3000/health

# Check Docker network
docker network inspect talabalar-royhati-api_default

# Verify environment variables
docker exec talabalar_frontend env | grep NEXT_PUBLIC_API_URL
```

### Out of Memory

```bash
# Check container memory usage
docker stats

# Increase Docker Desktop memory limit:
# Settings → Resources → Memory → Increase to 4GB+
```

---

## 🗄️ Database Backup & Restore

### Backup

```bash
# Manual backup
docker exec talabalar_db pg_dump -U postgres talabalar > backup.sql

# Or use backup script
docker exec -it talabalar_api npm run backup:db
```

### Restore

```bash
# From SQL file
docker exec -i talabalar_db psql -U postgres talabalar < backup.sql

# Or use restore script
docker exec -it talabalar_api npm run restore:db backup-file.sql
```

---

## 🚀 Production Deployment

### Build for Production

```bash
# Set production environment
export NODE_ENV=production

# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Security Best Practices

1. **Change default passwords** in `.env`
2. **Use secrets management** for sensitive data
3. **Enable SSL/TLS** with reverse proxy (Nginx/Traefik)
4. **Limit exposed ports** (close unnecessary ports)
5. **Regular backups** (automated daily backups)
6. **Update images** regularly for security patches

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Restart services: `docker-compose restart`
4. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

**Last Updated:** 2025-10-26
**Status:** ✅ Production Ready

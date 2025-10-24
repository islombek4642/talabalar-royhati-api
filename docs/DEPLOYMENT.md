# Production Deployment Guide

Bu qo'llanma loyihani production muhitiga deploy qilish uchun to'liq yo'riqnoma.

## Talablar

### Server
- Ubuntu 20.04+ yoki CentOS 7+
- Minimum 2GB RAM
- 20GB disk space
- Docker va Docker Compose o'rnatilgan
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt tavsiya etiladi)

### Ports
- 80 (HTTP)
- 443 (HTTPS)
- 22 (SSH)
- 5432 (PostgreSQL - faqat internal)

## 1. Server Tayyorlash

### Docker O'rnatish

```bash
# Update packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

### PostgreSQL Client O'rnatish (Backup uchun)

```bash
sudo apt-get install -y postgresql-client
```

## 2. Loyihani Clone Qilish

```bash
cd /var/www
sudo git clone https://github.com/islombek4642/talabalar-royhati-api.git
cd talabalar-royhati-api
```

## 3. Environment Variables

`.env` fayl yarating:

```bash
sudo nano .env
```

Quyidagi konfiguratsiyani kiriting:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD_HERE@db:5432/talabalar?schema=public"
JWT_SECRET=GENERATE_STRONG_SECRET_HERE
ADMIN_USERNAME=admin
ADMIN_PASSWORD=GENERATE_STRONG_PASSWORD_HERE
SWAGGER_USERNAME=swagger_admin
SWAGGER_PASSWORD=GENERATE_STRONG_PASSWORD_HERE
BACKUP_DIR=/backups
ENABLE_METRICS=true
```

**MUHIM**: 
- `STRONG_PASSWORD_HERE` o'rniga kuchli parollar kiriting
- `GENERATE_STRONG_SECRET_HERE` uchun `openssl rand -hex 32` ishlatishingiz mumkin

## 4. Docker Compose Sozlash

Production uchun `docker-compose.prod.yml` yarating:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: talabalar_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: talabalar
    volumes:
      - db_data:/var/lib/postgresql/data
      - /backups:/backups
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  api:
    image: ghcr.io/islombek4642/talabalar-royhati-api:latest
    container_name: talabalar_api
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_USERNAME: ${ADMIN_USERNAME}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      SWAGGER_USERNAME: ${SWAGGER_USERNAME}
      SWAGGER_PASSWORD: ${SWAGGER_PASSWORD}
      ENABLE_METRICS: "true"
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - internal

volumes:
  db_data:

networks:
  internal:
    driver: bridge
```

## 5. Deploy Qilish

```bash
# Pull latest image
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 6. Nginx Sozlash

### Nginx O'rnatish

```bash
sudo apt-get install -y nginx
```

### Nginx Config

`/etc/nginx/sites-available/talabalar-api` yarating:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting (optional - API'da ham bor)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Logging
    access_log /var/log/nginx/talabalar-api.access.log;
    error_log /var/log/nginx/talabalar-api.error.log;
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/talabalar-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

## 8. Backup Sozlash

### Cron Job Qo'shish

```bash
sudo crontab -e
```

Quyidagini qo'shing:

```cron
# Daily backup at 2 AM
0 2 * * * cd /var/www/talabalar-royhati-api && node scripts/backup-db.js >> /var/log/backup.log 2>&1

# Weekly cleanup of old backups
0 3 * * 0 find /backups -name "backup-*.sql" -mtime +30 -delete
```

## 9. Monitoring Sozlash

### Prometheus (Ixtiyoriy)

`prometheus.yml` yarating:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'talabalar-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### Logs Ko'rish

```bash
# API logs
docker-compose -f docker-compose.prod.yml logs api -f

# Nginx logs
sudo tail -f /var/log/nginx/talabalar-api.access.log
sudo tail -f /var/log/nginx/talabalar-api.error.log

# System logs
sudo journalctl -u docker -f
```

## 10. Rollback Strategy

### Oldingi Versiyaga Qaytish

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Pull specific version
export IMAGE_TAG=sha-abc123  # Replace with desired commit SHA
docker-compose -f docker-compose.prod.yml pull

# Start
docker-compose -f docker-compose.prod.yml up -d
```

## 11. Health Checks

```bash
# API health
curl https://api.yourdomain.com/health

# Metrics
curl https://api.yourdomain.com/metrics

# Database connection
docker exec talabalar_db pg_isready -U postgres
```

## 12. Security Checklist

- [ ] Strong passwords for all services
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (ufw)
- [ ] SSH key-based authentication only
- [ ] Docker containers run as non-root (where possible)
- [ ] Rate limiting enabled
- [ ] Swagger UI protected with basic auth
- [ ] Regular backups configured
- [ ] Monitoring and alerting set up
- [ ] Logs rotated and archived
- [ ] Database exposed only internally
- [ ] API exposed only through Nginx reverse proxy

## 13. Firewall Sozlash

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## 14. Performance Tuning

### Nginx Worker Processes

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
```

### Docker Resource Limits

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting

Muammolar yuzaga kelsa, `TROUBLESHOOTING.md` faylga qarang.

## Updates

```bash
# Pull latest code
cd /var/www/talabalar-royhati-api
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

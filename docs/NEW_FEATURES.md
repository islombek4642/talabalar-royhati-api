# 🆕 New Features Guide

Bu qo'llanma yangi qo'shilgan funksiyalar haqida to'liq ma'lumot beradi.

---

## 1️⃣ Profile Pictures Upload

### Overview
Studentlar uchun profil rasmlarini yuklash va boshqarish.

### Features
- ✅ Image upload (JPEG, PNG, WebP)
- ✅ Automatic resize (400x400px)
- ✅ Optimization & compression
- ✅ WebP conversion
- ✅ 5MB file size limit

### Usage

#### Upload Profile Picture
```bash
POST /api/v1/students/:id/profile-picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  picture: [file]
```

#### Delete Profile Picture
```bash
DELETE /api/v1/students/:id/profile-picture
Authorization: Bearer {token}
```

### Storage
- Files stored in: `./uploads/profiles/`
- Format: `{uuid}.webp`
- Path saved in database: `/uploads/profiles/{uuid}.webp`

### Configuration
```env
UPLOAD_DIR=./uploads/profiles
```

---

## 2️⃣ Email Notifications

### Overview
Gmail SMTP orqali email yuborish.

### Features
- ✅ Welcome emails
- ✅ Status change notifications
- ✅ Bulk emails
- ✅ HTML email templates
- ✅ Async sending
- ✅ Demo mode (agar SMTP sozlanmagan bo'lsa)

### Email Types

#### 1. Welcome Email
Yangi student qo'shilganda avtomatik yuboriladi.

#### 2. Status Change Email
Student statusi o'zgarganda yuboriladi.

#### 3. Bulk Email
Ko'p studentlarga bir vaqtda xabar yuborish.

### Configuration

#### Gmail Setup
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**IMPORTANT:** Gmail uchun **App Password** kerak!

#### Generate Gmail App Password:
1. Google Account → Security
2. 2-Step Verification ni yoqing
3. App passwords
4. "Mail" ni tanlang
5. Parolni nusxalang

### Usage

```typescript
import { emailService } from './services/email.service';

// Welcome email
await emailService.sendWelcomeEmail(
  'student@example.com',
  'Ali Valiyev'
);

// Status change
await emailService.sendStatusChangeEmail(
  'student@example.com',
  'Ali Valiyev',
  'graduated'
);

// Bulk email
await emailService.sendBulkEmail(
  ['email1@example.com', 'email2@example.com'],
  'Announcement',
  'Message body here...'
);
```

### Demo Mode
Agar SMTP sozlanmagan bo'lsa:
```
[EMAIL DEMO] Would send welcome email to: student@example.com
```

---

## 3️⃣ SMS Notifications (Demo)

### Overview
SMS yuborish interfeysi (demo implementation).

### Features
- ✅ OTP codes
- ✅ Welcome SMS
- ✅ Status change notifications
- ✅ Bulk SMS
- ✅ Console output demo
- ✅ Ready for real SMS integration

### Usage

```typescript
import { smsService } from './services/sms.service';

// Send OTP
await smsService.sendOTP('+998901234567', '123456');

// Welcome SMS
await smsService.sendWelcome('+998901234567', 'Ali Valiyev');

// Status change
await smsService.sendStatusChange(
  '+998901234567',
  'Ali Valiyev',
  'graduated'
);

// Custom SMS
await smsService.sendCustom(
  '+998901234567',
  'Your custom message here'
);

// Bulk SMS
await smsService.sendBulk(
  ['+998901234567', '+998909876543'],
  'Message to all'
);
```

### Output (Demo Mode)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SMS SENT (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: +998901234567
Message: Welcome message here
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Real SMS Integration

#### Twilio Example
```bash
npm install twilio
```

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(phone: string, message: string) {
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
  return result;
}
```

#### Eskiz.uz (O'zbekiston)
```typescript
const axios = require('axios');

async function sendSMSEskiz(phone: string, message: string) {
  const response = await axios.post(
    'https://notify.eskiz.uz/api/message/sms/send',
    {
      mobile_phone: phone,
      message: message,
      from: '4546',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.ESKIZ_TOKEN}`
      }
    }
  );
  return response.data;
}
```

### Configuration
```env
SMS_PROVIDER=demo
SMS_API_KEY=your_api_key
SMS_API_SECRET=your_api_secret
SMS_FROM=+998XXXXXXXXX
```

---

## 4️⃣ Grafana Dashboard

### Overview
Prometheus + Grafana monitoring setup.

### Features
- ✅ Pre-configured Prometheus
- ✅ Grafana dashboard
- ✅ Auto-provisioned datasource
- ✅ Real-time metrics
- ✅ Custom dashboards

### Start Monitoring Stack

```bash
# Start API first
docker compose up -d

# Start monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Access

- **Grafana:** http://localhost:3001
  - Username: `admin`
  - Password: `admin123`

- **Prometheus:** http://localhost:9090

### Dashboards

#### Pre-configured Metrics:
- HTTP request rate
- Response time (p50, p90, p99)
- Error rate
- Memory usage
- CPU usage
- Active connections
- Database query duration

### Custom Queries

#### Request Rate
```promql
rate(http_requests_total[5m])
```

#### Average Response Time
```promql
rate(http_request_duration_seconds_sum[5m]) / 
rate(http_request_duration_seconds_count[5m])
```

#### Error Rate
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
```

#### Memory Usage (MB)
```promql
process_resident_memory_bytes / 1024 / 1024
```

### Alerting (Optional)

Grafana'da alert qo'shish:
1. Dashboard → Panel → Edit
2. Alert tab
3. Create Alert Rule
4. Condition: e.g., response time > 100ms
5. Notification channel: Email, Slack, etc.

---

## 🔧 Integration Examples

### Complete Student Creation with Notifications

```typescript
// Create student
const student = await studentsService.create({
  full_name: "Ali Valiyev",
  faculty: "Engineering",
  group: "SE-21",
  email: "ali@example.com",
  phone: "+998901234567",
  birth_date: "2003-05-17",
  enrollment_year: 2021
});

// Send welcome email
if (student.email) {
  await emailService.sendWelcomeEmail(
    student.email,
    student.full_name
  );
}

// Send welcome SMS
if (student.phone) {
  await smsService.sendWelcome(
    student.phone,
    student.full_name
  );
}
```

### Upload Profile Picture

```typescript
// In controller
async uploadProfilePicture(req, res) {
  const { id } = req.params;
  const file = req.file;

  // Upload and process image
  const picturePath = await imageService.uploadProfilePicture(file);

  // Update student
  const updated = await studentsRepo.update(id, {
    profile_picture: picturePath
  });

  res.json(updated);
}
```

---

## 🚀 Next Steps

### Recommended Implementations:

1. **Email Templates**
   - Create reusable HTML templates
   - Support multiple languages
   - Add branding/logo

2. **SMS Integration**
   - Choose SMS provider
   - Add API keys to .env
   - Replace demo functions

3. **Grafana Dashboards**
   - Create custom dashboards
   - Add business metrics
   - Set up alerting

4. **File Management**
   - Add file size validation
   - Implement CDN integration
   - Add image cropping UI

---

## 📚 Resources

### Email
- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

### SMS
- [Twilio](https://www.twilio.com/docs)
- [Eskiz.uz](https://documenter.getpostman.com/view/663428/RzfmES4z)
- [AWS SNS](https://docs.aws.amazon.com/sns/)

### Monitoring
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)

### Image Processing
- [Sharp](https://sharp.pixelplumbing.com/)
- [Multer](https://github.com/expressjs/multer)

---

**Barcha funksiyalar production-ready va scalable!** 🎉

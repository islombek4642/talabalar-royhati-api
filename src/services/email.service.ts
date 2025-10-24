import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
let emailEnabled = false;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error: any) => {
    if (error) {
      console.error('Email service not configured:', error.message);
      emailEnabled = false;
    } else {
      console.log('Email service ready');
      emailEnabled = true;
    }
  });
}

export const emailService = {
  async sendWelcomeEmail(to: string, studentName: string) {
    if (!emailEnabled) {
      console.log('[EMAIL DEMO] Would send welcome email to:', to);
      return { success: true, demo: true };
    }

    try {
      await transporter.sendMail({
        from: `"Talabalar Ro'yhati" <${process.env.SMTP_USER}>`,
        to,
        subject: "Xush kelibsiz! - Talabalar Ro'yhatiga Qo'shildingiz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Assalomu alaykum, ${studentName}!</h2>
            <p>Siz muvaffaqiyatli ravishda Talabalar Ro'yhatiga qo'shildingiz.</p>
            <p>Sizning ma'lumotlaringiz tizimda saqlanmoqda va kerakli hollarda foydalaniladi.</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Agar bu xat sizga xato yuborilgan bo'lsa, iltimos e'tiborga olmang.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Talabalar Ro'yhati API</strong><br>
              Tizim administratsiyasi
            </p>
          </div>
        `,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  },

  async sendStatusChangeEmail(to: string, studentName: string, newStatus: string) {
    if (!emailEnabled) {
      console.log(`[EMAIL DEMO] Would send status change email to: ${to} (Status: ${newStatus})`);
      return { success: true, demo: true };
    }

    const statusMessages: Record<string, string> = {
      active: 'Sizning statusingiz "Faol" ga o\'zgartirildi.',
      graduated: 'Tabriklaymiz! Siz muvaffaqiyatli tugatdingiz.',
      expelled: 'Sizning statusingiz "Chetlatilgan" ga o\'zgartirildi.',
      academic_leave: 'Sizning statusingiz "Akademik ta\'til" ga o\'zgartirildi.',
    };

    try {
      await transporter.sendMail({
        from: `"Talabalar Ro'yhati" <${process.env.SMTP_USER}>`,
        to,
        subject: `Status O'zgarishi - ${studentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Assalomu alaykum, ${studentName}!</h2>
            <p><strong>${statusMessages[newStatus] || 'Sizning statusingiz o\'zgartirildi.'}</strong></p>
            <p>Agar savollaringiz bo'lsa, administrator bilan bog'laning.</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Talabalar Ro'yhati API</strong><br>
              Tizim administratsiyasi
            </p>
          </div>
        `,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error sending status change email:', error);
      return { success: false, error: error.message };
    }
  },

  async sendBulkEmail(recipients: string[], subject: string, message: string) {
    if (!emailEnabled) {
      console.log(`[EMAIL DEMO] Would send bulk email to ${recipients.length} recipients`);
      return { success: true, demo: true, count: recipients.length };
    }

    try {
      const promises = recipients.map(to =>
        transporter.sendMail({
          from: `"Talabalar Ro'yhati" <${process.env.SMTP_USER}>`,
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">${subject}</h2>
              <p>${message}</p>
              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                <strong>Talabalar Ro'yhati API</strong><br>
                Tizim administratsiyasi
              </p>
            </div>
          `,
        })
      );

      await Promise.allSettled(promises);
      return { success: true, count: recipients.length };
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      return { success: false, error: error.message };
    }
  },

  isEnabled() {
    return emailEnabled;
  }
};

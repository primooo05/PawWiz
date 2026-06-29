/**
 * Mailer Service — sends transactional OTP emails via Gmail SMTP (Nodemailer).
 * Transport is decoupled so it can be swapped to any SMTP provider without touching
 * business logic. Graceful degradation: if credentials are absent, logs the OTP
 * to the console instead (dev mode).
 *
 * Required env vars (injected via Infisical):
 *   GMAIL_USER         — sender Gmail address
 *   GMAIL_APP_PASSWORD — 16-char Google App Password (NOT the account password)
 */

import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../utils/winston.js';

class MailerService {
  private transporter: Transporter | null = null;

  constructor() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { type: 'LOGIN', user, pass },
      });
    } else {
      logger.warn(
        '[MailerService] GMAIL_USER or GMAIL_APP_PASSWORD not set — OTP emails will be skipped (dev mode).',
      );
    }
  }

  /**
   * Sends a 6-digit OTP email to the specified address.
   * Falls back to a console log when the transport is not configured.
   * Throws on delivery failure so the caller can surface the error appropriately.
   */
  async sendOtpEmail(to: string, ownerName: string, code: string): Promise<void> {
    if (!this.transporter) {
      logger.info(`[MailerService] OTP for ${to}: ${code} (printed because SMTP credentials are absent)`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"PawWiz" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'PawWiz Email Verification',
        html: this.buildTemplate(ownerName, code),
      });

      logger.info('[MailerService] OTP email accepted by provider', { messageId: info.messageId, to });
    } catch (err: unknown) {
      logger.error('[MailerService] Failed to send OTP email', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        to,
      });
      throw new Error(`OTP email delivery failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private buildTemplate(ownerName: string, code: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 8px;">Hey ${ownerName}! 🐾</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Here's your verification code to continue setting up your PawWiz account:
        </p>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">— Wiz the Cat 🐱</p>
      </div>
    `;
  }
}

/** Singleton */
export const mailerService = new MailerService();

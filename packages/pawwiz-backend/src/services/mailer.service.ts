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
   * Sends a password recovery email containing a time-bound reset link.
   * Falls back to a console log when the transport is not configured.
   * Throws on delivery failure so the caller can surface the error appropriately.
   */
  async sendRecoveryEmail(to: string, ownerName: string, resetLink: string): Promise<void> {
    if (!this.transporter) {
      // In dev mode without SMTP credentials, log a redacted indicator only —
      // never log the actual reset link (contains a bearer token) or the address.
      logger.info('[MailerService] Recovery email skipped — SMTP not configured (dev mode)', {
        recipient: '[redacted]',
      });
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"PawWiz" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'PawWiz — Reset Your Password',
        html: this.buildRecoveryTemplate(ownerName, resetLink),
      });

      // Log only the provider-assigned message ID, not the recipient address.
      logger.info('[MailerService] Recovery email accepted by provider', { messageId: info.messageId });
    } catch (err: unknown) {
      logger.error('[MailerService] Failed to send recovery email', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw new Error(`Recovery email delivery failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Sends a 6-digit OTP email to the specified address.
   * Falls back to a console log when the transport is not configured.
   * Throws on delivery failure so the caller can surface the error appropriately.
   */
  async sendOtpEmail(to: string, ownerName: string, code: string): Promise<void> {
    if (!this.transporter) {
      // Never log the actual OTP code — even in dev mode a leaked hash + plaintext
      // code bypasses the email-verification step entirely.
      logger.info('[MailerService] OTP email skipped — SMTP not configured (dev mode)', {
        recipient: '[redacted]',
      });
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"PawWiz" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'PawWiz Email Verification',
        html: this.buildTemplate(ownerName, code),
      });

      logger.info('[MailerService] OTP email accepted by provider', { messageId: info.messageId });
    } catch (err: unknown) {
      logger.error('[MailerService] Failed to send OTP email', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw new Error(`OTP email delivery failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private buildRecoveryTemplate(ownerName: string, resetLink: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 8px;">Hey ${ownerName}! 🐾</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          We received a request to reset your PawWiz password. Click the button below to set a new one:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}"
             style="background: #30c290; color: #ffffff; font-weight: 800; font-size: 16px; padding: 14px 32px; border-radius: 999px; text-decoration: none; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your account is still secure.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">— Wiz the Cat 🐱</p>
      </div>
    `;
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

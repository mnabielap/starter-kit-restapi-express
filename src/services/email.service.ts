import { config } from '../config/config';
import { logger } from '../config/logger';

/**
 * Send an email
 */
export const sendEmail = async (to: string, subject: string, text: string) => {
  const msg = { from: config.jwt.secret, to, subject, text }; // Dummy from
  // In a real app, use Nodemailer here.
  if (config.env !== 'test') {
    logger.info(`Sending email to ${to} with subject: ${subject}`);
    logger.debug(`Email content: ${text}`);
  }
};

/**
 * Send reset password email
 */
export const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `http://localhost:${config.port}/v1/auth/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (to: string, token: string) => {
  const subject = 'Email Verification';
  const verificationUrl = `http://localhost:${config.port}/v1/auth/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};
import nodemailer from 'nodemailer';

function getTransportConfig() {
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    };
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  return null;
}

export function isEmailConfigured() {
  return Boolean(getTransportConfig());
}

function createTransporter() {
  const transportConfig = getTransportConfig();

  if (!transportConfig) {
    throw new Error('SMTP configuration is missing');
  }

  return nodemailer.createTransport(transportConfig);
}

export async function sendVerificationEmail({ email, name, verificationUrl }) {
  const transporter = createTransporter();
  const fromEmail =
    process.env.SMTP_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER;

  if (!fromEmail) {
    throw new Error('Sender email is missing');
  }

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: 'Verify your CodeSense email',
    text: [
      `Hi ${name || 'there'},`,
      '',
      'Thanks for registering with CodeSense.',
      'Please verify your email by opening this link:',
      verificationUrl,
      '',
      'This link expires in 24 hours.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Verify your email</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Thanks for registering with CodeSense. Please confirm your email to activate your account.</p>
        <p>
          <a
            href="${verificationUrl}"
            style="display: inline-block; padding: 12px 20px; background: #0891b2; color: #ffffff; text-decoration: none; border-radius: 8px;"
          >
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

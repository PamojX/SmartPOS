// server/utils/mailer.js
const nodemailer = require('nodemailer');

const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('[MAILER] Missing EMAIL_USER or EMAIL_PASS. Emails will fail until set.');
}

const transporter = nodemailer.createTransport({
  // works for Gmail; or use host/port if you have custom SMTP
  host: SMTP_HOST || 'smtp.gmail.com',
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465, // true only for 465
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

async function assertMailerReady() {
  try {
    await transporter.verify();
    console.log('[MAILER] SMTP ready');
  } catch (err) {
    console.error('[MAILER] SMTP verify error:', err);
  }
}

async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    const e = new Error('No recipient provided');
    e.code = 'NO_RECIPIENT';
    throw e;
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html,
      text,
    });
    return info;
  } catch (err) {
    // Nice, actionable messages for common cases
    let msg = 'Failed to send email.';
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      msg = 'Email authentication failed. Check EMAIL_USER/EMAIL_PASS (use a Gmail App Password).';
    } else if (err.code === 'ENOTFOUND') {
      msg = 'SMTP host not found. Check SMTP_HOST / internet connection.';
    } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
      msg = 'Could not connect to SMTP server. Check host/port/firewall.';
    }
    const wrapped = new Error(msg);
    wrapped.cause = err;
    throw wrapped;
  }
}

module.exports = { sendEmail, assertMailerReady };

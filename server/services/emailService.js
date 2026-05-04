const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

function loadTemplate(name, vars = {}) {
  const file = path.join(__dirname, '..', 'templates', 'emails', `${name}.html`);
  let html = fs.readFileSync(file, 'utf8');
  for (const [k, v] of Object.entries(vars)) {
    html = html.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
  }
  return html;
}

async function send(to, subject, templateName, vars = {}) {
  if (!process.env.SMTP_HOST) {
    console.warn('[Email] SMTP no configurado. Skip:', subject);
    return null;
  }
  try {
    const html = loadTemplate(templateName, vars);
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@kronos.app',
      to, subject, html,
    });
    console.log('[Email] enviado:', info.messageId);
    return info;
  } catch (err) {
    console.error('[Email] error:', err.message);
    return null;
  }
}

module.exports = {
  sendWelcome: (to, name) =>
    send(to, 'Bienvenido a Kronos', 'welcome', { name }),
  sendPasswordReset: (to, name, link) =>
    send(to, 'Restablece tu contraseña', 'password-reset', { name, link }),
  sendOrderConfirmation: (to, name, orderId, total) =>
    send(to, `Orden ${orderId} confirmada`, 'order-confirmation', { name, orderId, total }),
  sendRefund: (to, name, orderId, amount) =>
    send(to, `Reembolso procesado - ${orderId}`, 'refund', { name, orderId, amount }),
};

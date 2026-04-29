const nodemailer = require('nodemailer');
require('dotenv').config();

const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Configuración para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarEmailVerificacion(email_destino, nombreUsuario, token, avatarIndex) {
  try {
    const emoji = emojisAvatares[avatarIndex] || '🐭';
    const urlVerificacion = `${BASE_URL}/usuarios/verificar/${token}`;

    await transporter.sendMail({
      from: `"La Ley del Gato" <${process.env.EMAIL_USER}>`,
      to: email_destino,
      subject: '🐭 Verifica tu cuenta — La Ley del Gato',
      html: `
        <div style="background:#080601; padding:30px; color:#c8a030; text-align:center; font-family:monospace;">
          <h1>BIENVENIDO AGENTE ${nombreUsuario}</h1>
          <div style="font-size:50px;">${emoji}</div>
          <p>Pulsa abajo para activar tu cuenta:</p>
          <a href="${urlVerificacion}" style="background:#c8a030; color:#000; padding:10px 20px; text-decoration:none; font-weight:bold;">VERIFICAR</a>
        </div>`
    });
    console.log("✅ Correo enviado a:", email_destino);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    throw error;
  }
}

async function enviarEmailRecuperacion(email_destino, nombreUsuario, token) {
  const urlRecuperacion = `${BASE_URL}/login/reset.html?token=${token}`;
  await transporter.sendMail({
    from: `"La Ley del Gato" <${process.env.EMAIL_USER}>`,
    to: email_destino,
    subject: '🔑 Recuperación — La Ley del Gato',
    html: `<p>Agente ${nombreUsuario}, pulsa aquí: ${urlRecuperacion}</p>`
  });
}

module.exports = { enviarEmailVerificacion, enviarEmailRecuperacion };
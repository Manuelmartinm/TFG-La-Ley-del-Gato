const nodemailer = require('nodemailer');
require('dotenv').config();

const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];
const BASE_URL = process.env.BASE_URL || 'https://tfg-la-ley-del-gato.onrender.com';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
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
        <div style="background:#080601; font-family:monospace; padding:40px; color:#c8a030; text-align:center;">
          <h1>LA LEY DEL GATO</h1>
          <div style="font-size:60px; margin:20px 0;">${emoji}</div>
          <p>Agente <strong>${nombreUsuario}</strong>, pulsa abajo:</p>
          <br>
          <a href="${urlVerificacion}" style="background:#c8a030; color:#080601; padding:15px 30px; text-decoration:none; font-weight:bold;">▶ VERIFICAR IDENTIDAD</a>
        </div>`
    });
    console.log("✅ Correo enviado a:", email_destino);
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
    throw error;
  }
}

async function enviarEmailRecuperacion(email_destino, nombreUsuario, token) {
  const urlRecuperacion = `${BASE_URL}/login/reset.html?token=${token}`;
  await transporter.sendMail({
    from: `"La Ley del Gato" <${process.env.EMAIL_USER}>`,
    to: email_destino,
    subject: '🔑 Recuperación — La Ley del Gato',
    html: `<p>Pulsa aquí: ${urlRecuperacion}</p>`
  });
}

module.exports = { enviarEmailVerificacion, enviarEmailRecuperacion };
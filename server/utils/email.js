const nodemailer = require('nodemailer');
require('dotenv').config();

// Lista de emojis para el correo
const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

// La URL base que usará el botón del correo (sacada de Render)
const BASE_URL = process.env.BASE_URL || 'https://tfg-la-ley-del-gato.onrender.com';

// CONFIGURACIÓN PARA GMAIL (Optimizado para Render)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Usa SSL para evitar bloqueos de puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // Esto evita errores de certificado en servidores externos
    rejectUnauthorized: false
  }
});

/**
 * FUNCIÓN: Envía el email de verificación
 */
async function enviarEmailVerificacion(email_destino, nombreUsuario, token, avatarIndex) {
  try {
    const emoji = emojisAvatares[avatarIndex] || '🐭';
    const urlVerificacion = `${BASE_URL}/usuarios/verificar/${token}`;

    console.log(`[EMAIL] Intentando enviar a: ${email_destino}`);

    const info = await transporter.sendMail({
      from: `"La Ley del Gato" <${process.env.EMAIL_USER}>`,
      to: email_destino,
      subject: '🐭 Verifica tu cuenta — La Ley del Gato',
      html: `
        <div style="background:#080601; font-family:monospace; padding:40px; color:#c8a030; text-align:center;">
          <h1 style="letter-spacing:5px;">LA LEY DEL GATO</h1>
          <div style="font-size:60px; margin:20px 0;">${emoji}</div>
          <p style="font-size:16px;">Agente <strong>${nombreUsuario}</strong>, tu registro ha sido detectado.</p>
          <p>Para activar tu acceso al sistema, pulsa el enlace inferior:</p>
          <br>
          <a href="${urlVerificacion}" style="background:#c8a030; color:#080601; padding:15px 30px; text-decoration:none; font-weight:bold; letter-spacing:2px; display:inline-block;">▶ VERIFICAR IDENTIDAD</a>
          <br><br>
          <p style="font-size:10px; color:#5a4418;">Si no has solicitado este acceso, ignora este mensaje.</p>
        </div>
      `
    });

    console.log("✅ [EMAIL] Correo enviado correctamente:", info.messageId);
  } catch (error) {
    console.error("❌ [EMAIL] Error enviando email:", error.message);
    throw error; // Lanzamos el error para que aparezca en los logs de Render
  }
}

/**
 * FUNCIÓN: Envía el email de recuperación
 */
async function enviarEmailRecuperacion(email_destino, nombreUsuario, token) {
  try {
    const urlRecuperacion = `${BASE_URL}/login/reset.html?token=${token}`;

    await transporter.sendMail({
      from: `"La Ley del Gato" <${process.env.EMAIL_USER}>`,
      to: email_destino,
      subject: '🔑 Recuperación — La Ley del Gato',
      html: `<h1>Hola ${nombreUsuario}</h1><p>Restablece tu contraseña aquí: <a href="${urlRecuperacion}">Enlace</a></p>`
    });
    console.log("✅ [EMAIL] Correo de recuperación enviado");
  } catch (error) {
    console.error("❌ [EMAIL] Error en recuperación:", error.message);
    throw error;
  }
}

module.exports = { enviarEmailVerificacion, enviarEmailRecuperacion };
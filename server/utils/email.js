const nodemailer = require('nodemailer'); // Importa nodemailer para enviar emails
require('dotenv').config(); // Carga las variables del .env

// Lista de emojis de avatares — tiene que coincidir con los del frontend
const emojisAvatares = ['🐭', '🐀', '🐹', '🦝', '🐱', '🦔'];

/* ---------------------------------------------------------
   Configuración del transportador de email
   Usa Gmail con las credenciales del .env
--------------------------------------------------------- */
const transportador = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email del .env
    pass: process.env.EMAIL_PASS  // Contraseña de aplicación del .env
  }
});

/* ---------------------------------------------------------
   FUNCIÓN: envía el email de verificación al usuario
   - email: dirección de correo del usuario
   - nombreUsuario: nombre de usuario elegido
   - token: token único de verificación
   - avatarIndex: índice del avatar elegido
--------------------------------------------------------- */
async function enviarEmailVerificacion(email, nombreUsuario, token, avatarIndex) {
  const emoji = emojisAvatares[avatarIndex] || '🐭'; // Obtiene el emoji del avatar
  const urlVerificacion = `${process.env.BASE_URL || 'http://localhost:3000'}/usuarios/verificar/${token}`;

  const opciones = {
    from: `"La Ley del Gato" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🐭 Verifica tu cuenta — La Ley del Gato',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { background: #080601; margin: 0; padding: 0; font-family: monospace; }
          .container { max-width: 500px; margin: 0 auto; padding: 2rem; }
          .header { text-align: center; border-bottom: 2px solid #c8a030; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
          .logo { color: #c8a030; font-size: 20px; letter-spacing: 4px; font-weight: bold; }
          .avatar { font-size: 64px; display: block; text-align: center; margin: 1rem 0; }
          .titulo { color: #e8c040; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 0.5rem 0; }
          .texto { color: #a07830; font-size: 14px; letter-spacing: 1px; line-height: 1.8; margin: 1rem 0; }
          .nombre { color: #e8c040; }
          .btn { display: block; background: #c8a030; color: #080601 !important; text-decoration: none; text-align: center; padding: 1rem 2rem; font-size: 14px; letter-spacing: 2px; font-weight: bold; margin: 1.5rem 0; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
          .footer { color: #3a2c10; font-size: 11px; text-align: center; letter-spacing: 2px; margin-top: 2rem; border-top: 1px solid #1e1803; padding-top: 1rem; }
          .aviso { color: #5a4418; font-size: 12px; letter-spacing: 1px; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LA LEY DEL GATO</div>
          </div>
          <span class="avatar">${emoji}</span>
          <div class="titulo">BIENVENIDO A LA RESISTENCIA</div>
          <div class="texto">
            Agente <span class="nombre">${nombreUsuario}</span>, tu registro ha sido recibido.<br><br>
            Para activar tu cuenta y acceder a todas las funcionalidades del sistema, necesitas verificar tu dirección de correo electrónico.
          </div>
          <a href="${urlVerificacion}" class="btn">▶ VERIFICAR MI CUENTA</a>
          <div class="aviso">
            Si no has creado esta cuenta, ignora este mensaje.<br>
            Este enlace caduca en 24 horas.
          </div>
          <div class="footer">
            LA LEY DEL GATO © 2025 — REMM STUDIO
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transportador.sendMail(opciones); // Envía el email
}

module.exports = { enviarEmailVerificacion };
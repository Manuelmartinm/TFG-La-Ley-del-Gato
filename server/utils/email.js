const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Lista de emojis de avatares — tiene que coincidir con los del frontend
const emojisAvatares = ['🐭', '🐀', '🐹', '🐁', '🦔', '🐿️'];

/* ---------------------------------------------------------
   FUNCIÓN: envía el email de verificación al usuario
--------------------------------------------------------- */
async function enviarEmailVerificacion(email, nombreUsuario, token, avatarIndex) {
  const emoji = emojisAvatares[avatarIndex] || '🐭';
  const urlVerificacion = `${process.env.BASE_URL || 'http://localhost:3000'}/usuarios/verificar/${token}`;

  await resend.emails.send({
    from: 'La Ley del Gato <onboarding@resend.dev>', // dominio por defecto de Resend (funciona sin configurar nada)
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
          .btn { display: block; background: #c8a030; color: #080601 !important; text-decoration: none; text-align: center; padding: 1rem 2rem; font-size: 14px; letter-spacing: 2px; font-weight: bold; margin: 1.5rem 0; }
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
            Para activar tu cuenta y acceder a todas las funcionalidades del sistema,
            necesitas verificar tu dirección de correo electrónico.
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
  });
}

/* ---------------------------------------------------------
   FUNCIÓN: envía el email de recuperación de contraseña
--------------------------------------------------------- */
async function enviarEmailRecuperacion(email, nombreUsuario, token) {
  const urlRecuperacion = `${process.env.BASE_URL || 'http://localhost:3000'}/usuarios/recuperar/${token}`;

  await resend.emails.send({
    from: 'La Ley del Gato <onboarding@resend.dev>',
    to: email,
    subject: '🔑 Recuperación de acceso — La Ley del Gato',
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
          .titulo { color: #e8c040; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 0.5rem 0; }
          .texto { color: #a07830; font-size: 14px; letter-spacing: 1px; line-height: 1.8; margin: 1rem 0; }
          .nombre { color: #e8c040; }
          .btn { display: block; background: #c8a030; color: #080601 !important; text-decoration: none; text-align: center; padding: 1rem 2rem; font-size: 14px; letter-spacing: 2px; font-weight: bold; margin: 1.5rem 0; }
          .footer { color: #3a2c10; font-size: 11px; text-align: center; letter-spacing: 2px; margin-top: 2rem; border-top: 1px solid #1e1803; padding-top: 1rem; }
          .aviso { color: #5a4418; font-size: 12px; letter-spacing: 1px; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LA LEY DEL GATO</div>
          </div>
          <div class="titulo">RECUPERACIÓN DE ACCESO</div>
          <div class="texto">
            Agente <span class="nombre">${nombreUsuario}</span>, hemos recibido una solicitud
            para restablecer tu contraseña.<br><br>
            Haz clic en el botón para crear una nueva contraseña.
          </div>
          <a href="${urlRecuperacion}" class="btn">▶ RESTABLECER CONTRASEÑA</a>
          <div class="aviso">
            Si no has solicitado esto, ignora este mensaje.<br>
            Este enlace caduca en 1 hora.
          </div>
          <div class="footer">
            LA LEY DEL GATO © 2025 — REMM STUDIO
          </div>
        </div>
      </body>
      </html>
    `
  });
}

module.exports = { enviarEmailVerificacion, enviarEmailRecuperacion };
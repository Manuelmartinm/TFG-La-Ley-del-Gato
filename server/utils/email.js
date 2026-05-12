async function enviarEmailVerificacion(email_destino, nombreUsuario, token, avatarIndex) {
  console.log(`✅ [SIMULACIÓN] Registro de ${nombreUsuario}. No se enviará correo a ${email_destino}.`);
  return true; // Le decimos al servidor que "todo ha ido bien"
}

/**
 * SIMULACIÓN: Envía el email de recuperación
 */
async function enviarEmailRecuperacion(email_destino, nombreUsuario, token) {
  console.log(`✅ [SIMULACIÓN] Recuperación solicitada para ${email_destino}. No se enviará correo real.`);
  return true;
}

module.exports = { enviarEmailVerificacion, enviarEmailRecuperacion };
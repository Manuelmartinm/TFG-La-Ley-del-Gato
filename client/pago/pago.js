const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

async function procesarPago() {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get('tipo');
    const pack_id = params.get('pack');
    const nombre_usuario = params.get('user');

    // 1. Espera visual (2 segundos para que parezca que hace algo)
    await new Promise(r => setTimeout(r, 2500));

    try {
        // 2. Llamamos al servidor para que actualice la DB de verdad
        const res = await fetch(`${API_URL}/pagos/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, pack_id, nombre_usuario })
        });
        const data = await res.json();

        if (res.ok) {
            document.getElementById('icon').textContent = '✅';
            document.getElementById('title').textContent = '¡ÉXITO!';
            document.getElementById('msg').textContent = data.mensaje;
            
            // Actualizar el localstorage para que el contador de arriba cambie al volver
            if (data.monedas_añadidas) {
                document.getElementById('monedasBox').textContent = `+${data.monedas_añadidas} CRÉDITOS`;
                document.getElementById('monedasBox').style.display = 'block';
                localStorage.setItem('monedas', data.monedas_totales);
            }
            if (data.tipo === 'premium') {
                localStorage.setItem('rol', 'PREMIUM');
            }
        } else {
            document.getElementById('icon').textContent = '❌';
            document.getElementById('title').textContent = 'ERROR';
            document.getElementById('msg').textContent = 'La red ha interceptado la transacción.';
        }
    } catch (e) {
        document.getElementById('msg').textContent = 'Error de conexión con el servidor.';
    }

    document.getElementById('btnVolver').style.display = 'block';
}

procesarPago();
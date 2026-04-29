/* =========================================================
   LA LEY DEL GATO — tienda.js
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';
let tabActiva  = 'normal';
let filtroActivo = 'todo';
let itemSeleccionado = null;

// Monedas
const monedas = parseInt(localStorage.getItem('monedas') || '0');
document.getElementById('coinsAmount').textContent = monedas.toLocaleString('es-ES');

/* ---------------------------------------------------------
   CATÁLOGO DE DEMO
--------------------------------------------------------- */
const catalogoDemo = [
  // Tienda normal
  { id:'1', nombre:'GABARDINA GRIS',    categoria:'SKIN',      rareza:'rare',      emoji:'🧥', precio_monedas:800,  precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:false, descripcion:'Una gabardina desgastada perfecta para desaparecer en la noche.' },
  { id:'2', nombre:'SOMBRERO FEDORA',   categoria:'COSMETICO', rareza:'epic',      emoji:'🎩', precio_monedas:1500, precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:false, descripcion:'El clásico sombrero de todo buen agente encubierto.' },
  { id:'3', nombre:'EXPLOSIVO C4',      categoria:'UTIL',      rareza:'rare',      emoji:'💣', precio_monedas:600,  precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:true,  descripcion:'Explosivo de alto rendimiento para misiones de sabotaje.', descripcion_efecto:'Destruye obstáculos en el nivel' },
  { id:'4', nombre:'GAFAS NOCTURNAS',   categoria:'UTIL',      rareza:'common',    emoji:'🥽', precio_monedas:300,  precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:true,  descripcion:'Visión nocturna básica. Equipamiento estándar de agente novato.', descripcion_efecto:'Ilumina zonas oscuras del nivel' },
  { id:'5', nombre:'MONÓCULO ESPÍA',    categoria:'COSMETICO', rareza:'rare',      emoji:'🔍', precio_monedas:900,  precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:false, descripcion:'Accesorio de espía de élite. Solo para los más sofisticados.' },
  { id:'6', nombre:'SILENCIADOR',       categoria:'UTIL',      rareza:'rare',      emoji:'🔇', precio_monedas:700,  precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:true,  descripcion:'Elimina el ruido de los pasos al moverse por superficies duras.', descripcion_efecto:'Reduce ruido de movimiento al mínimo' },
  { id:'7', nombre:'COFRE VACÍO',       categoria:'COSMETICO', rareza:'common',    emoji:'📦', precio_monedas:100,  precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:false, descripcion:'Un cofre vacío. Quizás contenga algo valioso algún día.' },
  { id:'8', nombre:'LLAVE MAESTRA',     categoria:'UTIL',      rareza:'epic',      emoji:'🗝️', precio_monedas:2000, precio_real:0,    es_catalogo_premium:false, activo:true, tiene_efecto:true,  descripcion:'Abre cualquier cerradura en el juego sin importar la seguridad.', descripcion_efecto:'Abre puertas bloqueadas sin tiempo de espera' },
  // Tienda premium
  { id:'9',  nombre:'QUESO DORADO',     categoria:'COSMETICO', rareza:'legendary', emoji:'🧀', precio_monedas:0,    precio_real:4.99, es_catalogo_premium:true,  activo:true, tiene_efecto:true,  descripcion:'Un queso legendario que emana un brillo dorado misterioso.', descripcion_efecto:'+15% de puntuación en cada nivel' },
  { id:'10', nombre:'DETECTOR GATOS',   categoria:'UTIL',      rareza:'legendary', emoji:'📡', precio_monedas:0,    precio_real:6.99, es_catalogo_premium:true,  activo:true, tiene_efecto:true,  descripcion:'Tecnología robada a los gatos. Detecta patrullas enemigas.', descripcion_efecto:'Revela posición de guardias en el mapa' },
  { id:'11', nombre:'SKIN MAFIOSO',     categoria:'SKIN',      rareza:'legendary', emoji:'🤵', precio_monedas:0,    precio_real:9.99, es_catalogo_premium:true,  activo:true, tiene_efecto:false, descripcion:'El traje de los grandes jefes. Respeto garantizado en el hampa.' },
  { id:'12', nombre:'CAPA INVISIBLE',   categoria:'SKIN',      rareza:'epic',      emoji:'👻', precio_monedas:0,    precio_real:3.99, es_catalogo_premium:true,  activo:true, tiene_efecto:true,  descripcion:'Una capa que difumina la silueta del ratón entre las sombras.', descripcion_efecto:'Reduce la detección un 30%' },
];

let catalogo = [...catalogoDemo];

/* ---------------------------------------------------------
   CARGAR CATÁLOGO DEL BACKEND
--------------------------------------------------------- */
async function cargarCatalogo() {
  try {
    const res = await fetch(`${API_URL}/tienda`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.catalogo?.length) catalogo = data.catalogo;
  } catch {}
  renderizarTienda();
}

/* ---------------------------------------------------------
   TABS NORMAL / PREMIUM
--------------------------------------------------------- */
document.querySelectorAll('.shop-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    tabActiva = tab.dataset.tab;
    itemSeleccionado = null;
    ocultarDetalle();
    renderizarTienda();
  });
});

/* ---------------------------------------------------------
   FILTROS
--------------------------------------------------------- */
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroActivo = btn.dataset.cat;
    renderizarTienda();
  });
});

/* ---------------------------------------------------------
   RENDERIZAR TIENDA
--------------------------------------------------------- */
function renderizarTienda() {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '';

  let items = catalogo.filter(i =>
    i.activo &&
    (tabActiva === 'premium' ? i.es_catalogo_premium : !i.es_catalogo_premium) &&
    (filtroActivo === 'todo' || i.categoria === filtroActivo)
  );

  document.getElementById('shopCount').textContent = items.length + ' ARTÍCULOS';

  if (!items.length) {
    grid.innerHTML = '<div class="shop-empty">SIN ARTÍCULOS DISPONIBLES</div>';
    return;
  }

  items.forEach((item, idx) => {
    const owned = false; // TODO: conectar con inventario real
    const el = document.createElement('div');
    el.className = `shop-item ${item.rareza}${owned ? ' owned' : ''}${itemSeleccionado?.id === item.id ? ' selected' : ''}`;
    el.style.animationDelay = (idx * 0.04) + 's';

    const precioHTML = item.precio_monedas > 0
      ? `<div class="shop-item-price">💰 ${item.precio_monedas.toLocaleString('es-ES')}</div>`
      : `<div class="shop-item-price-real">💶 ${item.precio_real.toFixed(2)}€</div>`;

    el.innerHTML = `
      <div class="shop-item-inner">
        ${item.es_catalogo_premium ? '<div class="shop-premium-badge">⭐ PRO</div>' : ''}
        ${owned ? '<div class="shop-owned-badge">OBTENIDO</div>' : ''}
        <div class="shop-item-emoji">${item.emoji}</div>
        <div class="shop-item-name">${item.nombre}</div>
        ${precioHTML}
      </div>
    `;
    el.addEventListener('click', () => seleccionarItem(item));
    grid.appendChild(el);
  });
}

/* ---------------------------------------------------------
   SELECCIONAR ITEM
--------------------------------------------------------- */
function seleccionarItem(item) {
  itemSeleccionado = item;
  renderizarTienda();

  const rarezaLabel = { common:'COMÚN', rare:'RARO', epic:'ÉPICO', legendary:'LEGENDARIO' };
  const catLabel    = { SKIN:'SKIN', UTIL:'ÚTIL', COSMETICO:'COSMÉTICO' };

  document.getElementById('buyEmpty').style.display   = 'none';
  document.getElementById('buyContent').style.display = 'block';
  document.getElementById('msgCompra').style.display  = 'none';

  document.getElementById('buyIcon').textContent = item.emoji;
  document.getElementById('buyName').textContent = item.nombre;
  document.getElementById('buyCat').textContent  = catLabel[item.categoria] || item.categoria;

  const rarEl = document.getElementById('buyRar');
  rarEl.textContent = '◆ ' + (rarezaLabel[item.rareza] || item.rareza).toUpperCase();
  rarEl.className   = 'buy-item-rar rar-' + item.rareza;

  document.getElementById('buyDesc').textContent = item.descripcion || '';

  const effectEl = document.getElementById('buyEffect');
  if (item.tiene_efecto && item.descripcion_efecto) {
    document.getElementById('buyEffectDesc').textContent = item.descripcion_efecto;
    effectEl.style.display = 'block';
  } else {
    effectEl.style.display = 'none';
  }

  // Precio monedas
  const priceCoinsEl = document.getElementById('buyPriceCoins');
  const priceRealEl  = document.getElementById('buyPriceReal');
  const btnBuy       = document.getElementById('btnBuy');
  const btnBuyReal   = document.getElementById('btnBuyReal');

  if (item.precio_monedas > 0) {
    document.getElementById('priceCoins').textContent = item.precio_monedas.toLocaleString('es-ES');
    priceCoinsEl.style.display = 'flex';
    btnBuy.style.display = 'block';
    btnBuy.disabled = monedas < item.precio_monedas;
    btnBuy.textContent = monedas < item.precio_monedas ? '▷ MONEDAS INSUFICIENTES' : '▶ COMPRAR';
  } else {
    priceCoinsEl.style.display = 'none';
    btnBuy.style.display = 'none';
  }

  if (item.precio_real > 0) {
    document.getElementById('priceReal').textContent = item.precio_real.toFixed(2);
    priceRealEl.style.display = 'flex';
    btnBuyReal.style.display = 'block';
  } else {
    priceRealEl.style.display = 'none';
    btnBuyReal.style.display = 'none';
  }
}

function ocultarDetalle() {
  document.getElementById('buyEmpty').style.display   = 'flex';
  document.getElementById('buyContent').style.display = 'none';
}

/* ---------------------------------------------------------
   COMPRAR CON MONEDAS
--------------------------------------------------------- */
document.getElementById('btnBuy').addEventListener('click', async () => {
  if (!itemSeleccionado) return;
  const btn = document.getElementById('btnBuy');
  const msg = document.getElementById('msgCompra');
  btn.disabled = true;
  btn.innerHTML = 'PROCESANDO<span class="dots"></span>';

  try {
    const res = await fetch(`${API_URL}/compras`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        catalogo_id: itemSeleccionado.id,
        tipo_pago: 'MONEDAS'
      })
    });
    const data = await res.json();
    if (res.ok) {
      msg.className = 'msg msg-ok';
      msg.textContent = '▶ OBJETO ADQUIRIDO. ¡REVISA TU INVENTARIO!';
    } else {
      msg.className = 'msg msg-err';
      msg.textContent = '> ' + (data.error || 'ERROR AL COMPRAR').toUpperCase();
    }
  } catch {
    msg.className = 'msg msg-err';
    msg.textContent = '> ERROR: SERVIDOR NO DISPONIBLE';
  }

  msg.style.display = 'block';
  btn.innerHTML = '▶ COMPRAR';
  btn.disabled  = monedas < itemSeleccionado.precio_monedas;
});

/* ---------------------------------------------------------
   MODAL PREMIUM
--------------------------------------------------------- */
document.getElementById('btnPremium').addEventListener('click', () => {
  document.getElementById('premiumModal').classList.add('open');
});
document.getElementById('premiumClose').addEventListener('click', () => {
  document.getElementById('premiumModal').classList.remove('open');
});
document.getElementById('premiumModal').addEventListener('click', e => {
  if (e.target === document.getElementById('premiumModal'))
    document.getElementById('premiumModal').classList.remove('open');
});
document.getElementById('premiumBuy').addEventListener('click', () => {
  // TODO: integrar pasarela de pago
  alert('Redirigiendo a pasarela de pago...');
  document.getElementById('premiumModal').classList.remove('open');
});

// Carga inicial
cargarCatalogo();
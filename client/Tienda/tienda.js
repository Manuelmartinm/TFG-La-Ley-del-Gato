const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

const usuarioLogueado = localStorage.getItem('nombre_usuario')
                     || localStorage.getItem('login_usuario')
                     || null;

let tabActiva    = 'normal';
let filtroActivo = 'todo';
let itemSeleccionado = null;
let inventarioUsuario = [];

// Monedas
let monedas = parseInt(localStorage.getItem('monedas') || '0');
document.getElementById('coinsAmount').textContent = monedas.toLocaleString('es-ES');

const catalogo = [
  { id:'1', nombre:'GABARDINA GRIS', categoria:'SKIN', rareza:'rare', emoji:'🧥', precio_monedas:800, precio_real:0, es_catalogo_premium:false, activo:true, tiene_efecto:false, descripcion:'Una gabardina desgastada.' },
  { id:'2', nombre:'SOMBRERO FEDORA', categoria:'COSMETICO', rareza:'epic', emoji:'🎩', precio_monedas:1500, precio_real:0, es_catalogo_premium:false, activo:true, tiene_efecto:false, descripcion:'El clásico de todo buen agente.' },
  { id:'3', nombre:'EXPLOSIVO C4', categoria:'UTIL', rareza:'rare', emoji:'💣', precio_monedas:600, precio_real:0, es_catalogo_premium:false, activo:true, tiene_efecto:true, descripcion:'Sabotaje puro.', descripcion_efecto:'Destruye obstáculos' },
  { id:'4', nombre:'GAFAS NOCTURNAS', categoria:'UTIL', rareza:'common', emoji:'🥽', precio_monedas:300, precio_real:0, es_catalogo_premium:false, activo:true, tiene_efecto:true, descripcion:'Visión nocturna.', descripcion_efecto:'Ilumina zonas oscuras' },
  { id:'9', nombre:'QUESO DORADO', categoria:'COSMETICO', rareza:'legendary', emoji:'🧀', precio_monedas:0, precio_real:4.99, es_catalogo_premium:true, activo:true, tiene_efecto:true, descripcion:'Emana un brillo misterioso.', descripcion_efecto:'+15% puntuación' },
  { id:'10', nombre:'DETECTOR GATOS', categoria:'UTIL', rareza:'legendary', emoji:'📡', precio_monedas:0, precio_real:6.99, es_catalogo_premium:true, activo:true, tiene_efecto:true, descripcion:'Tecnología robada.', descripcion_efecto:'Revela patrullas' },
  { id:'11', nombre:'SKIN MAFIOSO', categoria:'SKIN', rareza:'legendary', emoji:'🤵', precio_monedas:0, precio_real:9.99, es_catalogo_premium:true, activo:true, tiene_efecto:false, descripcion:'Traje de gran jefe.' },
  { id:'12', nombre:'CAPA INVISIBLE', categoria:'SKIN', rareza:'epic', emoji:'👻', precio_monedas:0, precio_real:3.99, es_catalogo_premium:true, activo:true, tiene_efecto:true, descripcion:'Difumina la silueta.', descripcion_efecto:'-30% detección' }
];

async function cargarCatalogo() {
  const rol = localStorage.getItem('rol');
  if (usuarioLogueado && rol !== 'ANONIMO') {
    try {
      const res = await fetch(`${API_URL}/usuarios/inventario/${usuarioLogueado}`);
      const data = await res.json();
      if (data.inventario) inventarioUsuario = data.inventario;
    } catch {}
  }
  renderizarTienda();
}

function renderizarTienda() {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '';
  const items = catalogo.filter(i => 
    i.activo && 
    (tabActiva === 'premium' ? i.es_catalogo_premium : !i.es_catalogo_premium) &&
    (filtroActivo === 'todo' || i.categoria === filtroActivo)
  );

  items.forEach(item => {
    const owned = inventarioUsuario.some(i => String(i.id) === String(item.id));
    const el = document.createElement('div');
    el.className = `shop-item ${item.rareza}${owned ? ' owned' : ''}`;
    el.innerHTML = `<div class="shop-item-inner">
      <div class="shop-item-emoji">${item.emoji}</div>
      <div class="shop-item-name">${item.nombre}</div>
      <div class="shop-item-price">${item.precio_monedas > 0 ? '💰 '+item.precio_monedas : '💶 '+item.precio_real+'€'}</div>
    </div>`;
    el.onclick = () => seleccionarItem(item);
    grid.appendChild(el);
  });
}

function seleccionarItem(item) {
  itemSeleccionado = item;
  const owned = inventarioUsuario.some(i => String(i.id) === String(item.id));
  document.getElementById('buyEmpty').style.display = 'none';
  document.getElementById('buyContent').style.display = 'block';
  document.getElementById('buyIcon').textContent = item.emoji;
  document.getElementById('buyName').textContent = item.nombre;
  document.getElementById('buyDesc').textContent = item.descripcion;

  if (item.precio_monedas > 0) {
    document.getElementById('buyPriceCoins').style.display = 'flex';
    document.getElementById('buyPriceReal').style.display = 'none';
    document.getElementById('priceCoins').textContent = item.precio_monedas;
    document.getElementById('btnBuy').style.display = 'block';
    document.getElementById('btnBuyReal').style.display = 'none';
    document.getElementById('btnBuy').disabled = (owned || monedas < item.precio_monedas);
  } else {
    document.getElementById('buyPriceCoins').style.display = 'none';
    document.getElementById('buyPriceReal').style.display = 'flex';
    document.getElementById('priceReal').textContent = item.precio_real.toFixed(2);
    document.getElementById('btnBuy').style.display = 'none';
    document.getElementById('btnBuyReal').style.display = 'block';
    document.getElementById('btnBuyReal').disabled = owned;
  }
}

// Lógica de compra Monedas (Local)
document.getElementById('btnBuy').onclick = async () => {
    if (monedas < itemSeleccionado.precio_monedas) return;
    monedas -= itemSeleccionado.precio_monedas;
    localStorage.setItem('monedas', monedas);
    document.getElementById('coinsAmount').textContent = monedas;
    inventarioUsuario.push(itemSeleccionado);
    renderizarTienda();
    alert("¡Objeto comprado!");
};

// Redirección a simulación para DINERO REAL
async function iniciarPagoSimulado(params) {
    const res = await fetch(`${API_URL}/pagos/crear-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, nombre_usuario: usuarioLogueado })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
}

document.getElementById('btnBuyReal').onclick = () => {
    iniciarPagoSimulado({ tipo: 'item_directo', item_id: itemSeleccionado.id });
};

async function comprarPack(packId) {
    iniciarPagoSimulado({ tipo: 'monedas', pack_id: packId });
}

document.getElementById('premiumBuyBtn').onclick = () => {
    iniciarPagoSimulado({ tipo: 'premium' });
};

// Eventos de UI
document.querySelectorAll('.shop-tab').forEach(t => t.onclick = (e) => {
    document.querySelectorAll('.shop-tab').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    tabActiva = e.target.dataset.tab;
    renderizarTienda();
});

document.getElementById('btnPremium').onclick = () => document.getElementById('premiumModal').classList.add('open');
document.getElementById('premiumClose').onclick = () => document.getElementById('premiumModal').classList.remove('open');

cargarCatalogo();
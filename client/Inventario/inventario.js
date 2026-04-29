/* =========================================================
   LA LEY DEL GATO — inventario.js
   ========================================================= */

const API_URL = 'https://tfg-la-ley-del-gato.onrender.com';

// Datos del agente
document.getElementById('barName').textContent   = (localStorage.getItem('nombre_usuario') || 'AGENTE').toUpperCase();
document.getElementById('barAvatar').textContent = localStorage.getItem('avatar') || '🐭';

// Items de demo mientras no hay backend real
const itemsDemo = [
  { id:'1', nombre:'GABARDINA GRIS',   categoria:'SKIN',      rareza:'rare',      emoji:'🧥', cantidad:1, equipado:true,  tiene_efecto:false, descripcion:'Una gabardina desgastada perfecta para desaparecer en la noche.', descripcion_efecto:'' },
  { id:'2', nombre:'SOMBRERO FEDORA',  categoria:'COSMETICO', rareza:'epic',      emoji:'🎩', cantidad:1, equipado:false, tiene_efecto:false, descripcion:'El clásico sombrero de todo buen agente encubierto.' },
  { id:'3', nombre:'EXPLOSIVO C4',     categoria:'UTIL',      rareza:'rare',      emoji:'💣', cantidad:3, equipado:false, tiene_efecto:true,  descripcion:'Explosivo de alto rendimiento para misiones de sabotaje.', descripcion_efecto:'Destruye obstáculos en el nivel' },
  { id:'4', nombre:'DETECTOR GATOS',   categoria:'UTIL',      rareza:'legendary', emoji:'📡', cantidad:1, equipado:false, tiene_efecto:true,  descripcion:'Tecnología robada a los gatos. Detecta patrullas enemigas.', descripcion_efecto:'Revela posición de guardias en el mapa' },
  { id:'5', nombre:'QUESO DORADO',     categoria:'COSMETICO', rareza:'legendary', emoji:'🧀', cantidad:1, equipado:false, tiene_efecto:true,  descripcion:'Un queso legendario que emana un brillo dorado misterioso.', descripcion_efecto:'+15% de puntuación en cada nivel' },
  { id:'6', nombre:'MONÓCULO ESPÍA',   categoria:'COSMETICO', rareza:'rare',      emoji:'🔍', cantidad:1, equipado:false, tiene_efecto:false, descripcion:'Accesorio de espía de élite. Solo para los más sofisticados.' },
  { id:'7', nombre:'LLAVE MAESTRA',    categoria:'UTIL',      rareza:'epic',      emoji:'🗝️', cantidad:2, equipado:false, tiene_efecto:true,  descripcion:'Abre cualquier cerradura en el juego sin importar la seguridad.', descripcion_efecto:'Abre puertas bloqueadas sin tiempo de espera' },
  { id:'8', nombre:'CAPA INVISIBLE',   categoria:'SKIN',      rareza:'epic',      emoji:'👻', cantidad:1, equipado:false, tiene_efecto:true,  descripcion:'Una capa que difumina la silueta del ratón entre las sombras.', descripcion_efecto:'Reduce la detección un 30%' },
  { id:'9', nombre:'GAFAS NOCTURNAS',  categoria:'UTIL',      rareza:'common',    emoji:'🥽', cantidad:1, equipado:false, tiene_efecto:true,  descripcion:'Visión nocturna básica. Equipamiento estándar de agente novato.', descripcion_efecto:'Ilumina zonas oscuras del nivel' },
  { id:'10',nombre:'SILENCIADOR',      categoria:'UTIL',      rareza:'rare',      emoji:'🔇', cantidad:4, equipado:false, tiene_efecto:true,  descripcion:'Elimina el ruido de los pasos al moverse por superficies duras.', descripcion_efecto:'Reduce ruido de movimiento al mínimo' },
  { id:'11',nombre:'SKIN MAFIOSO',     categoria:'SKIN',      rareza:'legendary', emoji:'🤵', cantidad:1, equipado:false, tiene_efecto:false, descripcion:'El traje de los grandes jefes. Respeto garantizado en el hampa.' },
  { id:'12',nombre:'COFRE VACÍO',      categoria:'COSMETICO', rareza:'common',    emoji:'📦', cantidad:5, equipado:false, tiene_efecto:false, descripcion:'Un cofre vacío. Quizás algún día contenga algo valioso.' },
];

let itemsActuales = [...itemsDemo];
let itemSeleccionado = null;
let filtroActivo = 'todo';

/* ---------------------------------------------------------
   CARGAR INVENTARIO DEL BACKEND
--------------------------------------------------------- */
async function cargarInventario() {
  try {
    const res = await fetch(`${API_URL}/inventario`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      itemsActuales = data.items;
    }
  } catch {
    // Usa items de demo si falla
  } finally {
    renderizarInventario();
    actualizarInfo();
  }
}

/* ---------------------------------------------------------
   FILTROS DE CATEGORÍA
--------------------------------------------------------- */
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroActivo = btn.dataset.cat;
    renderizarInventario();
  });
});

/* ---------------------------------------------------------
   RENDERIZAR GRID DE ITEMS
--------------------------------------------------------- */
function renderizarInventario() {
  const grid = document.getElementById('itemsGrid');
  grid.innerHTML = '';

  const filtrados = filtroActivo === 'todo'
    ? itemsActuales
    : itemsActuales.filter(i => i.categoria === filtroActivo);

  if (!filtrados.length) {
    grid.innerHTML = '<div class="items-empty">SIN OBJETOS EN ESTA CATEGORÍA</div>';
    return;
  }

  filtrados.forEach((item, idx) => {
    const slot = document.createElement('div');
    slot.className = `item-slot ${item.rareza}${item.equipado ? ' equipped' : ''}${itemSeleccionado?.id === item.id ? ' selected' : ''}`;
    slot.style.animationDelay = (idx * 0.03) + 's';
    slot.innerHTML = `
      ${item.equipado ? '<div class="item-equipped-badge">✓</div>' : ''}
      <div class="item-emoji">${item.emoji}</div>
      <div class="item-name">${item.nombre}</div>
      ${item.cantidad > 1 ? `<div class="item-qty">x${item.cantidad}</div>` : ''}
    `;
    slot.addEventListener('click', () => seleccionarItem(item));
    grid.appendChild(slot);
  });
}

/* ---------------------------------------------------------
   SELECCIONAR ITEM — muestra detalle
--------------------------------------------------------- */
function seleccionarItem(item) {
  itemSeleccionado = item;
  renderizarInventario();

  const rarezaLabel = { common:'COMÚN', rare:'RARO', epic:'ÉPICO', legendary:'LEGENDARIO' };
  const catLabel    = { SKIN:'SKIN', UTIL:'ÚTIL', COSMETICO:'COSMÉTICO' };

  document.getElementById('detailEmpty').style.display   = 'none';
  document.getElementById('detailContent').style.display = 'block';

  document.getElementById('detailIcon').textContent = item.emoji;
  document.getElementById('detailName').textContent = item.nombre;
  document.getElementById('detailCat').textContent  = catLabel[item.categoria] || item.categoria;
  document.getElementById('detailQty').textContent  = item.cantidad;

  const rarEl = document.getElementById('detailRar');
  rarEl.textContent = '◆ ' + (rarezaLabel[item.rareza] || item.rareza).toUpperCase();
  rarEl.className   = 'detail-item-rar rar-' + item.rareza;

  document.getElementById('detailDesc').textContent = item.descripcion || '';

  const effectEl = document.getElementById('detailEffect');
  if (item.tiene_efecto && item.descripcion_efecto) {
    document.getElementById('detailEffectDesc').textContent = item.descripcion_efecto;
    effectEl.style.display = 'block';
  } else {
    effectEl.style.display = 'none';
  }

  const btnEquip = document.getElementById('btnEquip');
  if (item.equipado) {
    btnEquip.textContent = '✓ EQUIPADO';
    btnEquip.className   = 'btn-equip equipped-state';
  } else {
    btnEquip.textContent = '▶ EQUIPAR';
    btnEquip.className   = 'btn-equip';
  }
}

/* ---------------------------------------------------------
   BOTÓN EQUIPAR
--------------------------------------------------------- */
document.getElementById('btnEquip').addEventListener('click', async () => {
  if (!itemSeleccionado) return;

  const yaEquipado = itemSeleccionado.equipado;

  // Desequipa todos los de la misma categoría
  itemsActuales.forEach(i => {
    if (i.categoria === itemSeleccionado.categoria) i.equipado = false;
  });

  if (!yaEquipado) {
    itemSeleccionado.equipado = true;
  }

  renderizarInventario();
  seleccionarItem(itemSeleccionado);

  try {
    await fetch(`${API_URL}/inventario/equipar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ item_id: itemSeleccionado.id, equipar: !yaEquipado })
    });
  } catch {}
});

/* ---------------------------------------------------------
   BOTÓN DESECHAR
--------------------------------------------------------- */
document.getElementById('btnDrop').addEventListener('click', async () => {
  if (!itemSeleccionado) return;
  if (!confirm('¿Seguro que quieres desechar este objeto?')) return;

  itemsActuales = itemsActuales.filter(i => i.id !== itemSeleccionado.id);
  itemSeleccionado = null;

  document.getElementById('detailEmpty').style.display   = 'flex';
  document.getElementById('detailContent').style.display = 'none';

  renderizarInventario();
  actualizarInfo();

  try {
    await fetch(`${API_URL}/inventario/${itemSeleccionado?.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  } catch {}
});

/* ---------------------------------------------------------
   ACTUALIZAR INFO GENERAL
--------------------------------------------------------- */
function actualizarInfo() {
  const total = itemsActuales.length;
  document.getElementById('capacidad').textContent = `${total}/50`;
  document.getElementById('itemCount').textContent = `${total} OBJETOS`;
}

// Carga inicial
cargarInventario();
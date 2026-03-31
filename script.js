/**
 * ComidaRápida - Prototipo FINAL con todas las mejoras aplicadas
 */

(function () {
  'use strict';

  const RESTAURANTES = [
    { id: 'r1', nombre: 'Pizzería Napoli', categoria: 'pizza', img: './assets/rest-r1.svg' },
    { id: 'r2', nombre: 'Sushi Roll', categoria: 'asiatica', img: './assets/rest-r2.svg' },
    { id: 'r3', nombre: 'Burger Norte', categoria: 'hamburguesas', img: './assets/rest-r3.svg' },
    { id: 'r4', nombre: 'Mamma Mia Express', categoria: 'pizza', img: './assets/rest-r4.svg' }
  ];

  const MENU = {
    r1: [{ id: 'm1', nombre: 'Margarita', precio: 8.5, img: './assets/dish-m1.svg' },
         { id: 'm2', nombre: 'Cuatro quesos', precio: 10.9, img: './assets/dish-m2.svg' }],
    r2: [{ id: 'm3', nombre: 'Menú maki (12 pzs)', precio: 14.0, img: './assets/dish-m3.svg' },
         { id: 'm4', nombre: 'Yakisoba', precio: 9.5, img: './assets/dish-m4.svg' }],
    r3: [{ id: 'm5', nombre: 'Clásica + patatas', precio: 11.0, img: './assets/dish-m5.svg' },
         { id: 'm6', nombre: 'Veggie', precio: 10.5, img: './assets/dish-m6.svg' }],
    r4: [{ id: 'm7', nombre: 'Calzone', precio: 9.0, img: './assets/dish-m7.svg' },
         { id: 'm8', nombre: 'Prosciutto', precio: 11.5, img: './assets/dish-m8.svg' }]
  };

  let restauranteActual = null;
  let pedido = [];
  let notasPorRestaurante = {};

  let els = {};

  function cacheElements() {
    els = {
      filtro: document.getElementById('filtro-cat'),
      listaRest: document.getElementById('lista-restaurantes'),
      stepRest: document.getElementById('step-restaurante'),
      stepProd: document.getElementById('step-productos'),
      stepRes: document.getElementById('step-resumen'),
      stepConf: document.getElementById('step-confirmacion'),
      tituloRest: document.getElementById('titulo-restaurante'),
      listaPlatos: document.getElementById('lista-platos'),
      listaResumen: document.getElementById('lista-resumen'),
      resumenVacio: document.getElementById('resumen-vacio'),
      total: document.getElementById('total-delivery'),
      msgConfirm: document.getElementById('msg-confirm'),
      miniCarrito: document.getElementById('mini-carrito'),
      miniCount: document.getElementById('mini-count'),
      miniTotal: document.getElementById('mini-total'),
      carritoCount: document.getElementById('carrito-count'),
      notasContainer: document.getElementById('notas-container'),
      btnVolverRest: document.getElementById('btn-volver-rest'),
      btnVerCarrito: document.getElementById('btn-ver-carrito'),
      btnAbrirCarrito: document.getElementById('btn-abrir-carrito'),
      btnSeguir: document.getElementById('btn-seguir-comprando'),
      btnComprar: document.getElementById('btn-comprar'),
      btnNuevo: document.getElementById('btn-nuevo')
    };
  }

  function mostrarPanel(panel) {
    const panels = [els.stepRest, els.stepProd, els.stepRes, els.stepConf];
    panels.forEach(p => {
      if (p) {
        p.classList.toggle('active', p === panel);
        p.hidden = p !== panel;
      }
    });

    let paso = 1;
    if (panel === els.stepProd) paso = 2;
    else if (panel === els.stepRes) paso = 3;
    else if (panel === els.stepConf) paso = 4;
    actualizarProgressBar(paso);
  }

  function actualizarProgressBar(paso) {
    document.querySelectorAll('.step-item').forEach(item => {
      const num = parseInt(item.getAttribute('data-step'));
      item.classList.remove('active', 'completed');
      if (num < paso) item.classList.add('completed');
      else if (num === paso) item.classList.add('active');
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatEuros(n) {
    return Number(n).toFixed(2).replace('.', ',') + ' €';
  }

  function filtrarRestaurantes() {
    const cat = els.filtro ? els.filtro.value : 'todas';
    els.listaRest.innerHTML = '';
    RESTAURANTES.forEach(r => {
      if (cat !== 'todas' && r.categoria !== cat) return;
      const li = document.createElement('li');
      li.innerHTML = `
        <button type="button" class="card-rest" data-rest="${r.id}">
          <span class="card-rest__media"><img src="${r.img}" width="72" height="72" alt="" loading="lazy"></span>
          <span class="card-rest__body">
            <strong>${escapeHtml(r.nombre)}</strong>
            <span class="tag">${escapeHtml(r.categoria)}</span>
          </span>
        </button>`;
      els.listaRest.appendChild(li);
    });
  }

  function abrirMenu(restId) {
    restauranteActual = restId;
    const rest = RESTAURANTES.find(r => r.id === restId);
    if (els.tituloRest) els.tituloRest.textContent = rest ? rest.nombre : 'Menú';

    els.listaPlatos.innerHTML = '';
    const platos = MENU[restId] || [];

    platos.forEach(pl => {
      const li = document.createElement('li');
      li.className = 'plato-row';
      li.innerHTML = `
        <img class="plato-thumb" src="${pl.img}" width="52" height="52" alt="">
        <div class="plato-info">
          <span class="plato-nombre">${escapeHtml(pl.nombre)}</span>
          <span class="plato-precio">${formatEuros(pl.precio)}</span>
        </div>
        <div class="quantity-control">
          <button type="button" class="qty-btn minus" data-id="${pl.id}">-</button>
          <span class="qty" data-id="${pl.id}">0</span>
          <button type="button" class="qty-btn plus" data-id="${pl.id}">+</button>
        </div>
      `;
      els.listaPlatos.appendChild(li);
    });

    mostrarPanel(els.stepProd);
    actualizarCarritoUI();
  }

  function actualizarCantidadVisual(idPlato, cantidad) {
    const qtySpan = document.querySelector(`.qty[data-id="${idPlato}"]`);
    if (qtySpan) qtySpan.textContent = cantidad;
  }

  function agregarPlato(idPlato, nombre, precio, img) {
    let item = pedido.find(i => i.idPlato === idPlato);
    if (item) item.cantidad++;
    else pedido.push({ idPlato, nombre, precioUnit: precio, cantidad: 1, img });

    actualizarCantidadVisual(idPlato, item ? item.cantidad : 1);
    mostrarToast(`+ ${nombre}`);
    actualizarCarritoUI();
  }

  function cambiarCantidad(idPlato, delta) {
    let item = pedido.find(i => i.idPlato === idPlato);
    if (!item) return;
    item.cantidad = Math.max(0, item.cantidad + delta);
    if (item.cantidad === 0) pedido = pedido.filter(i => i.idPlato !== idPlato);

    actualizarCantidadVisual(idPlato, item.cantidad);
    actualizarCarritoUI();
    if (els.stepRes && !els.stepRes.hidden) pintarResumen();
  }

  function totalPedido() {
    return pedido.reduce((sum, item) => sum + item.precioUnit * item.cantidad, 0);
  }

  function getRestauranteDePlato(idPlato) {
    for (let restId in MENU) {
      if (MENU[restId].some(p => p.id === idPlato)) return restId;
    }
    return restauranteActual;
  }

  function pintarResumen() {
    if (!els.listaResumen) return;
    els.listaResumen.innerHTML = '';

    if (pedido.length === 0) {
      if (els.resumenVacio) els.resumenVacio.hidden = false;
      if (els.notasContainer) els.notasContainer.innerHTML = '<h3>Notas por restaurante</h3><p class="muted">No hay productos en el pedido.</p>';
      if (els.btnComprar) els.btnComprar.disabled = true;
      return;
    }

    if (els.resumenVacio) els.resumenVacio.hidden = true;
    if (els.btnComprar) els.btnComprar.disabled = false;

    const pedidoPorRest = {};
    pedido.forEach(item => {
      const restId = getRestauranteDePlato(item.idPlato);
      if (!pedidoPorRest[restId]) pedidoPorRest[restId] = [];
      pedidoPorRest[restId].push(item);
    });

    Object.keys(pedidoPorRest).forEach(restId => {
      const rest = RESTAURANTES.find(r => r.id === restId);
      const section = document.createElement('div');
      section.className = 'restaurante-section';
      section.innerHTML = `<h4>${rest ? rest.nombre : 'Restaurante'}</h4>`;

      pedidoPorRest[restId].forEach(item => {
        const li = document.createElement('li');
        li.className = 'resumen-line';
        li.innerHTML = `
          <img class="resumen-thumb" src="${item.img}" width="40" height="40" alt="">
          <div class="resumen-info">
            <span class="resumen-nombre">${escapeHtml(item.nombre)}</span>
            <div class="qty-control-small">
              <button class="qty-btn minus" data-id="${item.idPlato}">-</button>
              <span>${item.cantidad}</span>
              <button class="qty-btn plus" data-id="${item.idPlato}">+</button>
              <button class="btn-eliminar" data-id="${item.idPlato}">Eliminar</button>
            </div>
          </div>
          <span class="resumen-precio">${formatEuros(item.precioUnit * item.cantidad)}</span>
        `;
        section.appendChild(li);
      });
      els.listaResumen.appendChild(section);
    });

    if (els.total) els.total.textContent = formatEuros(totalPedido());
    generarNotasPorRestaurante(pedidoPorRest);
  }

  function generarNotasPorRestaurante(pedidoPorRest) {
    if (!els.notasContainer) return;
    els.notasContainer.innerHTML = '<h3>Notas por restaurante</h3>';

    Object.keys(pedidoPorRest).forEach(restId => {
      const rest = RESTAURANTES.find(r => r.id === restId);
      if (!rest) return;

      const div = document.createElement('div');
      div.className = 'nota-restaurante';
      div.innerHTML = `
        <label for="nota-${restId}">${rest.nombre}</label>
        <textarea id="nota-${restId}" placeholder="Ej: Sin cebolla, extra queso...">${notasPorRestaurante[restId] || ''}</textarea>
      `;

      const textarea = div.querySelector(`#nota-${restId}`);
      if (textarea) {
        textarea.addEventListener('input', () => {
          notasPorRestaurante[restId] = textarea.value.trim();
        });
      }
      els.notasContainer.appendChild(div);
    });
  }

  function actualizarCarritoUI() {
    const count = pedido.reduce((sum, i) => sum + i.cantidad, 0);
    if (els.carritoCount) els.carritoCount.textContent = count;
    if (els.miniCount) els.miniCount.textContent = count;
    if (els.miniTotal) els.miniTotal.textContent = formatEuros(totalPedido());
    if (els.miniCarrito) els.miniCarrito.classList.toggle('hidden', count === 0);
  }

  function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  function setupEventListeners() {
    if (els.listaRest) els.listaRest.addEventListener('click', e => {
      const btn = e.target.closest('[data-rest]');
      if (btn) abrirMenu(btn.dataset.rest);
    });

    if (els.filtro) els.filtro.addEventListener('change', filtrarRestaurantes);

    if (els.listaPlatos) els.listaPlatos.addEventListener('click', e => {
      const btn = e.target.closest('.qty-btn');
      if (!btn) return;
      const id = btn.dataset.id;
      const plato = Object.values(MENU).flat().find(p => p.id === id);
      if (!plato) return;
      if (btn.classList.contains('plus')) agregarPlato(id, plato.nombre, plato.precio, plato.img);
      if (btn.classList.contains('minus')) cambiarCantidad(id, -1);
    });

    if (els.listaResumen) els.listaResumen.addEventListener('click', e => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains('plus')) cambiarCantidad(id, 1);
      if (e.target.classList.contains('minus')) cambiarCantidad(id, -1);
      if (e.target.classList.contains('btn-eliminar')) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
          pedido = pedido.filter(i => i.idPlato !== id);
          pintarResumen();
          actualizarCarritoUI();
        }
      }
    });

    if (els.btnVolverRest) els.btnVolverRest.addEventListener('click', () => mostrarPanel(els.stepRest));
    if (els.btnVerCarrito) els.btnVerCarrito.addEventListener('click', () => { pintarResumen(); mostrarPanel(els.stepRes); });
    if (els.btnAbrirCarrito) els.btnAbrirCarrito.addEventListener('click', () => { pintarResumen(); mostrarPanel(els.stepRes); });

    if (els.btnSeguir) els.btnSeguir.addEventListener('click', () => {
      if (restauranteActual) abrirMenu(restauranteActual);
      else mostrarPanel(els.stepRest);
    });

    if (els.btnComprar) els.btnComprar.addEventListener('click', () => {
      if (pedido.length === 0) {
        alert('Añade al menos un plato antes de confirmar.');
        return;
      }

      let mensaje = `Tu pedido por ${formatEuros(totalPedido())} está en preparación.\n\n`;
      Object.keys(notasPorRestaurante).forEach(restId => {
        const rest = RESTAURANTES.find(r => r.id === restId);
        if (rest && notasPorRestaurante[restId]) {
          mensaje += `Nota para ${rest.nombre}: "${notasPorRestaurante[restId]}"\n`;
        }
      });

      if (els.msgConfirm) els.msgConfirm.textContent = mensaje + "Tiempo estimado: 30-40 minutos.";

      pedido = [];
      notasPorRestaurante = {};
      restauranteActual = null;
      actualizarCarritoUI();
      mostrarPanel(els.stepConf);
    });

    if (els.btnNuevo) els.btnNuevo.addEventListener('click', () => {
      restauranteActual = null;
      pedido = [];
      notasPorRestaurante = {};
      actualizarCarritoUI();
      mostrarPanel(els.stepRest);
    });
  }

  function init() {
    cacheElements();
    setupEventListeners();
    filtrarRestaurantes();
    actualizarCarritoUI();
    actualizarProgressBar(1);
  }

  window.addEventListener('load', init);
})();
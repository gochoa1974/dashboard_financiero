/* Cima Blanca · catálogo de anuncios compartido v1 · 10 nov 2026 13:30 (Ecuador)
   Traduce el NOMBRE publicado de Airbnb a uno de los 3 anuncios fijos (LST-01 · 6 pax, LST-02 · 8 pax, LST-03 · 4 pax).
   Fuente de verdad: hoja HOMOLOGACION_LISTINGS (Apps Script de Parámetros). Aquí solo hay una copia guardada en el dispositivo.
   Regla: un nombre desconocido devuelve null («por homologar»). Nunca se adivina por palabras. */
(function () {
  'use strict';
  var URL = 'https://script.google.com/macros/s/AKfycbxJX9a0T36KJWdDB4sGZ0FAGufRCTRwQgxmUwGQqZAlXu5754Jh2ghxv6nU8wkMmqV8xw/exec';
  var KC = 'cb_listings_v1', KCLAVE = 'cimablanca_clave';
  var BASE = [
    { v: 'LST-01_6 pax', alias: 'LST-01', cap: 6, nombre: 'Cima Blanca' },
    { v: 'LST-02_8 pax', alias: 'LST-02', cap: 8, nombre: 'Depa de Playa' },
    { v: 'LST-03_4 pax', alias: 'LST-03', cap: 4, nombre: 'MiamiCito' }
  ];
  /* Copia de respaldo SOLO para cuando el catálogo nunca se ha podido leer en este dispositivo (sin red ni copia guardada). */
  var SEED = {
    'Cima Blanca · Piscina Inf. 38mt · Fogata BBQ': 'LST-01_6 pax',
    'Back Up 02 max. 6 · Cima Blanca · Depa Navideño · Piscina inf. 20mt.': 'LST-01_6 pax',
    'Depa 5 Estrellas · Piscina 40mt · BBQ & Fogata': 'LST-01_6 pax',
    'Depa de Playa · Piscina inf 38 m · Zona BBQ Fogata': 'LST-02_8 pax',
    'Anuncio Master max. 8 · Cima Blanca · Luxury Apt · Beach & Pool': 'LST-02_8 pax',
    'Familiar · Piscina Gigante 38 m · BBQ & Fogata': 'LST-02_8 pax',
    'MiamiCito + Súper Piscina de 40 mt. + BBQ + Fogata': 'LST-03_4 pax',
    'Back Up 01 max. 4 · Cima Blanca · Vista al Mar · Piscina y Playa': 'LST-03_4 pax',
    'Vista al mar + Piscina Gigante BBQ & Fogata': 'LST-03_4 pax'
  };
  function nk(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLowerCase(); }
  var D = null;
  try { D = JSON.parse(localStorage.getItem(KC) || 'null'); } catch (e) { D = null; }
  function clave() { try { return localStorage.getItem(KCLAVE) || ''; } catch (e) { return ''; } }
  function usuario() { try { var p = window.CB && window.CB.perfil; return p ? String(p.usuario || p.nombre || '') : ''; } catch (e) { return ''; } }
  function guardar(j) {
    D = { t: Date.now(), anuncios: j.anuncios || [], nombres: j.nombres || [] };
    try { localStorage.setItem(KC, JSON.stringify(D)); } catch (e) {}
    try { window.dispatchEvent(new Event('cb-listings')); } catch (e) {}
    return D;
  }
  function llamar(body) {
    var k = clave(); if (!k) return Promise.reject(new Error('Sin sesión: vuelve a entrar.'));
    return fetch(URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ clave: k, usuario: usuario() }, body)) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'Error del catálogo de anuncios'); return j; });
  }
  function mapa() {
    var m = {};
    if (D && D.nombres && D.nombres.length) { D.nombres.forEach(function (x) { if (x.alias) m[nk(x.nombre)] = x.alias; }); }
    else Object.keys(SEED).forEach(function (k) { m[nk(k)] = SEED[k]; });
    return m;
  }
  var L = window.ListingsCB = {
    BASE: BASE,
    anuncios: function () { return (D && D.anuncios && D.anuncios.length) ? D.anuncios : BASE; },
    /* 'LST-0X_N pax' o null. Acepta el nombre publicado o un código interno (LST-01, «LST-02_8 pax»). */
    alias: function (txt) {
      var t = String(txt == null ? '' : txt).trim(); if (!t) return null;
      var c = /^lst-0([123])(?:[_\s].*)?$/i.exec(t); if (c) return BASE[+c[1] - 1].v;
      return mapa()[nk(t)] || null;
    },
    pendientes: function () { return D && D.nombres ? D.nombres.filter(function (x) { return !x.alias; }).length : 0; },
    cargar: function () { return llamar({ accion: 'listarListings' }).then(guardar); },
    /* Nunca falla: si no hay red usa la copia guardada (o el respaldo) y lo avisa en el registro. */
    listo: function (log) {
      return L.cargar().then(function () { if (log) log('Catálogo de anuncios leído ✓ (' + L.pendientes() + ' por homologar)'); }, function (e) {
        if (log) log('Aviso: no pude leer el catálogo de anuncios (' + (e && e.message || e) + '). Uso la copia guardada.');
      });
    },
    /* Envía al catálogo los nombres vistos en las reservas (con cuántas reservas y qué fechas). Un nombre nuevo queda «Sin asignar». */
    registrar: function (reservas, log) {
      var st = {};
      (reservas || []).forEach(function (r) {
        var n = String(r.anuncio || '').replace(/\s+/g, ' ').trim(); if (!n) return;
        var s = st[n] = st[n] || { nombre: n, reservas: 0, desde: '', hasta: '' };
        s.reservas++;
        var d = r.fecha_inicio || ''; if (d && (!s.desde || d < s.desde)) s.desde = d; if (d && (!s.hasta || d > s.hasta)) s.hasta = d;
      });
      var lista = Object.keys(st).map(function (k) { return st[k]; });
      if (!lista.length) return Promise.resolve(null);
      return llamar({ accion: 'registrarNombres', nombres: lista }).then(function (j) {
        guardar(j);
        if (log) log(j.pendientes ? 'Anuncios por homologar: ' + j.pendientes + '. Entra a «Anuncios» y asígnalos con un toque.' : 'Todos los nombres de anuncio están homologados ✓');
        return j;
      }, function (e) { if (log) log('Aviso: no pude registrar los nombres de anuncio (' + (e && e.message || e) + ').'); return null; });
    },
    homologar: function (nombre, alias, antes, deshacer) { return llamar({ accion: 'homologarNombre', nombre: nombre, alias: alias, antes: antes || '', deshacer: !!deshacer }).then(guardar); },
    renombrar: function (alias, nombre) { return llamar({ accion: 'renombrarAnuncio', alias: alias, nombre: nombre }).then(guardar); },
    datos: function () { return D; }
  };
  /* Refresco silencioso: si hay sesión y la copia tiene más de 10 minutos, la actualiza en segundo plano. */
  if (!D || Date.now() - (D.t || 0) > 600000) setTimeout(function () { if (clave()) L.cargar().catch(function () {}); }, 2000);
})();

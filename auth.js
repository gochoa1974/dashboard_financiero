/* Cima Blanca · acceso compartido (login por usuario, sesión persistente, roles, relojito de carga).
   Se incluye en cada módulo con:  <meta name="cb-modulo" content="gastos">  y  <script src="../auth.js"></script>
   Si CB_ACCESO_URL está vacío, el script no hace nada (los módulos funcionan como antes). */
(function () {
  'use strict';
  var CB_ACCESO_URL = 'https://script.google.com/macros/s/AKfycbxWGwFUlEbsokdfn79n8RDCKFVu-jv2DKdJp4Bq7D_cjrO_NNoDPQdXpW6aTlpxGA/exec';   // URL /exec del Apps Script ACCESO (la pone Luna al recibirla)
  var K_SES = 'cb_sesion', K_CLAVE = 'cimablanca_clave';
  var me = document.currentScript, BASE = me && me.src ? me.src.replace(/[^\/]*$/, '') : '';
  var metaM = document.querySelector('meta[name="cb-modulo"]');
  var MODULO = metaM ? metaM.content : '';
  var CB = window.CB = { activo: !!CB_ACCESO_URL, perfil: null, modulo: MODULO };

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function leerSes() { try { var s = JSON.parse(ls(K_SES) || 'null'); return s && s.token && s.expira > Date.now() ? s : null; } catch (e) { return null; } }

  if (!CB.activo) { CB.ready = Promise.resolve(null); CB.puede = function () { return true; }; CB.llamar = function () { return Promise.reject(new Error('Acceso no configurado')); }; CB.loader = function () {}; CB.salir = function () {}; return; }

  /* ---------- estilos y overlay ---------- */
  var css = '\
html.cb-pend body>*:not(#cbov){visibility:hidden}\
#cbov{--cbbg:#edf2f4;--cbsf:#fff;--cbink:#0a2233;--cbmut:#5f7080;--cbline:#dde5ea;--cbac:#0a2233;--cberr:#b42318;position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:20px;background:var(--cbbg);color:var(--cbink);font-family:"Manrope",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}\
@media (prefers-color-scheme:dark){#cbov{--cbbg:#071722;--cbsf:#0e2536;--cbink:#eaf2f6;--cbmut:#8fa6b5;--cbline:#1a3649;--cbac:#eaf2f6;--cberr:#ff8a80}}\
#cbov.on{display:flex}#cbov.tr{background:rgba(7,23,34,.55);backdrop-filter:blur(2px)}\
.cbbox{width:100%;max-width:380px;text-align:center}\
.cbbox img.cblogo{width:76px;height:76px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 14px;box-shadow:0 10px 24px -8px rgba(10,34,51,.35)}\
.cbbox h1{margin:0 0 4px;font-size:22px;font-weight:800;letter-spacing:-.01em}\
.cbbox p.cbsub{margin:0 0 20px;font-size:13.5px;font-weight:600;color:var(--cbmut)}\
.cbcard{background:var(--cbsf);border:1px solid var(--cbline);border-radius:20px;padding:20px 18px;text-align:left;box-shadow:0 1px 2px rgba(10,34,51,.05),0 8px 20px -12px rgba(10,34,51,.2)}\
.cbcard label{display:block;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--cbmut);margin:0 0 6px}\
.cbcard input{width:100%;font:inherit;font-size:16px;font-weight:600;color:var(--cbink);background:transparent;border:1.5px solid var(--cbline);border-radius:12px;padding:13px 14px;margin:0 0 14px;min-height:48px}\
.cbcard input:focus{outline:none;border-color:var(--cbac);box-shadow:0 0 0 3px rgba(10,34,51,.12)}\
.cbbtn{width:100%;min-height:50px;border:0;border-radius:14px;background:var(--cbac);color:var(--cbbg);font:inherit;font-size:15.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}\
.cbbtn[disabled]{opacity:.7;cursor:default}\
.cberr{min-height:20px;margin:-4px 0 10px;font-size:13px;font-weight:700;color:var(--cberr)}\
.cbfoot{margin-top:16px;font-size:12px;font-weight:600;color:var(--cbmut)}\
.cbspin{width:44px;height:44px;border-radius:50%;border:4px solid var(--cbline);border-top-color:var(--cbac);animation:cbr 0.9s linear infinite;margin:0 auto}\
.cbbtn .cbspin{width:20px;height:20px;border-width:3px;margin:0;border-color:rgba(128,128,128,.35);border-top-color:currentColor}\
.cbmsg{margin-top:16px;font-size:14px;font-weight:700;color:var(--cbmut)}\
.cblink{display:inline-block;margin-top:14px;font-weight:800;color:var(--cbink)}\
@keyframes cbr{to{transform:rotate(360deg)}}\
@media (prefers-reduced-motion:reduce){.cbspin{animation-duration:2.4s}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  document.documentElement.classList.add('cb-pend');

  var ov = null;
  function logo() { return BASE + 'Cima-Blanca-logo.png'; }
  function mk() {
    if (ov) return ov;
    ov = document.createElement('div'); ov.id = 'cbov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-live', 'polite');
    document.body.appendChild(ov); return ov;
  }
  function pintar(html, trans) { var o = mk(); o.innerHTML = '<div class="cbbox">' + html + '</div>'; o.className = 'on' + (trans ? ' tr' : ''); }
  function ocultar() { if (ov) ov.className = ''; document.documentElement.classList.remove('cb-pend'); }

  function vistaCarga(msg) { pintar('<img class="cblogo" src="' + logo() + '" alt=""><div class="cbspin" role="status" aria-label="Cargando"></div><div class="cbmsg">' + (msg || 'Cargando…') + '</div>'); }
  function vistaLogin(err) {
    pintar('<img class="cblogo" src="' + logo() + '" alt="Cima Blanca"><h1>Cima Blanca</h1><p class="cbsub">Entra con tu usuario y tu clave</p>' +
      '<form class="cbcard" id="cbf" autocomplete="on"><label for="cbu">Usuario</label><input id="cbu" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" required>' +
      '<label for="cbp">Clave</label><input id="cbp" name="password" type="password" autocomplete="current-password" required>' +
      '<div class="cberr" id="cbe" role="alert">' + (err || '') + '</div><button class="cbbtn" id="cbb" type="submit">Entrar</button></form>' +
      '<div class="cbfoot">Tu sesión queda guardada en este dispositivo.</div>');
    var f = document.getElementById('cbf'), b = document.getElementById('cbb'), e = document.getElementById('cbe');
    setTimeout(function () { var u = document.getElementById('cbu'); if (u) u.focus(); }, 50);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); e.textContent = ''; b.disabled = true; b.innerHTML = '<span class="cbspin"></span> Entrando…';
      llamarSin('login', { usuario: document.getElementById('cbu').value, clave: document.getElementById('cbp').value }).then(function (r) {
        guardar(r); aplicar(r); ocultar(); if (CB.alEntrar) CB.alEntrar(r); else resolver(r);
      }).catch(function (er) { b.disabled = false; b.textContent = 'Entrar'; e.textContent = er.message || 'No pude entrar. Revisa tu conexión.'; document.getElementById('cbp').value = ''; document.getElementById('cbp').focus(); });
    });
  }
  function vistaSinAcceso(p) {
    pintar('<img class="cblogo" src="' + logo() + '" alt=""><h1>Sin acceso a este módulo</h1><p class="cbsub">Tu perfil (' + (p.rolEtiqueta || p.rol) + ') no incluye esta sección.</p><a class="cblink" href="' + BASE + '">Volver al inicio</a>');
    document.documentElement.classList.remove('cb-pend');
  }

  /* ---------- llamadas ---------- */
  function llamarSin(accion, datos) {
    var body = JSON.stringify(Object.assign({ accion: accion }, datos || {}));
    return fetch(CB_ACCESO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { var er = new Error(j.error || 'Error'); er.servidor = true; throw er; } return j;
    });
  }
  CB.llamar = function (accion, datos) {
    var s = leerSes(); if (!s) return Promise.reject(new Error('Sin sesión'));
    return llamarSin(accion, Object.assign({ token: s.token }, datos || {}));
  };
  CB.puede = function (m) { return !!(CB.perfil && CB.perfil.modulos.indexOf(m) !== -1); };
  CB.loader = function (on, msg) { if (on) vistaCarga(msg); else ocultar(); };
  CB.salir = function () { ls(K_SES, null); ls(K_CLAVE, null); location.href = BASE; };

  function guardar(r) { ls(K_SES, JSON.stringify({ token: r.token, expira: r.expira, perfil: pf(r) })); }
  function pf(r) { return { usuario: r.usuario, nombre: r.nombre, rol: r.rol, rolEtiqueta: r.rolEtiqueta, modulos: r.modulos, puedeBorrar: r.puedeBorrar, esAdmin: r.esAdmin }; }
  function aplicar(r) {
    CB.perfil = pf(r);
    if (r.claveModulos) ls(K_CLAVE, r.claveModulos);
    var cl = document.documentElement.classList; cl.toggle('cb-admin', !!r.esAdmin); cl.toggle('cb-sin-borrar', !r.puedeBorrar);
    document.documentElement.setAttribute('data-cb-rol', r.rol);
    if (MODULO && MODULO !== 'inicio' && !CB.puede(MODULO)) { vistaSinAcceso(CB.perfil); CB.bloqueado = true; return; }
    if (MODULO && MODULO !== 'inicio') bitacoraUso();
  }
  function bitacoraUso() {
    try { var k = 'cb_uso_' + MODULO, t = +sessionStorage.getItem(k) || 0; if (Date.now() - t < 1800000) return; sessionStorage.setItem(k, String(Date.now())); } catch (e) {}
    CB.llamar('bitacora', { modulo: MODULO, accionReg: 'abrir', detalle: '' }).catch(function () {});
  }

  /* ---------- arranque ---------- */
  var resolver; CB.ready = new Promise(function (ok) { resolver = ok; });
  function arrancar() {
    mk();
    var s = leerSes();
    if (!s) { vistaLogin(); return; }
    aplicar({ token: s.token, expira: s.expira, claveModulos: ls(K_CLAVE), usuario: s.perfil.usuario, nombre: s.perfil.nombre, rol: s.perfil.rol, rolEtiqueta: s.perfil.rolEtiqueta, modulos: s.perfil.modulos, puedeBorrar: s.perfil.puedeBorrar, esAdmin: s.perfil.esAdmin });
    if (!CB.bloqueado) document.documentElement.classList.remove('cb-pend');
    resolver(CB.perfil);
    // revalida por detrás: si la sesión ya no sirve, pide entrar de nuevo; si no hay red, sigue con lo guardado
    llamarSin('sesion', { token: s.token }).then(function (r) {
      var ses = leerSes(); if (ses) { r.token = ses.token; r.expira = ses.expira; guardar(r); }
      var cambio = JSON.stringify(r.modulos) !== JSON.stringify(s.perfil.modulos);
      aplicar(r); if (cambio && !CB.bloqueado) ocultar();
    }).catch(function (er) {
      if (er.servidor) { ls(K_SES, null); ls(K_CLAVE, null); vistaLogin('Tu sesión terminó. Entra de nuevo.'); CB.alEntrar = function () { location.reload(); }; }
    });
  }
  if (document.body) arrancar(); else document.addEventListener('DOMContentLoaded', arrancar);
})();

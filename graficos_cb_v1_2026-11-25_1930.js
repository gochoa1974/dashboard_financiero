/* graficos_cb_v1 · componente común de gráficos · 25 nov 2026 19:30
   Reglas G1–G9 de la propuesta «Gráficos: valores y porcentajes» (aprobada por Gustavo, «LISTO»).
   Lo usan Ingresos (Evolución del neto), Gastos (Evolución del gasto) y Comparar (comparar_cb_v2.2).
   Aquí vive lo común: barra con punta redondeada y base recta, encabezado vivo (período + valor + variación),
   control Gráfico/Lista, lista de meses (tabla equivalente), tarjeta al pasar el cursor, y el interruptor del promedio.
   Solo usa los colores de estilos_cb_v1 (claro y oscuro). No guarda datos; el interruptor del promedio se recuerda en el navegador. */
(function () {
  "use strict";
  var G = window.CBG = {};

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  G.esc = esc;

  /* ---------- estilos (una sola vez) ---------- */
  G.css = function () {
    if (document.getElementById("cbgCss")) return;
    var st = document.createElement("style"); st.id = "cbgCss";
    st.textContent =
      ".cbg-hd{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:4px 0 0}" +
      ".cbg-hl{min-width:0}.cbg-hl>small{display:block;font-size:12px;font-weight:700;color:var(--texto-2);margin:0 0 3px}" +
      ".cbg-big{font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1.1;color:var(--texto);font-variant-numeric:proportional-nums}" +
      ".cbg-big small{font-size:17px;font-weight:700;color:var(--texto-2)}" +
      ".cbg-sub{font-size:12px;font-weight:600;color:var(--texto-2);margin:3px 0 0;line-height:1.4}" +
      ".cbg-chip{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;font-weight:800;border-radius:99px;padding:3px 10px;color:var(--texto-2);background:color-mix(in srgb,var(--texto) 7%,transparent);white-space:nowrap;line-height:1.35}" +
      ".cbg-chip.g{color:var(--ok);background:color-mix(in srgb,var(--ok) 12%,transparent)}" +
      ".cbg-chip.b{color:var(--error);background:color-mix(in srgb,var(--error) 11%,transparent)}" +
      ".cbg-chip.w{color:var(--pendiente);background:color-mix(in srgb,var(--pendiente) 13%,transparent)}" +
      ".cbg-seg{display:inline-flex;background:color-mix(in srgb,var(--texto) 7%,transparent);border-radius:99px;padding:3px;flex:none}" +
      ".cbg-seg button{appearance:none;border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:700;color:var(--texto-2);min-height:34px;min-width:44px;padding:0 12px;border-radius:99px;cursor:pointer}" +
      ".cbg-seg button[aria-selected=true]{background:var(--tarjeta);color:var(--texto);box-shadow:0 1px 3px rgba(10,34,51,.18)}" +
      ".cbg-seg button:focus-visible,.cbg-pr:focus-visible,.cbg-row:focus-visible{outline:3px solid var(--acento);outline-offset:2px}" +
      ".cbg-pr{appearance:none;border:0;background:none;font:inherit;font-size:inherit;font-weight:700;color:var(--texto-2);cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:0;min-height:24px}" +
      ".cbg-pr i{display:inline-block;width:14px;height:0;border-top:1.5px solid var(--texto-2);margin-right:1px}" +
      ".cbg-pr[aria-pressed=false]{opacity:.55;text-decoration:line-through}" +
      ".cbg-avg{stroke:var(--texto-2);stroke-width:1.5;fill:none;pointer-events:none}" +
      ".cbg-list{display:flex;flex-direction:column;margin-top:6px}" +
      ".cbg-row{appearance:none;font:inherit;color:var(--texto);text-align:left;cursor:pointer;background:none;border:0;border-top:1px solid var(--linea);padding:10px 4px;display:grid;grid-template-columns:1fr auto;gap:2px 10px;align-items:center;min-height:52px;width:100%;box-sizing:border-box}" +
      ".cbg-row:first-child{border-top:0}.cbg-row:disabled{cursor:default;opacity:.55}" +
      ".cbg-row.on{background:color-mix(in srgb,var(--acento) 9%,transparent);border-radius:12px}" +
      ".cbg-rl b{font-size:14px;font-weight:800}.cbg-rl em{font-style:normal;font-size:12px;font-weight:700;color:var(--texto-2);margin-left:6px}" +
      ".cbg-ra{text-align:right}.cbg-ra b{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums}.cbg-ra small{display:block;font-size:11.5px;font-weight:600;color:var(--texto-2)}" +
      ".cbg-row .cbg-chip{grid-column:1;justify-self:start;font-size:11.5px;padding:1px 8px}" +
      ".cbg-tr{grid-column:1/-1;display:block;height:5px;border-radius:5px;background:color-mix(in srgb,var(--texto) 7%,transparent);overflow:hidden}.cbg-tr u{display:block;height:100%;border-radius:5px;background:var(--acento);text-decoration:none}" +
      ".cbg-tip{position:fixed;z-index:60;background:var(--tarjeta);color:var(--texto);border:1px solid var(--linea);border-radius:14px;padding:10px 12px;box-shadow:0 10px 30px -10px rgba(10,34,51,.4);font-size:13px;min-width:190px;max-width:280px;pointer-events:none}" +
      ".cbg-tip[hidden]{display:none}.cbg-tip .t{font-size:12px;font-weight:800;color:var(--texto-2);margin-bottom:6px}" +
      ".cbg-tip .l{display:flex;justify-content:space-between;align-items:center;gap:14px;font-weight:700;padding:2px 0}.cbg-tip .l b{font-weight:800;font-variant-numeric:tabular-nums}" +
      ".cbg-tip .l i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}" +
      ".cbg-tip .f{border-top:1px solid var(--linea);margin-top:5px;padding-top:6px}" +
      "@media(min-width:1100px){.cbg-big{font-size:34px}}" +
      "@media(prefers-reduced-motion:reduce){.cbg-tip{transition:none}}";
    document.head.appendChild(st);
  };

  /* ---------- barra: punta redondeada, base recta ---------- */
  G.bar = function (cls, x, y, w, h, r, round) {
    if (!(h > 0.01) || !(w > 0.01)) return "";
    r = round ? Math.min(r, w / 2, h) : 0;
    var d;
    if (r > 0.1) d = "M" + x.toFixed(1) + "," + (y + h).toFixed(1) + "V" + (y + r).toFixed(1) + "Q" + x.toFixed(1) + "," + y.toFixed(1) + " " + (x + r).toFixed(1) + "," + y.toFixed(1) + "H" + (x + w - r).toFixed(1) + "Q" + (x + w).toFixed(1) + "," + y.toFixed(1) + " " + (x + w).toFixed(1) + "," + (y + r).toFixed(1) + "V" + (y + h).toFixed(1) + "Z";
    else d = "M" + x.toFixed(1) + "," + y.toFixed(1) + "H" + (x + w).toFixed(1) + "V" + (y + h).toFixed(1) + "H" + x.toFixed(1) + "Z";
    return '<path class="' + cls + '" d="' + d + '"/>';
  };

  /* ---------- encabezado vivo: período + valor grande + variación ---------- */
  G.split = function (s) { s = String(s); var i = s.lastIndexOf(","); return i > 0 && s.length - i <= 3 ? [s.slice(0, i), s.slice(i)] : [s, ""]; };
  G.hd = function (o) {
    var p = G.split(o.big);
    return '<div class="cbg-hd"><div class="cbg-hl"><small>' + o.lbl + '</small><div class="cbg-big">' + p[0] + (p[1] ? "<small>" + p[1] + "</small>" : "") + "</div></div>" +
      (o.chip ? '<span class="cbg-chip ' + (o.chip.c || "") + '">' + o.chip.t + "</span>" : "") + "</div>" + (o.sub ? '<div class="cbg-sub">' + o.sub + "</div>" : "");
  };

  /* ---------- control Gráfico | Lista ---------- */
  G.seg = function (lista) {
    return '<div class="cbg-seg" role="tablist" aria-label="Ver como"><button type="button" role="tab" data-cbg="graf" aria-selected="' + (!lista) + '">Gráfico</button><button type="button" role="tab" data-cbg="lista" aria-selected="' + (!!lista) + '">Lista</button></div>';
  };

  /* ---------- lista de meses (tabla equivalente del gráfico) ----------
     rows: [{k, lbl, tag, amt, sub, w (0-100), on, off, chip:{t,c}}] */
  G.list = function (rows) {
    return '<div class="cbg-list">' + rows.map(function (r) {
      return '<button type="button" class="cbg-row' + (r.on ? " on" : "") + '" data-m="' + esc(r.k) + '"' + (r.off ? " disabled" : "") + (r.on ? ' aria-current="true"' : "") + ">" +
        '<span class="cbg-rl"><b>' + r.lbl + "</b>" + (r.tag ? "<em>" + r.tag + "</em>" : "") + '</span><span class="cbg-ra"><b>' + r.amt + "</b>" + (r.sub ? "<small>" + r.sub + "</small>" : "") + "</span>" +
        (r.chip ? '<span class="cbg-chip ' + (r.chip.c || "") + '">' + r.chip.t + "</span>" : "") +
        '<i class="cbg-tr" aria-hidden="true"><u style="width:' + Math.max(0, Math.min(100, r.w || 0)).toFixed(1) + '%"></u></i></button>';
    }).join("") + "</div>";
  };

  /* ---------- interruptor del promedio (se recuerda por navegador) ---------- */
  var PK = "cb_prom_v1";
  G.promOn = function () { try { return localStorage.getItem(PK) !== "0"; } catch (e) { return true; } };
  G.promSet = function (on) { try { localStorage.setItem(PK, on ? "1" : "0"); } catch (e) {} };
  G.promBtn = function (txt) { var on = G.promOn(); return '<button type="button" class="cbg-pr" data-cbg="prom" aria-pressed="' + on + '"><i></i>' + txt + "</button>"; };
  /* promedio de los valores dados; null si hay menos de 3 */
  G.avg = function (vals) { var a = vals.filter(function (v) { return v != null && isFinite(v) && v > 0.004; }); if (a.length < 3) return null; return a.reduce(function (s, v) { return s + v; }, 0) / a.length; };

  /* ---------- tarjeta al pasar el cursor / enfocar con teclado ----------
     root: contenedor estable; sel: selector de cada barra/grupo; fn(el) -> html o "" */
  G.tip = function (root, sel, fn) {
    if (!root || root._cbgTip) return;
    root._cbgTip = true;
    var canHover = !!(window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches);
    function box() { var t = document.getElementById("cbgTip"); if (!t) { t = document.createElement("div"); t.id = "cbgTip"; t.className = "cbg-tip"; t.setAttribute("role", "tooltip"); t.hidden = true; document.body.appendChild(t); } return t; }
    function hide() { var t = document.getElementById("cbgTip"); if (t) t.hidden = true; }
    function show(el) {
      var html = fn(el); if (!html) { hide(); return; }
      G.css();
      var t = box(); t.innerHTML = html; t.hidden = false;
      var r = el.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight, vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      var x = r.right + 8; if (x + w > vw - 8) x = r.left - w - 8; if (x < 8) x = Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2));
      var y = r.top + 8; if (y + h > vh - 8) y = Math.max(8, vh - h - 8);
      t.style.left = Math.round(x) + "px"; t.style.top = Math.round(y) + "px";
    }
    root.addEventListener("mouseover", function (e) { if (!canHover) return; var el = e.target.closest && e.target.closest(sel); if (el && root.contains(el)) show(el); else hide(); });
    root.addEventListener("mouseleave", hide);
    root.addEventListener("focusin", function (e) { var el = e.target.closest && e.target.closest(sel); if (el && root.contains(el)) show(el); });
    root.addEventListener("focusout", hide);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
  };
  G.tipHide = function () { var t = document.getElementById("cbgTip"); if (t) t.hidden = true; };
})();

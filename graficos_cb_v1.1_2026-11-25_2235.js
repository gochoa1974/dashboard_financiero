/* graficos_cb_v1.1 · componente común de gráficos · 25 nov 2026 22:35
   v1.1 = v1 + barras por mes genéricas (CBG.bars: barras que nacen en 0 o flotantes para cascada, valores nunca girados,
   etiqueta solo donde cabe, barra elegida, línea de promedio/referencia), CBG.watch (redibuja al cambiar el ancho) y CBG.barD (punta redonda hacia abajo).
   Todo lo de v1 sigue igual (Ingresos y Gastos pueden seguir usando v1).
   (v1 · 25 nov 2026 19:30)
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
      ".cbg-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:8px 0 2px}.cbg-top>.rmk{font-size:13px;font-weight:600;color:var(--texto-2);min-width:0}" +
      ".cbg-svg{display:block;width:100%;height:auto;overflow:visible;margin-top:6px;-webkit-tap-highlight-color:transparent}" +
      ".cbg-svg text{fill:var(--texto-2);font-family:inherit;font-size:11px;font-weight:600}" +
      ".cbg-svg .gl{stroke:var(--linea);stroke-width:1}.cbg-svg .gt{text-anchor:start;font-size:10.5px}" +
      ".cbg-svg .ml{text-anchor:middle}.cbg-svg .m.on .ml{fill:var(--texto);font-weight:800}.cbg-svg .yl{text-anchor:middle;font-size:10px;opacity:.85}.cbg-svg .nd{text-anchor:middle;font-size:10px;opacity:.8}" +
      ".cbg-svg .vl{text-anchor:middle;fill:var(--texto);font-weight:800;paint-order:stroke;stroke:var(--tarjeta);stroke-width:5px;stroke-linejoin:round}" +
      ".cbg-svg .ul{fill:var(--texto)}.cbg-svg .hit{fill:transparent}.cbg-svg .m{cursor:pointer;outline:none}.cbg-svg .m.off{cursor:default}" +
      ".cbg-svg .bc{transition:opacity .15s}.cbg-svg.sel .m:not(.on) .bc{opacity:.5}.cbg-svg.sel .m.par:not(.on) .bc{opacity:.7}.cbg-svg.nodim .m:not(.on) .bc{opacity:1}" +
      ".cbg-svg .m:focus-visible .hit{stroke:var(--acento);stroke-width:2}" +
      ".cbg-ref{stroke:var(--texto);stroke-width:1.5;stroke-dasharray:5 4;fill:none;pointer-events:none}.cbg-cn{stroke:var(--texto-2);stroke-width:1;stroke-dasharray:2 3;opacity:.7;pointer-events:none}" +
      ".cbg-keys{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;font-size:12px;font-weight:700;color:var(--texto-2);margin:8px 0 0}.cbg-keys>span{display:inline-flex;align-items:center;gap:6px}.cbg-keys i.cbg-k{width:10px;height:10px;border-radius:3px;display:inline-block;flex:none}" +
      ".cbg-keys i.cbg-k.h{background:repeating-linear-gradient(45deg,var(--acento) 0 2px,color-mix(in srgb,var(--acento) 30%,transparent) 2px 5px)}" +
      ".cbg-hint{font-size:12px;font-weight:600;color:var(--texto-2);margin:8px 0 0}.cbg-sec{font-size:13px;font-weight:800;margin:14px 0 2px;color:var(--texto)}" +
      ".cbg-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;vertical-align:-1px}" +
      "@media(min-width:1100px){.cbg-big{font-size:34px}}" +
      "@media(prefers-reduced-motion:reduce){.cbg-tip{transition:none}}";
    document.head.appendChild(st);
  };

  /* ---------- barra: punta redondeada, base recta ---------- */
  G.bar = function (cls, x, y, w, h, r, round, style) {
    if (!(h > 0.01) || !(w > 0.01)) return "";
    r = round ? Math.min(r, w / 2, h) : 0;
    var d;
    if (r > 0.1) d = "M" + x.toFixed(1) + "," + (y + h).toFixed(1) + "V" + (y + r).toFixed(1) + "Q" + x.toFixed(1) + "," + y.toFixed(1) + " " + (x + r).toFixed(1) + "," + y.toFixed(1) + "H" + (x + w - r).toFixed(1) + "Q" + (x + w).toFixed(1) + "," + y.toFixed(1) + " " + (x + w).toFixed(1) + "," + (y + r).toFixed(1) + "V" + (y + h).toFixed(1) + "Z";
    else d = "M" + x.toFixed(1) + "," + y.toFixed(1) + "H" + (x + w).toFixed(1) + "V" + (y + h).toFixed(1) + "H" + x.toFixed(1) + "Z";
    return '<path class="' + cls + '" d="' + d + '"' + (style ? ' style="' + style + '"' : "") + "/>";
  };
  /* barra que cuelga de la línea cero: base recta arriba, punta redonda abajo */
  G.barD = function (cls, x, y, w, h, r, style) {
    if (!(h > 0.01) || !(w > 0.01)) return "";
    r = Math.min(r, w / 2, h);
    var d = "M" + x.toFixed(1) + "," + y.toFixed(1) + "H" + (x + w).toFixed(1) + "V" + (y + h - r).toFixed(1) + "Q" + (x + w).toFixed(1) + "," + (y + h).toFixed(1) + " " + (x + w - r).toFixed(1) + "," + (y + h).toFixed(1) + "H" + (x + r).toFixed(1) + "Q" + x.toFixed(1) + "," + (y + h).toFixed(1) + " " + x.toFixed(1) + "," + (y + h - r).toFixed(1) + "Z";
    return '<path class="' + cls + '" d="' + d + '"' + (style ? ' style="' + style + '"' : "") + "/>";
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
        '<span class="cbg-rl"><b>' + (r.c ? '<span class="cbg-dot" style="background:' + r.c + '"></span>' : "") + r.lbl + "</b>" + (r.tag ? "<em>" + r.tag + "</em>" : "") + '</span><span class="cbg-ra"><b>' + r.amt + "</b>" + (r.sub ? "<small>" + r.sub + "</small>" : "") + "</span>" +
        (r.chip ? '<span class="cbg-chip ' + (r.chip.c || "") + '">' + r.chip.t + "</span>" : "") +
        '<i class="cbg-tr" aria-hidden="true"><u style="width:' + Math.max(0, Math.min(100, r.w || 0)).toFixed(1) + '%' + (r.c ? ";background:" + r.c : "") + '"></u></i></button>';
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

  /* ---------- v1.1 · barras por mes ----------
     o: { items:[{k, ax (3 letras) | ax:[línea1,línea2], ax1 (1 letra), yr, val, lo, hi, end, c, partial, off, nd, txt, txtS, aria}],
          W, H, wide, sel, lines:[{v, cls}], max, min, ticks, axf(v), fmt(v), conn, label }
     - Sin lo/hi: la barra nace en 0 (hacia arriba si val>0, hacia abajo si val<0).
     - Con lo/hi: barra flotante (cascada); end = nivel donde termina, para el conector punteado.
     - Los números nunca van girados: se escriben donde caben; si no, solo en la barra elegida y la mayor. */
  var UID = 0;
  function niceTicks(mn, mx) {
    var rg = Math.max(mx - mn, 1e-9), raw = rg / 3, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p, st = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
    var lo = Math.floor(mn / st + 1e-9) * st, hi = Math.ceil(mx / st - 1e-9) * st, t = [];
    for (var v = lo; v <= hi + st / 2; v += st) t.push(Math.round(v * 1e6) / 1e6);
    return t;
  }
  G.bars = function (o) {
    var it = o.items || [], n = it.length; if (!n) return "";
    var id = ++UID, W = Math.max(280, Math.round(o.W || 330)), H = o.H || 180, wide = !!o.wide;
    var two = it.some(function (x) { return x.ax instanceof Array; }), yrs = it.some(function (x) { return x.yr; });
    var PL = o.noAxis ? 4 : (wide ? 46 : 36), PR = 4, PT = 22, PB = (two ? 38 : 24) + (yrs ? 12 : 0);
    var hi0 = 0, lo0 = 0;
    it.forEach(function (x) {
      var a = x.hi != null ? x.hi : (x.val != null ? Math.max(0, x.val) : 0), b = x.lo != null ? x.lo : (x.val != null ? Math.min(0, x.val) : 0);
      if (a > hi0) hi0 = a; if (b < lo0) lo0 = b;
    });
    (o.lines || []).forEach(function (l) { if (l.v != null && isFinite(l.v)) { if (l.v > hi0) hi0 = l.v; if (l.v < lo0) lo0 = l.v; } });
    if (o.max != null) hi0 = o.max; if (o.min != null) lo0 = o.min;
    var ah = H - PT - PB;
    /* abajo solo hay lugar para el número de la barra que cuelga; no se estira a la siguiente marca de la escala */
    var bot = lo0 < 0 ? lo0 - (Math.max(hi0, 1) - lo0) * (22 / Math.max(ah - 22, 40)) : 0;
    var ticks = o.ticks || niceTicks(bot, hi0 > 0 || lo0 < 0 ? hi0 : 1);
    var top = Math.max(ticks[ticks.length - 1], hi0);
    ticks = ticks.filter(function (v) { return v >= bot - 1e-9 && v <= top + 1e-9; });
    if (!(top > bot)) top = bot + 1;
    var Y = function (v) { return PT + ah * (top - v) / (top - bot); };
    var bw = (W - PL - PR) / n, g = Math.min(bw * 0.72, wide ? 44 : 26), rr = g >= 22 ? 6 : (g >= 12 ? 5 : 3);
    var fs = wide ? 12.5 : 11, cw = fs * 0.62;
    /* nombres de dos líneas que no caben bajo cada barra: se usa la forma corta (axS); el nombre completo queda en el encabezado y en la lista */
    var crowded = it.some(function (x) { return x.ax instanceof Array && Math.max.apply(null, x.ax.map(function (t) { return t.length; })) * (bw < 40 ? 5.4 : 5.9) > bw - 1; });
    var iSel = -1, iMax = -1, mv = -Infinity;
    it.forEach(function (x, i) { if (x.k === o.sel) iSel = i; var m = (x.hi != null ? x.hi : x.val); if (!x.nd && !x.off && m != null && m > mv) { mv = m; iMax = i; } });
    if (iMax >= 0 && iSel >= 0 && Math.abs(iMax - iSel) < 2) iMax = -1;
    var s = '<svg class="cbg-svg' + (iSel >= 0 ? " sel" : "") + (o.noDim ? " nodim" : "") + '" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="group" aria-label="' + esc(o.label || "Gráfico por mes") + '">';
    var pats = {}, pn = 0;
    function pat(c) { if (!pats[c]) { pats[c] = "cbgp" + id + "_" + (pn++); } return pats[c]; }
    var bars = "", labs = "", defs = "";
    ticks.forEach(function (v) { var y = Y(v); s += '<line class="gl" x1="' + PL + '" x2="' + W + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>' + (o.noAxis ? "" : '<text class="gt" x="0" y="' + (y + 3.5).toFixed(1) + '">' + esc((o.axf || String)(v)) + "</text>"); });
    var lastEnd = null, skip = (bw >= 28) ? 1 : Math.max(1, Math.ceil(9 / bw));
    it.forEach(function (x, i) {
      var x0 = PL + i * bw, bx = x0 + (bw - g) / 2, on = (i === iSel), c = x.c || "var(--acento)";
      var role = (x.off || x.nd) ? ' aria-hidden="true"' : ' role="button" tabindex="0"';
      var inner = '<rect class="hit" x="' + x0.toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '"/>';
      var yb = Y(0), topY = null, botY = null, neg = false;
      if (!x.nd && x.val != null) {
        var a = x.hi != null ? x.hi : Math.max(0, x.val), b = x.lo != null ? x.lo : Math.min(0, x.val);
        var y1 = Y(a), y2 = Y(b), h = Math.max(y2 - y1, 1.5), fill = x.partial ? "fill:url(#" + pat(c) + ")" : "fill:" + c;
        neg = (x.hi == null && x.val < 0);
        inner += neg ? G.barD("bc", bx, y1, g, h, rr, fill) : G.bar("bc", bx, y1, g, h, rr, true, fill);
        topY = y1; botY = y2;
        if (o.conn && i < n - 1 && x.end != null) { var ye = Y(x.end); bars += '<line class="cbg-cn" x1="' + (bx + g).toFixed(1) + '" x2="' + (x0 + bw + (bw - g) / 2).toFixed(1) + '" y1="' + ye.toFixed(1) + '" y2="' + ye.toFixed(1) + '"/>'; }
      } else if (x.nd) { inner += '<text class="nd" x="' + (bx + g / 2).toFixed(1) + '" y="' + (yb - 6).toFixed(1) + '">s/d</text>'; }
      var lay = H - PB;
      if (x.ax instanceof Array && crowded) { if (x.axS) inner += '<text class="ml" x="' + (x0 + bw / 2).toFixed(1) + '" y="' + (lay + 14) + '" style="font-size:9.5px">' + esc(x.axS) + "</text>"; }
      else if (x.ax instanceof Array) x.ax.forEach(function (t, k) { inner += '<text class="ml" x="' + (x0 + bw / 2).toFixed(1) + '" y="' + (lay + 14 + k * 12) + '" style="font-size:' + (bw < 40 ? 9.5 : 10.5) + 'px">' + esc(t) + "</text>"; });
      else if (x.ax != null && i % skip === 0) inner += '<text class="ml" x="' + (x0 + bw / 2).toFixed(1) + '" y="' + (lay + 15) + '">' + esc(bw >= 28 || !x.ax1 ? x.ax : x.ax1) + "</text>";
      if (on) inner += '<rect class="ul" x="' + (bx - 1).toFixed(1) + '" y="' + (lay + (two ? 30 : 20)) + '" width="' + (g + 2).toFixed(1) + '" height="3" rx="1.5"/>';
      if (x.yr) inner += '<text class="yl" x="' + (x0 + bw / 2).toFixed(1) + '" y="' + (lay + (two ? 41 : 30)) + '">' + esc(x.yr) + "</text>";
      bars += '<g class="m' + (on ? " on" : "") + (x.partial ? " par" : "") + (x.off ? " off" : "") + '" data-m="' + esc(x.k) + '"' + role + ' aria-label="' + esc(x.aria || x.k) + '"' + (on ? ' aria-current="true"' : "") + ">" + inner + "</g>";
      if (topY != null && x.txt != null) {
        var show = on || i === iMax, t = x.txt;
        if (!show) { if (t.length * cw + 6 <= bw) show = true; else if (x.txtS && x.txtS.length * cw + 6 <= bw) { show = true; t = x.txtS; } }
        if (show) {
          var cx = Math.max(PL + t.length * cw / 2, Math.min(W - 2 - t.length * cw / 2, bx + g / 2));
          var ty = neg ? (botY + fs + 2) : (topY - 5);
          /* si el número cae encima de una línea (promedio o equilibrio), se sube justo arriba de ella para que se lea limpio */
          if (!neg) (o.lines || []).forEach(function (l) { if (l.v == null || !isFinite(l.v)) return; var ly = Y(l.v); if (ty - fs * 0.85 < ly + 2 && ty + 3 > ly - 2) ty = ly - 4; });
          labs += '<text class="vl" x="' + cx.toFixed(1) + '" y="' + ty.toFixed(1) + '" style="font-size:' + fs + 'px">' + esc(t) + "</text>";
        }
      }
    });
    Object.keys(pats).forEach(function (c) { defs += '<pattern id="' + pats[c] + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" style="fill:' + c + ';opacity:.3"/><rect width="3" height="6" style="fill:' + c + '"/></pattern>'; });
    var lines = "";
    (o.lines || []).forEach(function (l) { if (l.v == null || !isFinite(l.v)) return; var y = Y(l.v).toFixed(1); lines += '<line class="' + (l.cls || "cbg-avg") + '" x1="' + PL + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/>'; });
    return s + (defs ? "<defs>" + defs + "</defs>" : "") + bars + lines + labs + "</svg>";
  };

  /* redibuja cuando cambia el ancho del contenedor (rotar el celular, abrir/cerrar menú, ventana) */
  G.watch = function (el, fn) {
    if (!el || el._cbgW) return; el._cbgW = el.clientWidth || 0;
    var raf = 0;
    function chk() { raf = 0; var w = el.clientWidth || 0; if (w > 0 && Math.abs(w - el._cbgW) > 2) { el._cbgW = w; try { fn(); } catch (e) {} } }
    if (window.ResizeObserver) new ResizeObserver(function () { if (!raf) raf = requestAnimationFrame(chk); }).observe(el);
    else window.addEventListener("resize", function () { if (!raf) raf = requestAnimationFrame(chk); });
  };
  /* ancho útil: el del contenedor; si aún está oculto, el de la ventana menos márgenes */
  G.width = function (el, fallback) { var w = el && el.clientWidth; return w > 0 ? w : (fallback || Math.max(280, Math.min((document.documentElement.clientWidth || 360) - 64, 700))); };
  G.isWide = function () { return !!(window.matchMedia && matchMedia("(min-width:1100px)").matches); };
  G.avgAll = function (vals) { var a = vals.filter(function (v) { return v != null && isFinite(v); }); if (a.length < 3) return null; return a.reduce(function (s, v) { return s + v; }, 0) / a.length; };
  G.fk = function (v) { var a = Math.abs(v), t = a >= 1000 ? (Math.round(a / 100) / 10 + "").replace(".", ",") + "k" : String(Math.round(a)); return (v < 0 ? "−" : "") + "$" + t; };
})();

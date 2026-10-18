/* comparar_cb_v1 · Filtro «Comparar» compartido (Resultados, Ingresos, Gastos) · 18 oct 2026
   Cada módulo lo configura con CBC.init({...}) y le entrega métricas. Aquí vive todo lo común:
   hoja de selección, series alineadas por mes, gráfico superpuesto, tabla con variación e insights.
   Reglas: solo meses cerrados; Acumulado no se compara; el mes en curso no entra. */
(function () {
  var MN = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var COL = ["var(--acento)", "#9aa6b2", "#e0a030", "#7c8cf8", "#d46aa0"];
  var CBC = window.CBC = {}, O = null, S = null, SH = null, draft = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function add(m, n) { var y = +m.slice(0, 4), k = +m.slice(5) - 1 + n; y += Math.floor(k / 12); k = ((k % 12) + 12) % 12; return y + "-" + pad(k + 1); }
  function mlab(m) { return MN[+m.slice(5) - 1] + " " + m.slice(2, 4); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function key() { return "cb_cmp_" + O.key; }
  function load() { try { var j = JSON.parse(localStorage.getItem(key()) || "null"); return j && j.mode ? j : null; } catch (e) { return null; } }
  function save() { try { if (S) localStorage.setItem(key(), JSON.stringify(S)); else localStorage.removeItem(key()); } catch (e) {} }
  function lastClosed() { return add(O.cur, -1); }
  function rng(f, t) { var o = [], m = f; while (m <= t && o.length < 400) { o.push(m); m = add(m, 1); } return o; }
  function num(n, d) { var p = Math.abs(n).toFixed(d || 0).split("."); return (n < 0 ? "−" : "") + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (p[1] ? "," + p[1] : ""); }
  function fm(M, v) { if (v == null || !isFinite(v)) return "—"; if (M.fmt === "%") return num(v, 1) + "%"; if (M.fmt === "n") return num(v, 0); if (M.fmt === "$2") return (v < 0 ? "−" : "") + "$" + num(Math.abs(v), 2); return (v < 0 ? "−" : "") + "$" + num(Math.abs(v), 0); }
  function fshort(M, v) { if (M.fmt === "%") return Math.round(v) + "%"; var a = Math.abs(v); var t = a >= 1000 ? (Math.round(a / 100) / 10 + "").replace(".", ",") + "k" : Math.round(a) + ""; return (v < 0 ? "−" : "") + (M.fmt === "n" ? "" : "$") + t; }

  /* ---------- series ---------- */
  function series() {
    if (!S) return null;
    var lc = lastClosed(), out = [], i;
    if (S.mode === "anios") {
      var ys = (S.years || []).slice().sort(), newest = ys[ys.length - 1], curY = +O.cur.slice(0, 4), cap = 12;
      if (!S.full && newest === curY) cap = +lc.slice(5);
      if (!S.full && newest === curY && +lc.slice(0, 4) < curY) cap = 0;
      ys.forEach(function (y) {
        var ms = [];
        for (var k = 1; k <= 12; k++) { var m = y + "-" + pad(k); if (!S.full && k > cap) break; if (m > lc) break; if (O.has(m)) ms.push(m); }
        if (ms.length) out.push({ id: "" + y, label: "" + y, months: ms });
      });
    } else if (S.mode === "rangos") {
      [S.B, S.A].forEach(function (r) {
        if (!r) return;
        var ms = rng(r.f, r.t).filter(function (m) { return m <= lc && O.has(m); });
        if (ms.length) out.push({ id: r.f + r.t, label: r.f === r.t ? mlab(r.f) : mlab(r.f) + "–" + mlab(r.t), months: ms });
      });
      out.sort(function (a, b) { return a.months[0] < b.months[0] ? -1 : 1; });
    } else if (S.mode === "previo") {
      var pm = (O.primary ? O.primary() : []).filter(function (m) { return m <= lc && O.has(m); });
      if (pm.length) {
        var prev = pm.map(function (m) { return add(m, -12); }).filter(function (m) { return O.has(m); });
        var pl = O.primaryLabel ? O.primaryLabel() : "Período";
        if (prev.length) out.push({ id: "ant", label: "Un año antes", months: prev });
        out.push({ id: "act", label: pl, months: pm });
      }
    }
    out.forEach(function (s) { s.slot = s.months.map(function (m, i) { return S.mode === "anios" ? +m.slice(5) - 1 : i; }); });
    out.forEach(function (s, k) { s.color = COL[Math.min(out.length - 1 - k, COL.length - 1)]; });
    return out.length >= 2 ? out : null;
  }
  CBC.series = series;
  CBC.active = function () { return !!series(); };
  CBC.on = function () { return !!S; };

  function mv(id, ms) { var M = O.metrics[id]; if (!M) return null; var v = M.val(ms); return v == null || !isFinite(v) ? null : v; }
  function delta(M, a, b) { if (a == null || b == null) return null; if (M.fmt === "%") return { t: (a - b >= 0 ? "+" : "−") + num(Math.abs(a - b), 1) + " pts", up: a - b }; if (b === 0) return null; var p = (a - b) / Math.abs(b) * 100; return { t: (p >= 0 ? "+" : "−") + num(Math.abs(p), 0) + "%", up: p }; }
  function dhtml(M, d) { if (!d) return '<span class="cbc-n">—</span>'; var good = M.good === "down" ? d.up <= 0 : d.up >= 0, z = Math.abs(d.up) < 0.05; return '<span class="' + (z ? "cbc-n" : good ? "cbc-g" : "cbc-b") + '">' + (z ? "" : d.up >= 0 ? "▲ " : "▼ ") + d.t + "</span>"; }

  /* ---------- gráfico ---------- */
  function chart(host, ss, mid) {
    var M = O.metrics[mid], ns = ss.length, L = Math.max.apply(null, ss.map(function (s) { return Math.max.apply(null, s.slot) + 1; })), el = host.querySelector(".cbc-svg");
    var narrow = (host.clientWidth || 700) < 520, W = narrow ? 380 : 640, H = 230, pl = narrow ? 38 : 46, pt = 16, pb = 26, vals = [], all = [];
    ss.forEach(function (s) { var a = []; for (var i = 0; i < L; i++) { var ix = s.slot.indexOf(i), v = ix >= 0 ? mv(mid, [s.months[ix]]) : null; a.push(v); if (v != null) all.push(v); } vals.push(a); });
    var ref = O.ref ? O.ref(mid, ss[ss.length - 1].months) : null; if (ref && ref.v != null) all.push(ref.v);
    if (!all.length) { el.innerHTML = ""; return; }
    var mx = Math.max(0, Math.max.apply(null, all)) * 1.12 || 1, mn = Math.min(0, Math.min.apply(null, all)); if (mn < 0) mn *= 1.15;
    var yy = function (v) { return pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn)); }, s = "", i, k;
    el.setAttribute("viewBox", "0 0 " + W + " " + H);
    [mn, mn < 0 ? 0 : (mx / 2), mx].forEach(function (t) { s += '<line x1="' + pl + '" x2="' + W + '" y1="' + yy(t) + '" y2="' + yy(t) + '" stroke="var(--linea)"/><text x="0" y="' + (yy(t) + 3) + '" class="cbc-t">' + fshort(M, t) + "</text>"; });
    var bw = (W - pl) / L, newest = ss[ns - 1];
    var mode = ns <= 2 ? "bars" : "lines";
    function xl(i) { var ms = ss.map(function (z) { var ix = z.slot.indexOf(i); return ix >= 0 ? z.months[ix] : null; }).filter(Boolean), m0 = ms[ms.length - 1]; if (!m0) return ""; var same = ms.every(function (m) { return m.slice(5) === m0.slice(5); }); return same ? MN[+m0.slice(5) - 1] : mlab(m0); }
    for (i = 0; i < L; i++) { if (L <= 14 || i % 2 === 0) s += '<text x="' + (pl + i * bw + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle" class="cbc-t">' + xl(i) + "</text>"; }
    if (mode === "bars") {
      var w = Math.min(bw * .8 / ns, 24);
      ss.forEach(function (z, si) {
        for (i = 0; i < L; i++) { var v = vals[si][i]; if (v == null) continue; var gx = pl + i * bw + bw / 2 - (ns * w) / 2 + si * w, col = z.color;
          if (si === ns - 1 && ref && ref.v != null && mid === (ref.metric || mid) && v < ref.v && ref.red) col = "var(--error)";
          s += '<rect x="' + gx + '" y="' + Math.min(yy(v), yy(0)) + '" width="' + (w - 2) + '" height="' + Math.max(Math.abs(yy(0) - yy(v)), 1) + '" rx="3" fill="' + col + '"/>'; }
      });
    } else {
      ss.forEach(function (z, si) {
        var pts = []; for (i = 0; i < L; i++) { if (vals[si][i] != null) pts.push([pl + i * bw + bw / 2, yy(vals[si][i])]); }
        s += '<polyline fill="none" stroke="' + z.color + '" stroke-width="' + (si === ns - 1 ? 3 : 2) + '" stroke-linejoin="round" points="' + pts.map(function (p) { return p[0] + "," + p[1]; }).join(" ") + '"/>';
        pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (si === ns - 1 ? 3.2 : 2.4) + '" fill="var(--tarjeta)" stroke="' + z.color + '" stroke-width="2"/>'; });
      });
    }
    if (ref && ref.v != null) s += '<line x1="' + pl + '" x2="' + W + '" y1="' + yy(ref.v) + '" y2="' + yy(ref.v) + '" stroke="var(--texto)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="' + W + '" y="' + (yy(ref.v) - 5) + '" text-anchor="end" class="cbc-t" style="font-weight:800;fill:var(--texto);stroke:var(--tarjeta);stroke-width:3px;paint-order:stroke">' + esc(ref.label) + " " + fm(M, ref.v) + "</text>";
    el.innerHTML = s;
  }

  /* ---------- panel ---------- */
  function title(ss) { return ss.map(function (s) { return s.label; }).reverse().join(" · "); }
  function render() {
    var host = O && O.host && document.getElementById(O.host); if (!host) return;
    var ss = series();
    if (!ss) {
      if (S) { host.hidden = false; host.innerHTML = '<div class="cbc-card"><div class="cbc-h"><h2>Comparación</h2><button type="button" class="cbc-lk" data-cbc="x">Quitar</button></div><p class="cbc-d">No hay meses cerrados suficientes para comparar con esta selección. Cambia los años o los períodos.</p><button type="button" class="cbc-b2" data-cbc="open">Cambiar comparación</button></div>'; }
      else { host.hidden = true; host.innerHTML = ""; }
      return;
    }
    host.hidden = false;
    var ns = ss.length, nw = ss[ns - 1], pv = ss[ns - 2], mid = (S.metric && O.metrics[S.metric] && O.chart.indexOf(S.metric) >= 0) ? S.metric : O.chart[0], h = "";
    var sameN = ss.every(function (z) { return z.months.length === nw.months.length; });
    h += '<div class="cbc-card"><div class="cbc-h"><h2>Comparación · ' + esc(title(ss)) + '</h2><span><button type="button" class="cbc-lk" data-cbc="open">Cambiar</button> <button type="button" class="cbc-lk" data-cbc="x">Quitar</button></span></div>';
    h += '<p class="cbc-d">' + (sameN ? nw.months.length + (nw.months.length === 1 ? " mes cerrado" : " meses cerrados") + " en cada uno" : "Solo meses cerrados; los períodos tienen distinta cantidad de meses") + ".</p>";
    h += '<div class="cbc-k">' + O.kpis.map(function (id) { var M = O.metrics[id]; if (!M) return ""; var a = mv(id, nw.months), b = mv(id, pv.months); return '<div class="cbc-kc"><span>' + esc(M.label) + '</span><b>' + fm(M, a) + "</b><small>" + dhtml(M, delta(M, a, b)) + " vs " + esc(pv.label) + "</small></div>"; }).join("") + "</div></div>";
    h += '<div class="cbc-card"><div class="cbc-h"><h2>' + esc(O.metrics[mid].label) + " por mes</h2></div>";
    h += '<div class="cbc-seg" role="tablist">' + O.chart.map(function (id) { return '<button type="button" role="tab" data-cbc="m" data-m="' + id + '" aria-selected="' + (id === mid) + '">' + esc(O.metrics[id].label) + "</button>"; }).join("") + "</div>";
    h += '<svg class="cbc-svg" role="img" aria-label="' + esc(O.metrics[mid].label) + ' por mes, comparación" style="width:100%;display:block"></svg>';
    h += '<div class="cbc-lg">' + ss.slice().reverse().map(function (z) { return '<span><i style="background:' + z.color + '"></i>' + esc(z.label) + "</span>"; }).join("") + (O.ref && O.ref(mid, nw.months) && O.ref(mid, nw.months).red ? '<span><i style="background:var(--error)"></i>Bajo el equilibrio</span>' : "") + "</div></div>";
    h += '<div class="cbc-card"><div class="cbc-h"><h2>Tabla comparativa</h2></div><div class="cbc-tw"><table class="cbc-tb"><thead><tr><th></th>' + ss.map(function (z) { return "<th>" + esc(z.label) + "</th>"; }).join("") + "<th>Variación</th></tr></thead><tbody>";
    O.rows.forEach(function (r) { var id = r[0], M = O.metrics[id]; if (!M) return; var vv = ss.map(function (z) { return mv(id, z.months); }); h += '<tr class="' + (r[1] ? "cbc-s" : "") + '"><td>' + esc(M.label) + "</td>" + vv.map(function (v) { return "<td>" + fm(M, v) + "</td>"; }).join("") + "<td>" + dhtml(M, delta(M, vv[ns - 1], vv[ns - 2])) + "</td></tr>"; });
    h += "</tbody></table></div></div>";
    /* insights */
    var ins = [], main = O.kpis[0], MM = O.metrics[main], a0 = mv(main, nw.months), b0 = mv(main, pv.months);
    if (MM && a0 != null && b0 != null) { var d0 = delta(MM, a0, b0); ins.push(esc(MM.label) + " de <b>" + esc(nw.label) + "</b>: " + fm(MM, a0) + " frente a " + fm(MM, b0) + " de <b>" + esc(pv.label) + "</b>" + (d0 ? " (" + d0.t + ")" : "") + "."); }
    var best = null, worst = null; nw.months.forEach(function (m) { var v = mv(mid, [m]); if (v == null) return; if (!best || v > best[1]) best = [m, v]; if (!worst || v < worst[1]) worst = [m, v]; });
    if (best && worst && best[0] !== worst[0]) ins.push("En " + esc(nw.label) + ", " + O.metrics[mid].label.toLowerCase() + ": mejor mes <b>" + mlab(best[0]) + "</b> (" + fm(O.metrics[mid], best[1]) + "), más bajo <b>" + mlab(worst[0]) + "</b> (" + fm(O.metrics[mid], worst[1]) + ").");
    if (ins.length) h += '<div class="cbc-card cbc-i"><div class="cbc-h"><h2>Lo que se ve</h2></div><ul>' + ins.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>";
    host.innerHTML = h;
    chart(host, ss, mid);
  }
  CBC.render = render;

  /* ---------- hoja ---------- */
  function ensureDom() {
    if (document.getElementById("cbcSh")) return;
    var st = document.createElement("style");
    st.textContent = ".cbc-bg{position:fixed;inset:0;background:rgba(5,15,25,.5);opacity:0;pointer-events:none;transition:opacity .2s;z-index:80}.cbc-bg.on{opacity:1;pointer-events:auto}" +
      ".cbc-sh{position:fixed;left:0;right:0;bottom:0;margin:0 auto;max-width:560px;background:var(--tarjeta);color:var(--texto);border-radius:22px 22px 0 0;padding:10px 18px calc(18px + env(safe-area-inset-bottom));z-index:81;max-height:92vh;overflow:auto;transform:translateY(105%);transition:transform .25s;box-shadow:0 -12px 40px -12px rgba(0,0,0,.4)}.cbc-sh.on{transform:none}" +
      "@media(min-width:900px){.cbc-sh{bottom:auto;top:50%;border-radius:22px;transform:translateY(-40%);opacity:0;pointer-events:none}.cbc-sh.on{transform:translateY(-50%);opacity:1;pointer-events:auto}}" +
      ".cbc-sh .gr{width:40px;height:4px;border-radius:4px;background:var(--linea);margin:0 auto 12px}.cbc-sh h3{margin:0 0 10px;font-size:18px;font-weight:800}.cbc-sh .gt{font-size:12px;font-weight:800;color:var(--texto-2);margin:14px 0 6px}" +
      ".cbc-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:color-mix(in srgb,var(--texto) 7%,transparent);padding:4px;border-radius:14px}.cbc-modes button{appearance:none;border:0;background:transparent;font:inherit;font-size:13px;font-weight:700;color:var(--texto-2);min-height:42px;border-radius:11px;cursor:pointer;padding:0 4px}.cbc-modes button[aria-selected=true]{background:var(--tarjeta);color:var(--texto);box-shadow:0 1px 3px rgba(0,0,0,.14)}" +
      ".cbc-ch{display:flex;flex-wrap:wrap;gap:8px}.cbc-ch button{appearance:none;font:inherit;font-size:14px;font-weight:700;min-height:44px;padding:0 16px;border-radius:99px;border:1px solid var(--linea);background:var(--fondo);color:var(--texto);cursor:pointer}.cbc-ch button[aria-pressed=true]{background:var(--texto);color:var(--fondo);border-color:var(--texto)}" +
      ".cbc-r2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cbc-sh label{display:block;font-size:12.5px;font-weight:700;color:var(--texto-2);margin-bottom:4px}.cbc-sh input[type=month]{font:inherit;font-size:16px;width:100%;min-height:46px;border:1px solid var(--linea);border-radius:12px;padding:0 10px;background:var(--fondo);color:var(--texto);box-sizing:border-box}" +
      ".cbc-note{font-size:12.5px;color:var(--texto-2);font-weight:600;line-height:1.45;margin:8px 0 0}.cbc-err{font-size:12.5px;font-weight:800;color:var(--error);min-height:16px;margin-top:8px}.cbc-act{display:flex;gap:10px;margin-top:14px}" +
      ".cbc-act button{appearance:none;font:inherit;font-weight:800;font-size:15px;min-height:48px;border-radius:12px;border:1px solid var(--linea);background:transparent;color:var(--texto-2);cursor:pointer;padding:0 16px}.cbc-act .go{flex:1;background:var(--acento);border-color:var(--acento);color:#04261a}" +
      ".cbc-card{background:var(--tarjeta);border:1px solid var(--linea);border-radius:18px;padding:16px;margin-bottom:12px}.cbc-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.cbc-h{flex-wrap:wrap}.cbc-h h2{margin:0;font-size:16px;font-weight:800;min-width:0}.cbc-h>span{white-space:nowrap}" +
      ".cbc-lk{appearance:none;background:none;border:0;font:inherit;font-size:13px;font-weight:800;color:var(--acento-texto);cursor:pointer;min-height:36px;padding:0 6px}.cbc-d{margin:2px 0 10px;font-size:12.5px;color:var(--texto-2);font-weight:600}" +
      ".cbc-k{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}@media(min-width:760px){.cbc-k{grid-template-columns:repeat(4,minmax(0,1fr))}}.cbc-kc{border:1px solid var(--linea);border-radius:14px;padding:11px;background:var(--fondo)}.cbc-kc span{display:block;font-size:12px;font-weight:700;color:var(--texto-2)}.cbc-kc b{display:block;font-size:21px;font-weight:800;margin:2px 0;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.cbc-kc small{font-size:11.5px;color:var(--texto-2);font-weight:600}" +
      ".cbc-g{color:var(--ok,#0a7d4b);font-weight:800}.cbc-b{color:var(--error);font-weight:800}.cbc-n{color:var(--texto-2);font-weight:700}" +
      ".cbc-seg{display:flex;gap:6px;margin:10px 0 8px;overflow-x:auto}.cbc-seg button{appearance:none;font:inherit;font-size:13px;font-weight:700;min-height:38px;padding:0 14px;border-radius:99px;border:1px solid var(--linea);background:var(--fondo);color:var(--texto);cursor:pointer;white-space:nowrap}.cbc-seg button[aria-selected=true]{background:var(--texto);color:var(--fondo);border-color:var(--texto)}" +
      ".cbc-svg text.cbc-t{font-size:10px;fill:var(--texto-2);font-weight:600}.cbc-lg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;font-weight:700;color:var(--texto-2);margin-top:6px}.cbc-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}" +
      ".cbc-tw{overflow-x:auto;margin:8px -4px 0}.cbc-tb{width:100%;border-collapse:collapse;font-size:14px}.cbc-tb th{font-size:11.5px;color:var(--texto-2);text-align:right;padding:8px 6px;border-bottom:1px solid var(--linea)}.cbc-tb th:first-child,.cbc-tb td:first-child{text-align:left}.cbc-tb td:first-child{text-transform:none}.cbc-tb td{padding:10px 6px;border-bottom:1px solid var(--linea);text-align:right;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}.cbc-tb tr.cbc-s td{font-weight:800;background:color-mix(in srgb,var(--texto) 5%,transparent)}" +
      ".cbc-i ul{margin:8px 0 0;padding-left:18px;font-size:13.5px;line-height:1.55;font-weight:600}.cbc-b2{appearance:none;font:inherit;font-weight:800;min-height:44px;border-radius:12px;border:1px solid var(--acento);background:transparent;color:var(--acento-texto);padding:0 16px;cursor:pointer}" +
      "@media(max-width:460px){.cbc-tb{font-size:12.5px}.cbc-tb td,.cbc-tb th{padding-left:3px;padding-right:3px}}";
    document.head.appendChild(st);
    var bg = document.createElement("div"); bg.className = "cbc-bg"; bg.id = "cbcBg";
    SH = document.createElement("div"); SH.className = "cbc-sh"; SH.id = "cbcSh"; SH.setAttribute("role", "dialog"); SH.setAttribute("aria-modal", "true"); SH.setAttribute("aria-labelledby", "cbcT"); SH.setAttribute("aria-hidden", "true");
    document.body.appendChild(bg); document.body.appendChild(SH);
    bg.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    SH.addEventListener("click", sheetClick);
  }
  function years() { var y0 = +O.first.slice(0, 4), y1 = +O.cur.slice(0, 4), o = []; for (var y = y1; y >= y0; y--) o.push(y); return o; }
  function defaults() {
    var lc = lastClosed(), ys = years(), a = { f: add(lc, -2), t: lc }; if (a.f < O.first) a.f = O.first;
    return { mode: "anios", years: ys.slice(0, 2).sort(), full: false, A: a, B: { f: add(a.f, -12), t: add(a.t, -12) }, metric: null };
  }
  function sheetHtml() {
    var D = draft, lc = lastClosed(), ys = years(), curY = +O.cur.slice(0, 4), h = '<div class="gr"></div><h3 id="cbcT">Comparar</h3>';
    h += '<div class="cbc-modes" role="tablist">' + [["anios", "Años"], ["rangos", "Períodos"], ["previo", "Año anterior"]].map(function (m) { return '<button type="button" role="tab" data-cb="mode" data-v="' + m[0] + '" aria-selected="' + (D.mode === m[0]) + '">' + m[1] + "</button>"; }).join("") + "</div>";
    if (D.mode === "anios") {
      h += '<div class="gt">Elige dos o más años</div><div class="cbc-ch">' + ys.map(function (y) { return '<button type="button" data-cb="year" data-v="' + y + '" aria-pressed="' + (D.years.indexOf(y) >= 0) + '">' + y + "</button>"; }).join("") + "</div>";
      h += '<div class="gt">Atajos</div><div class="cbc-ch">' + [2, 3, 4].filter(function (n) { return n <= ys.length; }).map(function (n) { return '<button type="button" data-cb="last" data-v="' + n + '" aria-pressed="false">Últimos ' + n + " años</button>"; }).join("") + "</div>";
      if (D.years.indexOf(curY) >= 0 && +lc.slice(0, 4) === curY) {
        h += '<div class="gt">El año en curso</div><div class="cbc-ch"><button type="button" data-cb="full" data-v="0" aria-pressed="' + (!D.full) + '">Mismo período (ene–' + MN[+lc.slice(5) - 1] + ")</button><button type=\"button\" data-cb=\"full\" data-v=\"1\" aria-pressed=\"" + D.full + '">Año completo</button></div>';
        h += '<p class="cbc-note">' + (D.full ? "Los otros años se muestran completos y " + curY + " hasta el último mes cerrado." : "Todos los años se comparan solo de enero a " + MN[+lc.slice(5) - 1] + ", para que sea justo.") + "</p>";
      }
    } else if (D.mode === "rangos") {
      h += '<div class="gt">Período A (el más reciente)</div><div class="cbc-r2"><div><label for="cbA1">Desde</label><input type="month" id="cbA1" value="' + D.A.f + '" min="' + O.first + '" max="' + lc + '"></div><div><label for="cbA2">Hasta</label><input type="month" id="cbA2" value="' + D.A.t + '" min="' + O.first + '" max="' + lc + '"></div></div>';
      h += '<div class="gt">Período B (contra el que comparas)</div><div class="cbc-r2"><div><label for="cbB1">Desde</label><input type="month" id="cbB1" value="' + D.B.f + '" min="' + O.first + '" max="' + lc + '"></div><div><label for="cbB2">Hasta</label><input type="month" id="cbB2" value="' + D.B.t + '" min="' + O.first + '" max="' + lc + '"></div></div>';
      h += '<p class="cbc-note">Cualquier combinación: mes contra mes, tres meses contra tres meses, un trimestre contra otro. Solo meses cerrados.</p>';
    } else {
      h += '<p class="cbc-note" style="margin-top:14px">Compara lo que tienes elegido arriba (Mes, año, Período…) contra <b>el mismo período un año antes</b>. Solo meses cerrados. El Acumulado no se compara.</p>';
    }
    h += '<div class="cbc-err" id="cbcE" role="alert"></div><div class="cbc-act"><button type="button" data-cb="quit">' + (S ? "Quitar" : "Cancelar") + '</button><button type="button" class="go" data-cb="apply">Comparar</button></div>';
    return h;
  }
  function paint() { SH.innerHTML = sheetHtml(); }
  function readRanges() { var g = function (i) { var e = document.getElementById(i); return e ? e.value : ""; }; if (draft.mode === "rangos") { draft.A = { f: g("cbA1"), t: g("cbA2") }; draft.B = { f: g("cbB1"), t: g("cbB2") }; } }
  function open() {
    ensureDom(); draft = JSON.parse(JSON.stringify(S || defaults())); if (!draft.A) draft.A = defaults().A; if (!draft.B) draft.B = defaults().B; if (!draft.years) draft.years = defaults().years;
    paint(); SH.classList.add("on"); document.getElementById("cbcBg").classList.add("on"); SH.setAttribute("aria-hidden", "false");
  }
  function close() { if (!SH) return; SH.classList.remove("on"); var b = document.getElementById("cbcBg"); if (b) b.classList.remove("on"); SH.setAttribute("aria-hidden", "true"); }
  function err(t) { var e = document.getElementById("cbcE"); if (e) e.textContent = t; }
  function sheetClick(e) {
    var b = e.target.closest("button[data-cb]"); if (!b) return; var a = b.dataset.cb, v = b.dataset.v;
    readRanges();
    if (a === "mode") { draft.mode = v; paint(); return; }
    if (a === "year") { var y = +v, i = draft.years.indexOf(y); if (i >= 0) draft.years.splice(i, 1); else draft.years.push(y); paint(); return; }
    if (a === "last") { draft.years = years().slice(0, +v).sort(); paint(); return; }
    if (a === "full") { draft.full = v === "1"; paint(); return; }
    if (a === "quit") { if (S) { S = null; save(); } close(); if (O.onChange) O.onChange(); return; }
    if (a === "apply") {
      var lc = lastClosed();
      if (draft.mode === "anios") { if (draft.years.length < 2) { err("Elige al menos dos años."); return; } }
      if (draft.mode === "rangos") {
        var ok = function (r) { return r && r.f && r.t && r.f <= r.t; };
        if (!ok(draft.A) || !ok(draft.B)) { err("Completa «desde» y «hasta» en los dos períodos (el «hasta» no puede ser anterior)."); return; }
        if (draft.A.t > lc || draft.B.t > lc) { err("Solo meses cerrados: el último es " + mlab(lc) + "."); return; }
      }
      S = JSON.parse(JSON.stringify(draft)); var test = series();
      if (!test) { err(draft.mode === "previo" ? "El período elegido arriba no tiene meses cerrados con año anterior. Cambia el filtro." : "Esa selección no tiene meses cerrados suficientes para comparar."); S = null; return; }
      save(); close(); if (O.onChange) O.onChange();
    }
  }
  /* clics del panel (cambiar / quitar / métrica) */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cbc]"); if (!b || !O) return; var a = b.dataset.cbc;
    if (a === "open") open();
    else if (a === "x") { S = null; save(); if (O.onChange) O.onChange(); }
    else if (a === "m") { S.metric = b.dataset.m; save(); render(); }
  });

  CBC.init = function (o) { O = o; S = load(); };
  CBC.open = function () { if (O) open(); };
  CBC.chipHtml = function (cls) { return '<button type="button" class="' + (cls || "pchip") + '" id="cmpB" aria-haspopup="dialog" aria-pressed="' + (!!series()) + '">Comparar</button>'; };
})();

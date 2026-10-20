/* glosario_cb_v1 (20 oct 2026 10:00): fuente única de definiciones + ayuda ⓘ + hoja de ayuda. Lo usan Hotelería y la pantalla Glosario. */
(function(){
var T={
base:{g:"Dinero",t:"Neto, bruto, con y sin limpieza",q:"Cada cifra dice en qué base está calculada, para que puedas compararla con otras herramientas sin confundirte.",
  lista:[["Neto","Sin descontar nada al huésped: es lo que recibes tú, sin la comisión de Airbnb ni de otras plataformas (OTA)."],["Bruto","Lo que paga el huésped, antes de restar la comisión de Airbnb u otra plataforma (OTA)."],["Sin limpieza","No cuenta la tarifa de limpieza que cobras al huésped."],["Con limpieza","Suma la tarifa de limpieza que cobras al huésped."]],
  v:"Hotelería, Resultados"},
noche_disp:{g:"Noches",t:"Noche disponible",q:"Una noche que se podía vender. En Hotelería es cada día transcurrido desde la primera reserva, hasta ayer.",f:"Cada día transcurrido, menos las noches bloqueadas o de cortesía",e:"Del 1 al 18 de octubre hay 18 noches; si 1 fue de cortesía, quedan 17 disponibles.",
  o:"Una noche de cortesía (por ejemplo, regalada a un familiar) se trata como bloqueada: sale de las disponibles y de las vendidas, y no tiene ingreso. AirDNA y PriceLabs también sacan las noches bloqueadas. Hoy se detectan las extensiones sin pago; los bloqueos del panel Cancelaciones y bloqueos aún no llegan al maestro.",v:"Hotelería"},
noche_vend:{g:"Noches",t:"Noche vendida",q:"Una noche con huésped que pagó. La noche de salida no cuenta. Incluye las extensiones de estadía pagadas; las noches de cortesía no cuentan.",f:"Cada noche entre la llegada y la salida",e:"Llega el 9 y sale el 11 = 2 noches vendidas.",v:"Hotelería"},
ocupacion:{g:"Indicadores",t:"Ocupación",q:"Qué parte de las noches disponibles tuvo huésped.",f:"Noches vendidas ÷ noches disponibles",e:"9 ÷ 18 = 50%.",
  c:["PriceLabs y AirDNA sacan las noches bloqueadas del cálculo.","La ocupación de mercado de PriceLabs es estimada y promedia todos los listados del set, incluidos los inactivos: no es comparable directo con la tuya."],v:"Hotelería"},
adr:{g:"Indicadores",t:"ADR · tarifa media por noche",q:"Cuánto se cobra, en promedio, por cada noche vendida. Las noches vacías no cuentan.",f:"Ingreso de hospedaje ÷ noches vendidas",e:"2 noches a $100 cada una = ADR de $100.",
  tt:"Tres versiones. Ejemplo: 2 noches a $100 + $30 de limpieza, comisión 15,5%",
  tabla:[["ADR bruto, sin limpieza","Lo que paga el huésped por dormir, antes de comisión","$100,00"],["ADR bruto, con limpieza","Lo anterior más la limpieza cobrada, repartida entre las noches","$115,00"],["ADR neto, sin limpieza","Lo que te queda por dormir, tras la comisión de Airbnb","$84,50"]],
  c:["PriceLabs: bruto, sin limpieza.","AirDNA: con limpieza, sin la tarifa de servicio al huésped.","Ninguna usa el neto: es tu indicador propio. Desde el 15 sep 2026 el ADR de PriceLabs incluye la comisión de Airbnb."],v:"Hotelería, Resultados"},
revpar:{g:"Indicadores",t:"RevPAR",q:"Cuánto rinde cada noche disponible, se venda o no. Baja tanto con noches vacías como con precios bajos, por eso es el mejor resumen.",f:"Ingreso ÷ noches disponibles = ADR × ocupación",e:"$82,43 × 50% = $41,22.",
  c:["PriceLabs: ocupación × ADR, en bruto y sin limpieza.","AirDNA y PriceLabs sacan las noches bloqueadas de las disponibles."],v:"Hotelería, Resultados"},
duracion:{g:"Indicadores",t:"Duración de estadía",q:"Cuántas noches se queda cada huésped. Antes se llamaba «Estadía media».",f:"Noches por reserva con check-in en el período",e:"Reservas de 1, 2 y 6 noches: promedio 3, mediana 2.",
  c:["PriceLabs usa la mediana, para que una estadía larga no distorsione. Aquí ves la mediana y el promedio."],o:"PriceLabs cuenta las reservas hechas en el período; Hotelería cuenta las que llegan en el período.",v:"Hotelería"},
ventana:{g:"Indicadores",t:"Ventana de reserva",q:"Con cuántos días de anticipación reservan tus huéspedes. Antes se llamaba «Anticipación».",f:"Fecha de llegada − fecha de reserva",e:"Reservó el 1 oct, llega el 9 oct = 8 días.",c:["Mismo nombre que PriceLabs."],v:"Hotelería"},
cancelaciones:{g:"Indicadores",t:"Cancelaciones",q:"Reservas canceladas, contadas por la fecha de check-in.",f:"Cancelaciones registradas con check-in en el período",
  o:"Todavía no distingue quién canceló. Para la meta de Superhost (menos del 1%) solo cuentan las canceladas por el anfitrión.",v:"Hotelería, Cancelaciones"},
neto:{g:"Dinero",t:"Neto",q:"Lo que queda después de la comisión de Airbnb.",f:"Cobrado al huésped − comisión de Airbnb",e:"Reserva de $230 con comisión 15,5% = $194,35.",v:"Resultados, Ingresos"},
por_liquidar:{g:"Dinero",t:"Por liquidar",q:"Dinero esperado que Airbnb todavía no transfiere.",v:"Ingresos"},
devengado:{g:"Dinero",t:"Devengado",q:"El neto total, incluye lo que falta por liquidar y los adicionales cobrados. No es caja.",v:"Resultados"},
caja:{g:"Dinero",t:"Caja",q:"Lo que ya entró a tu cuenta: neto ya liquidado más adicionales cobrados.",v:"Resultados"},
margen_limpieza:{g:"Dinero",t:"Margen de limpieza",q:"Lo que sobra de la limpieza cobrada, después de la comisión y del costo real de limpiar.",f:"Limpieza cobrada × (1 − comisión) − costo de limpieza",e:"$30 × 0,845 − $20 = $5,35.",v:"Ingresos, Resultados"}
};
var ORDER=["base","noche_disp","noche_vend","ocupacion","adr","revpar","duracion","ventana","cancelaciones","neto","por_liquidar","devengado","caja","margen_limpieza"];
var URL_G="../glosario/";
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

var css=".gl-i{display:inline-flex;align-items:center;justify-content:center;flex:none;width:22px;height:22px;border-radius:99px;border:1.5px solid currentColor;font:800 12px/1 var(--fuente,system-ui);font-style:normal;opacity:.8}"
+".gl-h{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:44px;margin:-8px 0 0;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}"
+".gl-h:focus-visible,.gl-t:focus-visible{outline:2px solid var(--acento,#0b7a55);outline-offset:2px;border-radius:8px}"
+".gl-t{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer}"
+".gl-bg{position:fixed;inset:0;background:rgba(5,16,24,.55);opacity:0;pointer-events:none;transition:opacity .2s;z-index:30}.gl-bg.on{opacity:1;pointer-events:auto}"
+".gl-sh{position:fixed;left:0;right:0;bottom:0;max-width:560px;max-height:86vh;overflow:auto;margin:0 auto;background:var(--tarjeta,#fff);color:var(--texto,#0a2233);border-radius:24px 24px 0 0;padding:16px 18px calc(20px + env(safe-area-inset-bottom));z-index:31;transform:translateY(105%);visibility:hidden;transition:transform .25s,visibility 0s .25s;font-family:var(--fuente,system-ui)}"
+".gl-sh.on{transform:none;visibility:visible;transition:transform .25s}"
+"@media(min-width:760px){.gl-sh{top:50%;bottom:auto;border-radius:24px;transform:translateY(-46%);opacity:0}.gl-sh.on{transform:translateY(-50%);opacity:1}}"
+"@media(prefers-reduced-motion:reduce){.gl-sh,.gl-bg{transition:none}}"
+".gl-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.gl-top h3{margin:0;font-size:19px;font-weight:800;letter-spacing:-.01em}"
+".gl-x{flex:none;min-width:44px;min-height:44px;margin:-8px -10px 0 0;border:0;background:transparent;color:var(--texto-2,#4a5d6b);font:700 14px var(--fuente,system-ui);cursor:pointer}"
+".gl-q{font-size:14.5px;line-height:1.5;margin:8px 0 0}"
+".gl-box{background:color-mix(in srgb,var(--texto,#0a2233) 6%,transparent);border-radius:12px;padding:10px 12px;margin-top:10px;font-size:13px;line-height:1.55}"
+".gl-tb{margin-top:12px}.gl-tb .tt{font-size:12.5px;font-weight:800;margin:0 0 6px}.gl-tb .tr{display:flex;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--linea,#dbe4ea);border-bottom-width:0;font-size:13px}.gl-tb .tr:first-of-type{border-radius:12px 12px 0 0}.gl-tb .tr:last-child{border-bottom-width:1px;border-radius:0 0 12px 12px}.gl-tb .tr small{display:block;color:var(--texto-2,#4a5d6b);font-size:12px;font-weight:500;margin-top:1px}.gl-tb .tr b.v{font-size:15px;white-space:nowrap}"
+".gl-c{margin-top:12px;border-left:4px solid var(--acento,#0b7a55);background:color-mix(in srgb,var(--acento,#0b7a55) 10%,transparent);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.5}.gl-c ul,.gl-o ul{margin:4px 0 0;padding-left:18px}"
+".gl-o{margin-top:12px;border-left:4px solid var(--pendiente,#b45309);background:color-mix(in srgb,var(--pendiente,#b45309) 11%,transparent);border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.5}"
+".gl-v{font-size:12.5px;color:var(--texto-2,#4a5d6b);margin-top:10px}"
+".gl-ln{display:inline-flex;align-items:center;min-height:44px;margin-top:6px;color:var(--acento-texto,#0b7a55);font-weight:800;font-size:14px;text-decoration:none}"
+".gl-ls{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:6px;font-size:13.5px;line-height:1.45}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

function body(k,full){
  var d=T[k];if(!d)return"";
  var h='<p class="gl-q">'+esc(d.q)+'</p>';
  if(d.lista)h+='<ul class="gl-ls">'+d.lista.map(function(x){return'<li><b>'+esc(x[0])+':</b> '+esc(x[1])+'</li>';}).join("")+'</ul>';
  if(d.f||d.e)h+='<div class="gl-box">'+(d.f?'<b>Fórmula:</b> '+esc(d.f):"")+(d.f&&d.e?"<br>":"")+(d.e?'<b>Ejemplo:</b> '+esc(d.e):"")+'</div>';
  if(d.tabla)h+='<div class="gl-tb"><p class="tt">'+esc(d.tt)+'</p>'+d.tabla.map(function(r){return'<div class="tr"><div><b>'+esc(r[0])+'</b><small>'+esc(r[1])+'</small></div><b class="v">'+esc(r[2])+'</b></div>';}).join("")+'</div>';
  if(d.c)h+='<div class="gl-c"><b>Comparar con otras herramientas</b><ul>'+d.c.map(function(x){return'<li>'+esc(x)+'</li>';}).join("")+'</ul></div>';
  if(d.o)h+='<div class="gl-o"><b>Ojo al comparar</b><div>'+esc(d.o)+'</div></div>';
  if(d.v)h+='<div class="gl-v">En Cima Blanca lo ves en: '+esc(d.v)+'</div>';
  return h;
}

var bg,sh,last=null;
function mk(){
  if(sh)return;
  bg=document.createElement("div");bg.className="gl-bg";
  sh=document.createElement("div");sh.className="gl-sh";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");sh.setAttribute("aria-hidden","true");sh.setAttribute("aria-labelledby","glT");
  document.body.appendChild(bg);document.body.appendChild(sh);
  bg.addEventListener("click",close);
}
function open(k,from){
  var d=T[k];if(!d)return;mk();last=from||document.activeElement;
  sh.innerHTML='<div class="gl-top"><h3 id="glT">'+esc(d.t)+'</h3><button class="gl-x" type="button" aria-label="Cerrar">Cerrar ✕</button></div>'+body(k)+'<a class="gl-ln" href="'+URL_G+'#'+k+'">Ver en el glosario →</a>';
  sh.querySelector(".gl-x").addEventListener("click",close);
  bg.classList.add("on");sh.classList.add("on");sh.setAttribute("aria-hidden","false");
  setTimeout(function(){var x=sh.querySelector(".gl-x");if(x)x.focus();},50);
}
function close(){
  if(!sh)return;bg.classList.remove("on");sh.classList.remove("on");sh.setAttribute("aria-hidden","true");
  if(last&&last.focus)try{last.focus();}catch(e){}
}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-gl]");if(b){e.preventDefault();open(b.getAttribute("data-gl"),b);}});
document.addEventListener("keydown",function(e){if(e.key==="Escape")close();});

window.GLO={
  T:T,ORDER:ORDER,open:open,close:close,body:body,esc:esc,
  /* título de tarjeta con ⓘ: todo el título es un botón */
  head:function(k,label){return'<button type="button" class="gl-h" data-gl="'+k+'" aria-label="Qué es: '+esc(label)+'"><span>'+esc(label)+'</span><i class="gl-i" aria-hidden="true">i</i></button>';},
  /* texto + ⓘ en línea (para el héroe) */
  inline:function(k,label){return'<button type="button" class="gl-t" data-gl="'+k+'" aria-label="Qué es: '+esc(label)+'"><span>'+esc(label)+'</span><i class="gl-i" aria-hidden="true">i</i></button>';}
};
})();

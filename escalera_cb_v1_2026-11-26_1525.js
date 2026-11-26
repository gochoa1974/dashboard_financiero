/* escalera_cb_v1 · 26 nov 2026 15:25 (Ecuador) · La escalera del dinero (componente común de Cima Blanca)
   Ingresos − Gastos = Resultado [+ Por pagar] − Capital de la hipoteca = Queda después de la deuda.
   Lee las MISMAS cachés que Resultados (cb_res_ing_v1 y cb_res_gas_v1): misma cifra por construcción.
   Reglas: «Sin datos» nunca es 0 · cada fila es un botón (teclado y lector de pantalla) · solo meses completos.
   Uso:  CBE.mount(host,{ms:['2026-01',…],here:['ing'],dec:2,label:'2026 · hasta hoy',go:function(id){…}})  → devuelve las cifras.
   Sin dependencias; usa los tokens de estilos_cb_v1 (--texto, --texto-2, --linea, --tarjeta, --acento, --pendiente, --error). */
(function(w){
  "use strict";
  var CBE={v:"1.0"};
  function ld(k){try{return JSON.parse(localStorage.getItem(k)||"null");}catch(e){return null;}}
  function r2(n){return Math.round(n*100)/100;}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  var MC=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  function ml(k){return MC[+k.slice(5)-1]+" "+k.slice(0,4);}
  /* $24.203,51 (dec 2) o $24.204 (dec 0); el menos va delante del $ */
  function fmt(n,dec){
    if(n==null||!isFinite(n))return "Sin datos";
    var neg=n<-(dec===0?0.5:0.004);n=Math.abs(n);
    var s=(dec===0?String(Math.round(n)):n.toFixed(2).replace(".",",")),p=s.split(",");
    p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
    return (neg?"−":"")+"$"+p.join(",");
  }
  /* ---------- cuentas ---------- */
  /* Primer mes que cuenta = el mismo que usa Resultados: «inicio de resultados» (Configuración → Inversión) o, si no hay, el primer mes con ingresos.
     Así la escalera da la MISMA cifra en Ingresos, Gastos, Resultados y Hoy aunque Gastos tenga meses anteriores al primer ingreso. */
  CBE.primerMes=function(SI,INV){
    var cm=new Date().getFullYear()+"-"+("0"+(new Date().getMonth()+1)).slice(-2);
    var ks=SI&&SI.m?Object.keys(SI.m).sort():[],first=ks[0]||cm;
    INV=INV===undefined?ld("cb_res_inv_v1"):INV;
    var ini=INV&&INV.inicio?INV.inicio:null;
    return {m:ini&&ini<=cm?ini:first,cm:cm,param:!!(ini&&ini<=cm)};
  };
  CBE.calc=function(ms,SI,SG,INV){
    ms=ms||[];SI=SI===undefined?ld("cb_res_ing_v1"):SI;SG=SG===undefined?ld("cb_res_gas_v1"):SG;
    var pm=CBE.primerMes(SI,INV),antes=0;
    ms=ms.filter(function(k){if(k<pm.m){antes++;return false;}return k<=pm.cm;});
    var hasI=!!(SI&&SI.m),hasG=!!(SG&&SG.m),I=0,G=0,C=0,PP=0,nI=0,nG=0,falta=[];
    ms.forEach(function(k){
      var i=hasI?SI.m[k]:null,g=hasG?SG.m[k]:null;
      if(i){nI++;I+=+i[0]||0;}
      if(g){nG++;G+=+g.g||0;C+=+g.c||0;PP+=+g.p||0;}
      else if(hasG&&i&&(+i[0]||0)>0.004)falta.push(k);
    });
    I=r2(I);G=r2(G);C=r2(C);PP=r2(PP);
    var okI=nI>0&&I>0.004,okG=nG>0,both=okI&&okG;
    var R=both?r2(I-G):null;
    return {ms:ms,desde:antes?pm:null,okI:okI,okG:okG,I:okI?I:null,G:okG?G:null,R:R,C:okG?C:null,PP:okG?PP:null,
            Q:both?r2(R+PP-C):null,mg:both?(R/I*100):null,falta:falta,tI:hasI?SI.t:null,tG:hasG?SG.t:null};
  };
  /* Rótulo del período a partir de los meses que SÍ cuentan: «1 ene – 26 nov 2026» (si cruza de año: «1 nov 2025 – 31 oct 2026») */
  CBE.rango=function(ms){
    if(!ms||!ms.length)return "";
    var a=ms[0],b=ms[ms.length-1],now=new Date(),cm=now.getFullYear()+"-"+("0"+(now.getMonth()+1)).slice(-2);
    var fin=b===cm?now.getDate():new Date(+b.slice(0,4),+b.slice(5),0).getDate(),ya=a.slice(0,4),yb=b.slice(0,4);
    return "1 "+MC[+a.slice(5)-1]+(ya!==yb?" "+ya:"")+" – "+fin+" "+MC[+b.slice(5)-1]+" "+yb;
  };
  /* ---------- estilos (una sola vez) ---------- */
  CBE.css=function(){
    if(document.getElementById("cbe-css"))return;
    var s=document.createElement("style");s.id="cbe-css";
    s.textContent=
".cbe{background:var(--tarjeta);border:1px solid var(--linea);border-radius:var(--r3,18px);padding:14px 12px 12px;margin:12px 0;color:var(--texto);min-width:0}"+
".cbe-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin:0 4px 6px;flex-wrap:wrap}"+
".cbe-h h3{margin:0;font-size:15px;font-weight:800;letter-spacing:-.01em;color:var(--texto)}"+
".cbe-h span{font-size:12px;color:var(--texto-2);font-weight:600}"+
".cbe-l{list-style:none;margin:0;padding:0}"+
".cbe-l li{border-top:1px solid var(--linea);margin:0;padding:0}.cbe-l li:first-child{border-top:0}"+
".cbe-r{display:grid;grid-template-columns:22px minmax(0,1fr) auto 14px;align-items:center;gap:8px;width:100%;min-height:52px;padding:8px 6px;margin:0;background:transparent;border:0;border-radius:12px;color:var(--texto);font:inherit;text-align:left;cursor:pointer;-webkit-appearance:none;appearance:none}"+
"div.cbe-r{cursor:default}"+
".cbe-r:hover:not(.here){background:color-mix(in srgb,var(--texto) 5%,transparent)}"+
".cbe-r:focus-visible{outline:3px solid var(--acento);outline-offset:1px}"+
".cbe-r.here{background:color-mix(in srgb,var(--acento) 11%,transparent);box-shadow:inset 3px 0 0 var(--acento)}"+
".cbe-o{font-size:17px;font-weight:800;color:var(--texto-2);text-align:center;line-height:1}"+
".cbe-t{min-width:0}.cbe-t b{display:block;font-size:14px;font-weight:700;line-height:1.25}"+
".cbe-t small{display:block;font-size:12px;color:var(--texto-2);font-weight:600;line-height:1.3;margin-top:1px}"+
".cbe-a{font-size:15px;font-weight:800;white-space:nowrap;text-align:right}"+
".cbe-a.neg{color:var(--error)}.cbe-a.sd{color:var(--texto-2);font-size:13px;font-weight:700}"+
".cbe-c{color:var(--texto-2);font-size:20px;line-height:1;text-align:center}"+
".cbe-r.sub .cbe-t b,.cbe-r.sub .cbe-a{font-weight:800}.cbe-r.sub{background:color-mix(in srgb,var(--texto) 4%,transparent)}"+
".cbe-r.sub.here{background:color-mix(in srgb,var(--acento) 11%,transparent)}"+
".cbe-base{margin:0 0 10px;font-size:12.5px;color:var(--texto-2);font-weight:600;line-height:1.4}.cbe-base b{color:var(--texto)}"+
".cbe-n{margin:8px 6px 0;font-size:12px;color:var(--texto-2);line-height:1.4}.cbe-n b{color:var(--texto)}"+
".cbe-w{margin:8px 6px 0;font-size:12px;color:var(--pendiente);font-weight:700;line-height:1.4}"+
"@media(min-width:760px){.cbe{padding:16px 14px 14px}.cbe-r{min-height:56px}.cbe-h h3{font-size:16px}}"+
"@media(prefers-reduced-motion:no-preference){.cbe-r{transition:background .15s ease}}";
    document.head.appendChild(s);
  };
  /* ---------- filas ---------- */
  function filas(c,o){
    var d=o.dec===0?0:2,here=o.here||[],rows=[];
    function row(id,op,t,n,amt,cls,neg){
      var sd=amt==null;
      rows.push({id:id,op:op,t:t,n:n,a:sd?"Sin datos":fmt(amt,d),sd:sd,neg:!sd&&neg&&amt<-(d===0?.5:.004),cls:cls||"",here:here.indexOf(id)>=0});
    }
    row("ing","","Ingresos","Noches dormidas + extras cobrados, netos de comisión",c.I,"");
    row("gas","−","Gastos","Recurrentes + variables, sin el capital de la hipoteca",c.G,"");
    row("res","=","Resultado",c.mg!=null?"Ingresos − Gastos · margen "+(Math.round(c.mg*10)/10).toFixed(1).replace(".",",")+" %":"Ingresos − Gastos",c.R,"sub",true);
    if(c.PP!=null&&c.PP>0.004&&c.R!=null)row("pp","+","Por pagar","Gasto ya anotado que aún no pagas: no ha salido del banco",c.PP,"");
    row("cap","−","Capital de la hipoteca","Baja tu deuda. No es gasto, pero sí sale de tu caja",c.C,"");
    row("queda","=","Queda después de la deuda","Lo que deja el negocio tras pagar la deuda",c.Q,"sub",true);
    return rows;
  }
  CBE.html=function(c,o){
    o=o||{};
    var rows=filas(c,o),h='<section class="cbe" aria-label="Cómo se conecta tu dinero"><div class="cbe-h"><h3>'+esc(o.title||"Cómo se conecta tu dinero")+'</h3>'+((o.label!=null?o.label:CBE.rango(c.ms))?'<span>'+esc(o.label!=null?o.label:CBE.rango(c.ms))+'</span>':'')+'</div><ol class="cbe-l">';
    rows.forEach(function(r){
      var inner='<span class="cbe-o" aria-hidden="true">'+esc(r.op)+'</span><span class="cbe-t"><b>'+esc(r.t)+'</b><small>'+esc(r.n)+'</small></span><span class="cbe-a'+(r.sd?' sd':'')+(r.neg?' neg':'')+'">'+esc(r.a)+'</span><span class="cbe-c" aria-hidden="true">'+(r.here?'':'›')+'</span>';
      var lab=r.t+", "+r.a+(r.here?". Estás aquí":". Abrir");
      h+='<li>'+(r.here?'<div class="cbe-r '+r.cls+' here" aria-current="true" aria-label="'+esc(lab)+'">'+inner+'</div>'
                       :'<button type="button" class="cbe-r '+r.cls+'" data-cbe="'+r.id+'" aria-label="'+esc(lab)+'">'+inner+'</button>')+'</li>';
    });
    h+='</ol>';
    if(!c.okI)h+='<p class="cbe-w">Aún no hay ingresos cargados en este dispositivo: abre Ingresos una vez.</p>';
    else if(!c.okG&&c.tG==null)h+='<p class="cbe-w">Aún no hay gastos cargados en este dispositivo: abre Gastos una vez.</p>';
    else if(c.falta&&c.falta.length){
      var f=c.falta.slice().sort().reverse(),t=f.slice(0,3).map(ml).join(", ");
      h+='<p class="cbe-w">Sin gastos registrados en: '+esc(t)+(f.length>3?' y '+(f.length-3)+' más':'')+'. El resultado de esos meses está sin descontar.</p>';
    }
    if(c.desde)h+='<p class="cbe-n">Se cuenta desde '+esc(ml(c.desde.m))+(c.desde.param?', el inicio de resultados':', el primer mes con ingresos')+' (igual que en Resultados).</p>';
    h+='<p class="cbe-n"><b>Todavía no es plata en tu banco.</b> Falta lo que Airbnb aún no te transfiere (por liquidar).</p></section>';
    return h;
  };
  /* destinos por defecto (pantallas de siempre); la navegación nueva pasa su propio «go» */
  var URL={ing:"../ingresos/",gas:"../gastos/",res:"../resultados/",queda:"../resultados/",cap:"../gastos/",pp:"../gastos/"};
  /* quien no ve Ingresos y Gastos (ni el panel de resultados) no ve la escalera */
  function permitido(){
    var C=w.CB;if(!C||typeof C.puede!=="function"||!C.perfil)return true;
    try{return (C.puede("ingresos")&&C.puede("gastos"))||C.puede("dashboard");}catch(e){return true;}
  }
  CBE.mount=function(host,o){
    if(!host)return null;
    o=o||{};CBE.css();
    if(!permitido()){host.innerHTML="";return null;}
    var c=CBE.calc(o.ms||[],o.ing,o.gas);
    host.innerHTML=CBE.html(c,o);
    host._cbeO=o;
    if(!host._cbeEv){
      host._cbeEv=1;
      host.addEventListener("click",function(e){
        var b=e.target.closest&&e.target.closest("[data-cbe]");if(!b||!host.contains(b))return;
        var id=b.getAttribute("data-cbe"),oo=host._cbeO||{};
        if(typeof oo.go==="function")oo.go(id);else if(URL[id])location.href=URL[id];
      });
    }
    return c;
  };
  CBE.fmt=fmt;
  w.CBE=CBE;
  /* los estilos entran apenas carga el archivo (así la línea «Base» ya sale con su estilo) */
  if(document.head)CBE.css();
})(window);

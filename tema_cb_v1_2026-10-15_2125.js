/* Tema Cima Blanca v1 · 15 oct 2026 21:25 · aplica modo, presets y efectos por dispositivo */
(function(){
  var K='cb_tema_v1', R=document.documentElement;
  var PRESETS={sobrio:{glow:0,borde:0,deg:0,elev:0,mov:0},equilibrado:{glow:1,borde:1,deg:1,elev:0,mov:1},wow:{glow:2,borde:2,deg:2,elev:1,mov:1}};
  var DEF={modo:'auto',claro:{preset:'sobrio'},oscuro:{preset:'equilibrado'},acento:null,hero:null,ahorro:0};
  function leer(){try{return Object.assign({},DEF,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){return Object.assign({},DEF)}}
  function modoReal(c){return c.modo==='auto'?(matchMedia('(prefers-color-scheme:dark)').matches?'oscuro':'claro'):c.modo}
  function aplicar(c){
    c=c||leer(); R.setAttribute('data-modo',c.modo); var m=modoReal(c), fx=Object.assign({},PRESETS[(c[m]||{}).preset||'sobrio'],(c[m]||{}).fx||{});
    ['glow','borde','deg','elev','mov'].forEach(function(k){fx[k]?R.setAttribute('data-fx-'+k,fx[k]):R.removeAttribute('data-fx-'+k)});
    if(c.ahorro)R.setAttribute('data-ahorro','1');else R.removeAttribute('data-ahorro');
    if(c.acento)R.style.setProperty('--acento',c.acento);else R.style.removeProperty('--acento');
    if(c.hero){R.style.setProperty('--hero-a',c.hero[0]);R.style.setProperty('--hero-b',c.hero[1])}else{R.style.removeProperty('--hero-a');R.style.removeProperty('--hero-b')}
    var meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=m==='oscuro'?'#071722':'#0a2233';
  }
  function guardar(p){var c=Object.assign(leer(),p);try{localStorage.setItem(K,JSON.stringify(c))}catch(e){}aplicar(c)}
  matchMedia('(prefers-color-scheme:dark)').addEventListener&&matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){aplicar()});
  window.CBTema={aplicar:aplicar,guardar:guardar,leer:leer,PRESETS:PRESETS};
  aplicar();
})();

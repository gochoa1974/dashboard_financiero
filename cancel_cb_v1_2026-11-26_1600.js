/* cancel_cb_v1 · «Cobro por cancelación» (Paquete B · 26 nov 2026)
   Un solo lugar que lee las cancelaciones y dice, para cada reserva cancelada con cobro por política (tipos 1 y 2 de Cancelaciones),
   cuántas noches durmió el huésped y cuántas quedaron libres. Lo que Airbnb pagó por las noches libres NO es una noche vendida:
   se llama «Cobro por cancelación» y se cuenta en el mes de llegada (check-in). El total de Ingresos no cambia.
   Lo usan Ingresos y Hotelería (y por sus cachés, Resultados y Hoy). Los tipos 3, 4 y 5 (solo reservas directas) no se tocan.

   Datos: la misma caché que escribe Cancelaciones (cimablanca_canc_data). Si falta o está vieja, se pide a Cancelaciones («listar»)
   en segundo plano con la clave de sesión; si no se puede, todo sigue como antes (sin ajustar), y la pantalla lo dice. */
(function(w){
  var KEY="cimablanca_canc_data",TS="cimablanca_canc_t",CLAVE="cimablanca_clave",TTL=10*60*1000;
  /* Mismo Apps Script de Cancelaciones que usa su pantalla (cancelaciones/index.html · FIXED_URL) */
  var URL_C="https://script.google.com/macros/s/AKfycbxTCzl3Phwj8v9NkiMWB8imltqsz16fRzd5NYWx7-UDDsiRjGSkc7M77a5e45fCw--y/exec";
  function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function leer(){try{var d=JSON.parse(ls(KEY)||"null");return d&&Array.isArray(d.cancelaciones)?d.cancelaciones:null;}catch(e){return null;}}
  function esSi(v){return v===true||/^s[ií]$/i.test(String(v==null?"":v).trim());}
  /* mapa(reservas) → {ok, by:{codigo:{nc,nl,ns,tipo}}, n, malos:[códigos que no cuadran]}
     nc = noches que el huésped sí durmió (las primeras), nl = noches que quedaron libres (lo pagado por ellas es cobro). */
  function mapa(reservas,lista){
    lista=lista||leer();
    var o={ok:!!lista,by:{},n:0,malos:[]};
    if(!lista)return o;
    var idx={};(reservas||[]).forEach(function(r){if(r&&r.codigo_confirmacion)idx[r.codigo_confirmacion]=r;});
    var ult={};
    lista.forEach(function(c){
      if(!c||!c.codigo)return;
      var t=Number(c.tipo);if(t!==1&&t!==2)return;
      if(esSi(c.anulado))return;
      ult[String(c.codigo).trim()]=c;
    });
    Object.keys(ult).forEach(function(cod){
      var c=ult[cod],r=idx[cod];if(!r)return;
      var ns=Math.round(+r.noches||0),nc=Math.round(Number(c.nochesCuentan)),nl=Math.round(Number(c.nochesLiberadas)),pag=Math.round(Number(c.nochesPagadas));
      if(!ns||!isFinite(nc)||!isFinite(nl)||!isFinite(pag)||nc<0||nl<0||pag!==ns||nc+nl!==ns){o.malos.push(cod);return;}
      if(nl===0)return;
      o.by[cod]={nc:nc,nl:nl,ns:ns,tipo:Number(c.tipo)};o.n++;
    });
    return o;
  }
  /* refrescar(cb[, forzar]) → pide la lista a Cancelaciones si la caché tiene más de 10 min (o no existe). cb(cambio) solo si hubo respuesta buena. */
  var vuelo=false;
  function refrescar(cb,forzar){
    try{
      var clave=ls(CLAVE);if(!clave||typeof fetch!=="function"||vuelo)return;
      var t=+ls(TS)||0;if(!forzar&&leer()&&Date.now()-t<TTL)return;
      vuelo=true;
      var body={clave:clave,accion:"listar"};
      try{var p=w.CB&&w.CB.perfil;if(p)body.usuario=String(p.usuario||p.nombre||"");}catch(e){}
      fetch(URL_C,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)})
        .then(function(r){return r.json();})
        .then(function(j){
          vuelo=false;
          if(!j||j.ok!==true||!Array.isArray(j.cancelaciones))return;
          var ant=ls(KEY),nuevo=JSON.stringify({cancelaciones:j.cancelaciones,bloqueos:j.bloqueos||[]});
          try{localStorage.setItem(TS,String(Date.now()));}catch(e){}
          if(ant!==nuevo){try{localStorage.setItem(KEY,nuevo);}catch(e){}if(cb)cb(true);}else if(cb)cb(false);
        })
        .catch(function(){vuelo=false;});
    }catch(e){vuelo=false;}
  }
  w.CBK={KEY:KEY,leer:leer,mapa:mapa,refrescar:refrescar,
    /* texto corto para avisos */
    sinDatos:"Cancelaciones aún no se ha leído en este aparato: las noches cuentan todas las reservas, como antes. Abre Cancelaciones para actualizar."};
})(window);

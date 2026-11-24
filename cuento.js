(() => {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const main = $('#contenido'), dialog = $('#story-dialog');
  const asset = id => './assets/arte/'+id+'.webp';
  const esc = str => String(str ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const config = window.REGALO_DE_MISSI || {};
  const places = {
    habitacion:{title:'La habitación de Missi', card:'La habitación', icon:'door', caption:'Husmeá entre los objetos.', alt:'Una buhardilla con una ventana estrellada, un gato dormido, un tocadiscos y un escritorio.'},
    mision:{title:'La misión de Sol', card:'La misión de Sol', icon:'paw', caption:'Ayudá a preparar la sorpresa.', alt:'Un jardín de azoteas con flores, una canasta y estrellas de papel.'},
    museo:{title:'El museo de las pequeñas cosas', card:'El pequeño museo', icon:'book', caption:'Descubrí lo que guarda cada pieza.', alt:'Una vitrina con audífonos, un cuaderno dibujado a mano, un mando y una Coca-Cola.'},
    fiesta:{title:'La fiesta de los gatitos', card:'La fiesta de los gatitos', icon:'cake', caption:'Hay una velita para vos.', alt:'Cinco gatitos con gorritos rodean un pastel, con globos, una Coca-Cola y guirnaldas.'},
    carta:{title:'Una carta de Rob', card:'La carta de Rob', icon:'mail', caption:'Un sobre con tu nombre.', alt:'Un sobre de papel crema con un sello de huellita bajo un farol.'},
    refugio:{title:'Un lugar al que regresar', card:'El refugio', icon:'house', caption:'Un asiento junto a la ventana.', alt:'Dos gatos de espaldas miran la luna desde un asiento junto a la ventana.'},
    mash:{title:'La constelación de Mash', card:'La constelación de Mash', icon:'star', caption:'Un recuerdo de Mash. Visita opcional.', alt:'Mash, una gatita negra, duerme entre flores bajo el cielo estrellado.'},
    portada:{title:'Una visita inesperada', card:'La puerta de entrada', icon:'moon', caption:'Volvé a saludar al mensajero.', alt:'Un gatito mensajero aguarda con un sobre ante una puerta iluminada.'}
  };
  const stars = [
    ['huella','Los gatos=felicidad','Seguí el rastro cerca del escritorio.'],
    ['jamon','Reserva de jamoncito','Algo quedó bajo el mueble de la habitación.'],
    ['curiosidad','Decía «No tocar»','La cajita del museo tiene una instrucción sospechosa.'],
    ['mama','Mamá de michis','Probá con cuatro caricias. Los niños llevan la cuenta.'],
    ['caja','Correo de los niños','Revisá tres veces la caja de mensajes del refugio.'],
    ['noche','Trasnochadora','Probá la noche profunda.'],
    ['mision','Una estrella para Sol','Reuní los cinco encargos de Sol.']
  ];
  const defaults = {pets:0, surprises:0, night:false, found:[], secrets:[], museum:[], nightStars:[], room:[], lastPet:-1, fiesta:{velas:false,regalo:false}};
  let saved={};
  try { saved=JSON.parse(localStorage.getItem('missi.cuento.2') || '{}') || {}; } catch {}
  const state={...defaults,...saved,fiesta:{...defaults.fiesta,...(saved.fiesta||{})}};
  for(const k of ['found','secrets','museum','nightStars','room']) if(!Array.isArray(state[k]))state[k]=[];
  function save(){try{localStorage.setItem('missi.cuento.2',JSON.stringify(state));}catch{}}
  function addOnce(key,id){if(state[key].includes(id))return false; state[key].push(id);save();return true;}
  let toastTimer, scene='', mashOpen=false, lastNormal='mapa', mapExpanded=false, letterOpen=false, roomLine='', museumActive='', petMessage='', skyLine='', boxClicks=0;
  let missionLine='', partyLine='', homeLine='';
  function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('in');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('in'),3200);}
  function unlock(id){if(!addOnce('secrets',id))return;const item=stars.find(v=>v[0]===id);if(item)toast('Estrellita descubierta · '+item[1]);}
  function burst(small=false){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const layer=$('#confetti');layer.replaceChildren();
    for(let i=0;i<(small?20:46);i++){
      const bit=document.createElement('i');
      bit.style.setProperty('--left',(3+Math.random()*94)+'%');
      bit.style.setProperty('--drift',(Math.random()*160-80)+'px');
      bit.style.setProperty('--spin',(Math.random()*540-270)+'deg');
      bit.style.setProperty('--delay',(Math.random()*.65)+'s');
      bit.style.setProperty('--bit',['#f3c97e','#bdacd9','#dc958a','#93c9bd'][i%4]);
      layer.append(bit);
    }
    setTimeout(()=>{if(layer.firstChild)layer.querySelectorAll('i').forEach(n=>{if(n.getAnimations?.().every(a=>a.playState==='finished'))n.remove();});},4400);
  }
  const btn=(label,action,icon='',klass='secondary')=>'<button type="button" class="'+klass+'" data-action="'+action+'">'+(icon?signo(icon):'')+'<span>'+label+'</span></button>';
  const link=(label,where,icon='',klass='secondary')=>'<a class="'+klass+'" href="#'+where+'">'+(icon?signo(icon):'')+'<span>'+label+'</span></a>';
  const next=(label,to,icon)=>link(label,to,icon,'primary');
  function live(html, id='reaction'){return '<p class="reaction" id="'+id+'" role="status" aria-live="polite">'+html+'</p>';}
  function say(msg,id='reaction'){const el=document.getElementById(id);if(el)el.textContent=msg;}
  function fieldFeedback(text){
    if(!matchMedia('(max-width: 800px)').matches)return;
    const field=main.querySelector('.picture');
    if(!field)return;
    field.querySelector('.field-note')?.remove();
    const note=document.createElement('span');note.className='field-note';
    note.setAttribute('aria-hidden','true');note.textContent=text;field.append(note);
    setTimeout(()=>note.remove(),3500);
  }
  function openDialog(title, body, actions='',sym='star'){
    $('#modal-symbol').innerHTML=signo(sym);$('#modal-title').textContent=title;
    $('#modal-content').innerHTML=body;$('#modal-actions').innerHTML=actions;
    if(!dialog.open)dialog.showModal();
  }
  function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(d=>d.close());}
  function sol(){
    return '<button type="button" class="sol" data-action="sol" aria-label="Hablar con Sol, tu guía"><img src="'+esc(config.fotoSol||'./assets/sol.svg')+'" data-sol-photo alt=""><span><strong>Sol</strong><small>Tu guía</small></span><b aria-hidden="true">···</b></button>';
  }
  function assignSolFallback(){document.querySelectorAll('[data-sol-photo]').forEach(el=>el.addEventListener('error',()=>{el.src='./assets/sol.svg';},{once:true}));}
  function constellation(what='sky'){
    if(what==='cat'){
      const coords=[[16,84],[24,67],[21,42],[38,51],[55,45],[67,29],[73,48],[74,66],[86,79],[98,92],[112,91],[118,82],[117,72],[125,78],[125,90],[115,101],[97,105],[78,101],[59,104],[45,99],[28,99],[16,92],[16,84]];
      return '<svg viewBox="0 0 146 120" class="cat-constellation" aria-hidden="true"><polyline points="'+coords.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="currentColor" stroke-width=".75"/>'+coords.filter((p,i)=>i%2===0||[3,5,9,11,13].includes(i)).map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i%3===0?1.75:1.1)+'" fill="currentColor"/>').join('')+'</svg>';
    }
    return '<svg class="hero-constellation" viewBox="0 0 174 76" fill="none" aria-hidden="true"><path d="m6 50 35-19 37 9 28-28 46 14" stroke="currentColor" opacity=".5" stroke-width=".8" stroke-dasharray="2.5 4"/><g fill="currentColor"><circle cx="6" cy="50" r="1.8"/><circle cx="41" cy="31" r="2"/><circle cx="78" cy="40" r="2.2"/><path d="m106 7 1.1 3.9L111 12l-3.9 1.1L106 17l-1.1-3.9L101 12l3.9-1.1z"/><circle cx="152" cy="26" r="1.5"/></g></svg>';
  }
  function skyDots(n){
    return '<div class="spark-field" aria-hidden="true">'+Array.from({length:n},(_,i)=>'<i style="--x:'+((i*31+7)%97)+'%;--y:'+((i*23+11)%84)+'%;--d:-'+(i%8)+'.'+(i%6)+'s"></i>').join('')+'</div>';
  }
  function cards(keys){return keys.map(id=>{const p=places[id];return '<a href="#'+id+'" class="postcard"><div class="card-art"><img src="'+asset(id==='mash'?'cielo':id)+'" alt="" loading="lazy"><span class="card-seal" aria-hidden="true">'+signo(p.icon)+'</span></div><div class="card-copy"><h3>'+p.card+'</h3><p>'+p.caption+'</p></div></a>';}).join('');}
  function mapBlock(){
    const first=['habitacion','mision','museo','fiesta'], other=['carta','refugio','mash','portada'];
    return '<section class="wrap atlas" id="mapa" aria-labelledby="atlas-title"><div class="atlas-head"><div><div class="atlas-kicker"><i></i>'+signo('sparkle')+'<i></i></div><h2 id="atlas-title" tabindex="-1">Mapa estelar</h2><p>Elegí un rincón para explorar.</p></div><button type="button" class="map-expand" id="expand-map" data-action="map-toggle" aria-expanded="'+mapExpanded+'" aria-controls="extra-places">'+signo('grid')+'<span>'+(mapExpanded?'Ver menos lugares':'Ver los 8 lugares')+'</span></button></div><div class="postcard-grid">'+cards(first)+'</div><div class="postcard-grid extra-places" id="extra-places" '+(mapExpanded?'':'hidden')+'>'+cards(other)+'</div></section>';
  }
  function cover(){
    return '<section class="cover" aria-labelledby="cover-title"><div class="cover-scenery" role="img" aria-label="'+places.portada.alt+'"></div><div class="cover-shade"></div>'+skyDots(19)+'<div class="wrap cover-wrap"><div class="cover-copy"><div class="kicker cover-kicker"><i></i>'+signo('sparkle')+' Cuento de cumpleaños</div><h1 id="cover-title" tabindex="-1">El pequeño<br>universo de <em>Missi</em></h1><p class="invitation"><span aria-hidden="true">«</span>Oaaaa, Missi. Tenemos algo para vos<span aria-hidden="true">».</span></p>'+next('A ver qué hicieron estos gatos','habitacion','paw')+'</div>'+constellation()+'</div><button type="button" class="cover-cat" data-action="pet-cover" aria-label="Acariciar al gatito mensajero"><span class="pet-chip">'+signo('paw')+' Acariciar</span></button><span id="cover-speech" class="cover-speech" role="status">'+esc(homeLine)+'</span></section>'+mapBlock();
  }
  function art(id,overlay='',klass=''){
    return '<div class="picture '+klass+'"><img class="picture-img" src="'+asset(id)+'" alt="'+esc(places[id]?.alt||'El pueblo bajo un cielo de estrellas.')+'">'+overlay+'</div>';
  }
  function sceneHeader(title,kicker,icon){return '<div class="scene-heading"><a class="back-map" href="#mapa">'+signo('compass')+' Volver al mapa</a><div class="kicker">'+signo(icon)+' '+kicker+'</div><h1 tabindex="-1">'+title+'</h1></div>';}
  function view(head,artwork,content,cla=''){return '<section class="wrap journey '+cla+'">'+head+'<div class="scene-layout">'+artwork+'<div class="scene-copy">'+content+'</div></div></section>';}
  function panelTitle(title,text){return '<h2>'+title+'</h2><p class="lead">'+text+'</p>';}
  function point(key,label,x,y,icon,klass=''){
    return '<button type="button" data-action="'+key+'" aria-label="'+esc(label)+'" title="'+esc(label)+'" class="point '+klass+'" style="--x:'+x+'%;--y:'+y+'%"><span>'+signo(icon)+'</span></button>';
  }
  const roomItems=[
    ['ventana','Ventana',34,24,'window','En los techos hay una estrella que parpadea medio tarde. Debe estar editando su parte.'],
    ['michi','Gatito dormido',24,68,'cat','No molestar. Está trabajando arduamente en no hacer nada.'],
    ['disco','Tocadiscos',87,39,'radio','Sol dejó el disco puesto. Elegí la música que te acompañe.'],
    ['dibujo','Cuaderno',82,83,'book','Alguien quiso posar para tu dibujo. De momento quedó una patita fuera del margen.'],
    ['coca','Coca-Cola',76,60,'soda','Sabemos que preferís esto antes que un pastel. 😾 La guardamos bien fría.'],
    ['caja','Caja de regalos',50,72,'gift','La caja era para tu regalo. Los niños ya decidieron mudarse ahí.'],
    ['reloj','Reloj',66,45,'clock','El reloj de los michis tiene dos horas. Hora de comer y hora de volver a dormir.']
  ];
  function room(){
    const pins=roomItems.map(it=>point('obj-'+it[0],it[1],it[2],it[3],it[4],state.room.includes(it[0])?'seen':'')).join('')
      +point('secret-jamon','Investigar detrás del mueble',8,86,'ham','secret-pin')+point('secret-huella','Investigar la huellita',61,91,'paw','secret-pin');
    return view(sceneHeader(places.habitacion.title,'Tras la puerta','door'),art('habitacion',pins,'room-picture'),
      sol()+panelTitle('¿Qué habrá por acá?', 'Tocá los objetos de la habitación. Los niños dejaron algunas cosas bastante escondidas.')
      +'<details class="object-list"><summary>Elegir un objeto de la habitación</summary><div class="chip-row">'+roomItems.map(it=>btn(it[1],'obj-'+it[0],it[4],'chip')).join('')+'</div></details>'
      +live(esc(roomLine||'Parece que el comité de bienvenida se quedó dormido.'))+next('Acompañar a Sol','mision','paw'));
  }
  const errands=[
    {id:'huellita',name:'Huellita',icon:'paw',x:22,y:81,hint:'Buscá abajo a la izquierda, cerca de la maceta.',done:'Una huellita en la maceta. Ya sabemos por dónde pasó el comité.'},
    {id:'estrella',name:'Estrellita',icon:'star',x:46,y:24,hint:'Mirá arriba, en la guirnalda de estrellas.',done:'¡Una estrella de papel para colgar en la fiesta!'},
    {id:'jamoncito',name:'Jamoncito',icon:'ham',x:79,y:60,hint:'Revisá la canasta del lado derecho.',done:'Nom. Este jamoncito llegó enterito, de milagro.'},
    {id:'michi',name:'Despertar al michi',icon:'cat',x:41,y:62,hint:'El dormilón se hizo bolita en el centro del camino.',done:'El ayudante abrió un ojo. Cuenta como presentarse a trabajar.'},
    {id:'gorro',name:'Gorrito perdido',icon:'hat',x:86,y:84,hint:'Buscá abajo a la derecha, sobre las tejas.',done:'¡El gorrito perdido! A alguien le quedaba tapando una orejita.'}
  ];
  function mission(){
    const found=errands.filter(e=>state.found.includes(e.id)),done=found.length===errands.length;
    const field=errands.filter(e=>!state.found.includes(e.id)).map(e=>point('get-'+e.id,e.name,e.x,e.y,e.icon,'token token-'+e.id)).join('');
    return view(sceneHeader(places.mision.title,'Por los tejados','paw'),art('mision',field+skyDots(8),'quest-picture'),
      sol()+panelTitle(done?'¡Invitación lista!':'Los encargos de Sol',done?'Los faroles están encendidos. Sol dejó una estrella de papel en la mesa de la fiesta.':'«Mae, conté cinco cosas para la fiesta y ahora tengo… la canasta». Tocá los cinco encargos escondidos en la azotea.')
      +'<div class="progress-label"><strong>'+found.length+' de 5</strong><span>encargos reunidos</span></div><div class="progress-track" aria-hidden="true"><i style="width:'+(20*found.length)+'%"></i></div><ul class="checklist">'+errands.map(e=>'<li class="'+(state.found.includes(e.id)?'checked':'')+'">'+signo(state.found.includes(e.id)?'check':e.icon)+esc(e.name)+'</li>').join('')+'</ul>'
      +live(esc(missionLine||(done?'Pipipi. A Sol se le cayó un poquito de confeti de la emoción.':'Podés tomarte todo el tiempo que quieras.')))
      +'<div class="actions">'+(done?next('Ver la sorpresa','fiesta','gift')+btn('Volver a jugar','replay','replay'):btn('Dame una pista','hint','bulb'))+'</div>'+link('Visitar el museo','museo','book','text-btn onward'));
  }
  const exhibits=[
    ['audifonos','Los audífonos','phones','Para esa canción que merece otra vuelta. El michi del tocadiscos acepta pedidos.'],
    ['cuaderno','El cuaderno','book','Un cuaderno para tus dibujos y las ideas de tu próximo edit. En la última hoja hay un gato que se salió del encuadre.'],
    ['mando','El mando','joystick','El comité reta a Missi a una partida de Skullgirls. Su táctica consiste en pisar todos los botones a la vez.'],
    ['botella','La Coca-Cola','soda','Pasteles bonitos para ver cómo los preparan. Una Coca-Cola para cuando toque celebrar. La selección de Missi.'],
    ['carita','El michi 😾','cat','Director oficial de reacciones a JuegaGerman. Hoy ensaya su cara de «We, yo no fui».'],
    ['cajita','La cajita','gift','Una cajita con huellitas y un botón escrito a patita. La etiqueta dice «No tocar».']
  ];
  function museum(){
    const selected=exhibits.find(e=>e[0]===museumActive);
    return view(sceneHeader(places.museo.title,'Sala de colecciones','book'),art('museo','','museum-picture'),
      panelTitle('La vitrina de Missi','Elegí una pieza. El museo contrató a un michi para escribir las etiquetas.')
      +'<div class="exhibits">'+exhibits.map(e=>'<button type="button" class="exhibit" data-action="ex-'+e[0]+'" aria-pressed="'+(museumActive===e[0])+'">'+signo(e[2])+'<span>'+e[1]+'</span></button>').join('')+'</div>'
      +live(esc(selected?selected[3]:'Los audífonos, el mando, el cuaderno… Hay un poquito de vos en cada estante.'))
      +(museumActive==='cajita'?btn('No tocar','forbidden','paw','mischief'):'')+next('Ir a la fiesta','fiesta','cake'));
  }
  function party(){
    const f=state.fiesta;
    const layer=point('candles',f.velas?'Volver a encender las velitas':'Apagar las velitas',48,60,'cake','party-pin')
      +point('gift',f.regalo?'Volver a ver el regalo':'Abrir el regalo',12,86,'gift','party-pin')
      +(state.secrets.includes('mision')?point('party-star','Tocar la estrella de Sol',88,79,'star','paper-star-pin'):'');
    const artwork=art('fiesta',layer+'<div class="party-spark" aria-hidden="true"></div>','party-picture'+(f.velas?' blown':''));
    return view(sceneHeader(places.fiesta.title,'La mesa de cumpleaños','cake'),artwork,
      sol()+panelTitle('¡Feliz cumpleaños, Missi!', 'Compramos pastel, pero sabemos que probablemente solo quieras la coca. La tuya está al lado, bien fría.')
      +(state.secrets.includes('mision')?'<p class="reward">'+signo('star')+' La estrella que reuniste con Sol ya está en la fiesta.</p>':'')
      +'<div class="actions">'+btn(f.velas?'Encender de nuevo':'Apagar las velitas','candles','cake')+btn(f.regalo?'Ver el regalo':'Abrir el regalo','gift','gift')+'</div>'
      +live(esc(partyLine||(f.velas?'Las velitas ya descansan. Podés encenderlas otra vez.':'Pedí un deseo y tocá las velitas o pasá el dedo por el pastel.')))
      +next('Buscar mi carta','carta','mail'));
  }
  function letter(){
    const cfg=config.carta||{}, paras=Array.isArray(cfg.parrafos)?cfg.parrafos.filter(v=>typeof v==='string'&&v.trim()):[];
    const body='<article class="letter-paper" aria-label="Carta de Rob"><span class="paper-star" aria-hidden="true">'+signo('sparkle')+'</span><h2>'+esc(cfg.saludo||'Missi,')+'</h2>'+(paras.length?paras:['¡Feliz cumpleaños!']).map(p=>'<p>'+esc(p)+'</p>').join('')+'<p class="signature">'+esc(cfg.firma||'Rob · Ryu')+'</p></article>';
    const env='<button type="button" aria-label="Abrir el sobre de Rob" class="envelope-tap" data-action="open-letter"><span>'+signo('mail')+' Abrir el sobre</span></button>';
    return view(sceneHeader(places.carta.title,'Correo para Missi','mail'),art('carta',letterOpen?'':env,'letter-picture'+(letterOpen?' open':'')),
      (letterOpen?body+btn('Guardar la carta','close-letter','mail','text-btn'):panelTitle('Para Missi, en mano propia','El mensajero hizo todo el recorrido con este sobre. Milagrosamente, llegó sin marcas de dientes.')+btn('Abrir mi carta','open-letter','mail','primary'))
      +link('Ir a mi refugio','refugio','moon',letterOpen?'primary':'text-btn onward'));
  }
  function gate(){
    return view(sceneHeader('Una estrella para Mash','Desvío opcional','star'),art('cielo',skyDots(14),'gate-picture'),
      panelTitle('Un recuerdo de Mash','Esta estrella guarda una escena tranquila con Mash y unos recuerdos bonitos. Podés visitarla si hoy te nace.')
      +'<div class="actions">'+btn('Visitar su estrellita','enter-mash','star','secondary')+link('Seguir mi paseo',lastNormal==='mash'?'mapa':lastNormal,'compass','primary')+'</div>');
  }
  const mashNotes=['La encontraste y le diste un hogar. Primero fue Mash, después Melody… y a vos te seguía gustando más Mash.',
    'Una madrugada de diciembre pensaste en darle jamoncito. Un gesto chiquito de esos que dicen mucho.',
    'Una vez la mandaste al techo a buscar a uno de sus niños. Mash eligió quedarse acostadita.',
    'Te gustaba abrazarla y acercarte a olerla. En este rincón, tu hija mayor tiene pastito suave para su siesta.'];
  let mashIndex=0;
  function mash(){
    if(!mashOpen)return gate();
    return view(sceneHeader(places.mash.title,'Un rincón tranquilo','star'),art('mash',constellation('cat')+skyDots(9),'mash-picture'),
      '<div class="quiet-star">'+signo('star')+'</div>'+panelTitle('Mash, también Melody','Hay seres pequeñitos que terminan ocupando un lugar enorme. Esta estrellita guarda un poquito del cariño que le diste a tu hija mayor.')
      +live(esc(mashNotes[mashIndex]))+btn('Otro recuerdo','mash-memory','sparkle','text-btn')+link('Volver a mi paseo',lastNormal==='mash'?'mapa':lastNormal,'compass','primary'));
  }
  // El personaje animado es un michi del cuento. Sol se representa con su propia insignia.
  function actor(small=false){
    return '<svg class="drawn-cat'+(small?' small':'')+'" viewBox="0 0 128 88" fill="none" aria-hidden="true"><g stroke="#51404d" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"><path class="cat-tail" d="M79 59q24 5 28-19 2-10 7-8 7 4 1 18-11 30-36 23" fill="#c98c6b"/><ellipse class="cat-body" cx="69" cy="61" rx="29" ry="17" fill="#e0b294"/><g class="cat-foot a"><path d="M48 66q-5 15 4 15h9l2-12" fill="#e0b294"/></g><g class="cat-foot b"><path d="M77 67q-5 14 3 14h9l2-13" fill="#c98c6b"/></g><g class="cat-head"><path d="M23 42 24 20l15 10q7-2 14 0l15-12 1 24q9 23-21 25-29 1-27-18z" fill="#e5bf9f"/><path d="m27 26-.5 11 8-5Zm36 0-7 6 8 4Z" fill="#cf9089" stroke="none"/><path d="m40 31 3 6m4-7 2 6" stroke="#bc8d70"/><g class="cat-eyes"><ellipse cx="34.5" cy="45" rx="2.6" ry="3" fill="#4a3d4b" stroke="none"/><ellipse cx="54.5" cy="45" rx="2.6" ry="3" fill="#4a3d4b" stroke="none"/></g><path d="m41.5 49 2.5 2 2.5-2" fill="#b36f6b" stroke="#ae7971" stroke-width="1.4"/><ellipse class="cat-yawn" cx="44.3" cy="55" rx="2.9" ry="1.8" fill="#8b5964" stroke="none"/><path d="m29 50-12-2m13 6-10 3m39-7 12-3m-12 7 10 3" stroke-width="1.35"/></g></g></svg>';
  }
  const pets=['Prrrr. Ese era exactamente el lugar de la caricia.','Uw. Una patita acaba de reclamar tu manga.','Pipipi. Le gustó tanto que ahora quiere otra.','😾 La comisión exige una pausa de dos segundos.','Un michi te acerca un vasito. «Mae, tomá awita».','Nom. Intentó morder el aire de la emoción.'];
  function pet(where){
    state.pets++; const prev=state.lastPet;
    let i=state.pets===1?0:state.pets%4===0?3:Math.floor(Math.random()*pets.length);
    if(i===prev && state.pets%4!==0)i=(i+1)%pets.length;
    state.lastPet=i;save();
    if(state.pets===4)unlock('mama');
    radioMissi.fx([114,120,107,114],'purr');
    if(where==='cover'){homeLine=pets[i];say(homeLine,'cover-speech');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('.cover-cat')?.animate?.([{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:250});}
    else if(where==='room'){roomLine=state.pets===1?roomItems[1][5]:pets[i];say(roomLine);}
    else{petMessage=pets[i];if(state.pets===4)refresh('pet-refuge');else say(petMessage);}
  }
  const messages=['Un papelito doblado: «Si un michi te eligió de almohada, hoy llegás tarde. Orden de los niños».',
    'Sol dejó una nota: «Recordatorio para la jefa. Tomá awita. La coca ya tiene su propio comité».',
    '«Oaaa. La caja era para el regalo. Ahora la caja es mi casa». Está firmado con una huellita.',
    '«Pipipi. Alguien se comió la esquina de este mensaje». La esquina tiene forma de mordida.',
    '«Si ponés JuegaGerman, guardame un sitio». Un michi dibujó sus propios audífonos.',
    '«Parte de producción: el video del pastel quedó lindo. El de los niños durmiendo dura tres horas».'];
  function journal(){return '<details class="journal"><summary>'+signo('star')+' Mis estrellitas <span>'+state.secrets.length+' / '+stars.length+'</span></summary><ul>'+stars.map(([id,title,hint])=>'<li>'+signo(state.secrets.includes(id)?'star':'sparkle')+'<span>'+(state.secrets.includes(id)?'<b>'+esc(title)+'</b>':esc(hint))+'</span></li>').join('')+'</ul></details>';}
  function refuge(){
    const walker='<button type="button" class="walker" data-action="pet-refuge" aria-label="Acariciar al michi que pasea">'+actor(true)+'</button>';
    return view(sceneHeader(places.refugio.title,'Después de la fiesta','house'),art('refugio',walker,'refuge-picture'),
      sol()+panelTitle('Hay sitio en la ventana','Podés quedarte con los niños, poner un disco o salir a mirar el cielo. Este rincón sigue acá después de tu cumpleaños.')
      +'<div class="actions">'+btn('Acariciar al michi','pet-refuge','paw')+btn('Caja de mensajes','surprise','gift')+btn('Escuchar música','radio','music')+link('Contemplar el cielo','cielo','star')+btn('Volver a jugar','replay-from-refuge','replay')+'</div>'
      +live(esc(petMessage||'Un michi dejó libre la mitad más calentita del cojín.'))+journal());
  }
  const constellations=[
    ['farol','El farol','Hay un farol encendido en la ventana más chiquita. Alguien se quedó dibujando.',24,31],
    ['bigotes','Los bigotes','Tres estrellitas juntas. Si entornás los ojos, parecen los bigotes de un michi.',56,18],
    ['nota','La corchea','Sol dice que, si el cielo tuviera banda sonora, vos elegirías la canción.',76,38]
  ];
  function sky(){
    const skyPins=constellations.map(([id,name,,x,y])=>point('sky-'+id,'Mirar la estrella '+name,x,y,'sparkle','sky-star')).join('');
    return view(sceneHeader('Un ratito bajo el cielo','La ventana del refugio','moon'),art('cielo',skyDots(17)+skyPins,'sky-picture'),
      panelTitle('Las luces de los tejados','Tocá alguna de las tres estrellas doradas o quedate un rato escuchando la radio.')
      +live(esc(skyLine||'Las ventanas se van encendiendo una por una.'))+btn('Abrir la radio','radio','music')+link('Volver al refugio','refugio','house','primary'));
  }
  function nightUI(){
    document.documentElement.classList.toggle('deep-night',!!state.night);
    $('#night-button').setAttribute('aria-pressed',String(!!state.night));
    $('#night-button span:last-child').textContent=state.night?'Salir de noche profunda':'Noche profunda';
  }
  function route(){
    const hash=location.hash.slice(1);
    return Object.hasOwn(places,hash)||hash==='mapa'||hash==='cielo'?hash:'portada';
  }
  function draw(reposition=false){
    scene=route();
    const renders={portada:cover,mapa:cover,habitacion:room,mision:mission,museo:museum,fiesta:party,carta:letter,mash,refugio:refuge,cielo:sky};
    main.innerHTML=renders[scene]();assignSolFallback();nightUI();
    document.body.dataset.scene=scene;document.title=(scene==='portada'||scene==='mapa'?'El pequeño universo de Missi':(places[scene]?.title||'El cielo del refugio')+' · Universo de Missi');
    const isCover=scene==='portada'||scene==='mapa';
    if(scene==='carta'&&letterOpen){const image=main.querySelector('.picture-img');image.src=asset('carta-abierta');image.alt='El sobre está abierto. Una hoja asoma bajo la luz del farol y el sello de huellita descansa sobre la mesa.';}
    if(scene==='fiesta'&&state.fiesta.velas){const image=main.querySelector('.picture-img');image.src=asset('fiesta-apagada');image.alt='Los gatitos festejan alrededor del pastel con las cinco velitas apagadas.';}
    if(reposition){
      if(scene==='mapa'){
        $('#atlas-title').focus({preventScroll:true});
        $('#mapa').scrollIntoView({block:'start',behavior:'instant'});
      }else{
        window.scrollTo({top:0,behavior:'instant'});
        const head=main.querySelector('h1'); if(head)head.focus({preventScroll:true});
      }
    }
    if(!isCover)main.classList.remove('cover-view');else main.classList.add('cover-view');
  }
  function refresh(focusAction){
    const pos=window.scrollY;draw(false);
    if(focusAction)main.querySelector('[data-action="'+focusAction+'"]')?.focus({preventScroll:true});
    if(window.scrollY!==pos)window.scrollTo({top:pos,behavior:'instant'});
  }
  function enterRoute(){
    const dest=route();
    if(dest==='mash' && scene!=='mash')lastNormal=(scene&&scene!=='portada')?scene:'mapa';
    if(dest!=='mash'){mashOpen=false;mashIndex=0;}
    if(dest!=='carta')letterOpen=false;
    if(dest!=='portada'&&dest!=='mapa')homeLine='';
    if(dest==='mapa')mapExpanded=true;
    closeDialogs();draw(true);
  }
  window.addEventListener('hashchange',enterRoute);
  const tips={
    habitacion:'La ventana, el tocadiscos y el escritorio se pueden tocar. Mirá también cerca del piso.',
    mision:'Si se te esconde un encargo, tocá «Dame una pista». Yo te señalo el lugar.',
    fiesta:'La coca está servida. Probá apagar las velitas y después revisá el paquete de la izquierda.',
    refugio:'Si la caja parece vacía, volvé a mirar. Los niños siguen metiendo papelitos.'
  };
  function handle(action, el){
    if(action.startsWith('obj-')){
      const id=action.slice(4), item=roomItems.find(it=>it[0]===id);if(!item)return;
      addOnce('room',id);
      main.querySelector('.point[data-action="obj-'+id+'"]')?.classList.add('seen');
      if(id==='michi')pet('room');else {roomLine=item[5];say(roomLine);radioMissi.fx([524]);}
      if(id==='disco')radioMissi.show();else fieldFeedback(roomLine);return;
    }
    if(action.startsWith('get-')){
      const id=action.slice(4), item=errands.find(e=>e.id===id);if(!item||!addOnce('found',id))return;
      missionLine=item.done;radioMissi.fx([523,659,784]);
      const done=errands.every(e=>state.found.includes(e.id));
      if(done){missionLine='¡Lo logramos, Missi! Sol ya puede abrir la sorpresa.';unlock('mision');burst(true);}
      refresh(done?'replay':null);fieldFeedback(done?'¡5 de 5! Sol ya tiene lista la sorpresa.':state.found.length+' de 5 · '+item.done);
      if(!done){const toFocus=main.querySelector('.token');if(toFocus)toFocus.focus({preventScroll:true});}
      return;
    }
    if(action.startsWith('ex-')){
      museumActive=action.slice(3);addOnce('museum',museumActive);boxClicks=0;refresh(action);
      radioMissi.fx([554,698]);return;
    }
    if(action.startsWith('sky-')){
      const star=constellations.find(s=>s[0]===action.slice(4));if(!star)return;
      addOnce('nightStars',star[0]);skyLine=star[2];say(skyLine);radioMissi.fx([523,784]);return;
    }
    switch(action){
      case 'map-toggle':{
        mapExpanded=!mapExpanded;$('#extra-places').hidden=!mapExpanded;
        el.setAttribute('aria-expanded',String(mapExpanded));el.querySelector('span').textContent=mapExpanded?'Ver menos lugares':'Ver los 8 lugares';break;
      }
      case 'sol':openDialog('Sol, tu guía','<p>«Oaaa, Missi. '+esc(tips[scene]||'Hay otro rincón esperándote en el mapa.')+'»</p>',btn('Seguir explorando','close-modal','','primary'),'sun');break;
      case 'radio':radioMissi.show();break;
      case 'close-modal':dialog.close();break;
      case 'pet-cover':pet('cover');break;
      case 'pet-refuge':pet('refugio');break;
      case 'secret-jamon':roomLine='Nom. Un jamoncito envuelto para el turno de madrugada.';say(roomLine);fieldFeedback(roomLine);unlock('jamon');radioMissi.fx([523,784]);break;
      case 'secret-huella':roomLine='La huellita estaba firmada con tus propias palabras: «Los gatos=felicidad». 😻';say(roomLine);fieldFeedback(roomLine);unlock('huella');radioMissi.fx([659,784]);break;
      case 'hint':{
        const target=errands.find(e=>!state.found.includes(e.id));if(!target)break;
        missionLine=target.hint;say(missionLine);
        $$('.token').forEach(n=>n.classList.remove('hinted'));
        const mark=main.querySelector('[data-action="get-'+target.id+'"]');mark?.classList.add('hinted');break;
      }
      case 'replay-from-refuge':state.found=[];missionLine='Sol volvió a acomodar todo en la azotea.';save();location.hash='mision';break;
      case 'party-star':partyLine='La estrella de papel tiene una dedicatoria a patita: «Para Missi, de Sol».';
        say(partyLine);fieldFeedback(partyLine);radioMissi.fx([784,988]);break;
      case 'replay':state.found=[];missionLine='Sol mezcló los encargos otra vez. La azotea es toda tuya.';save();refresh('hint');break;
      case 'forbidden':boxClicks++;unlock('curiosidad');radioMissi.fx([350,460,620]);say(boxClicks===1?'😾 Se abrió una ventanita: «Mae. Decía NO TOCAR». Una segunda patita te alcanza un confeti.':'Pipipi. Ahora la patita es la que está tocando el botón.');break;
      case 'enter-mash':mashOpen=true;mashIndex=0;draw(true);break;
      case 'mash-memory':mashIndex=(mashIndex+1)%mashNotes.length;say(mashNotes[mashIndex]);break;
      case 'candles':
        state.fiesta.velas=!state.fiesta.velas;save();
        partyLine=state.fiesta.velas?'¡Feliz cumpleaños, Missi! Los michis aplauden con las cuatro patitas.':'Las cinco velitas están encendidas. Podés pedir otro deseo.';
        if(state.fiesta.velas){burst();radioMissi.fx([523,659,784,1046]);}
        refresh('candles');break;
      case 'gift':
        state.fiesta.regalo=true;save();partyLine='El regalo trae un vale de usos infinitos. Está firmado con una patita.';
        refresh('gift');burst(true);radioMissi.fx([659,784,988]);
        openDialog('Vale por una siesta con tus niños','<div class="gift-ticket">'+signo('paw')+'<span>Para Missi</span><strong>Caricias ilimitadas</strong><small>Sin fecha de vencimiento</small></div><p>La caja también es tuya, si conseguís que los michis salgan de ella.</p>',btn('Guardar mi vale','close-modal','','primary'),'gift');break;
      case 'open-letter':letterOpen=true;radioMissi.fx([523,698]);refresh('close-letter');$('.letter-paper')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;
      case 'close-letter':letterOpen=false;refresh('open-letter');break;
      case 'surprise':petMessage=messages[state.surprises%messages.length];state.surprises++;save();if(state.surprises>=3)unlock('caja');say(petMessage);radioMissi.fx([659,587]);if(state.surprises===3)refresh('surprise');break;
    }
  }
  document.addEventListener('click',e=>{
    if(!(e.target instanceof Element))return;
    const close=e.target.closest('[data-close]');if(close){close.closest('dialog')?.close();return;}
    const action=e.target.closest('[data-action]');if(action){handle(action.dataset.action,action);return;}
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    const dest=a.getAttribute('href').slice(1);if(dest==='contenido'){e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({block:'start'});return;}
    if(dest!=='mapa'&&dest!=='portada'&&dest!=='mash')radioMissi.arrive();
    if(dest===route()){
      e.preventDefault();
      if(dest==='mapa'){mapExpanded=true;draw(true);}else if(dest==='portada')window.scrollTo({top:0,behavior:'instant'});
    }
  });
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{
    const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();
  }));
  // Además de la pulsación, se puede apagar con una pasada horizontal por el pastel.
  let swipeStart=null, swallowClick=false;
  main.addEventListener('pointerdown',e=>{
    if(scene!=='fiesta'||state.fiesta.velas||!e.target.closest('.party-picture'))return;
    const r=e.target.closest('.party-picture').getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    if(x>.25&&x<.72&&y>.42&&y<.91)swipeStart=[e.clientX,e.clientY];
  });
  main.addEventListener('pointercancel',()=>{swipeStart=null;});
  main.addEventListener('pointerup',e=>{
    if(!swipeStart)return;
    const [x,y]=swipeStart;swipeStart=null;
    if(scene==='fiesta'&&!state.fiesta.velas&&Math.abs(e.clientX-x)>30&&Math.abs(e.clientX-x)>Math.abs(e.clientY-y)){
      swallowClick=true;setTimeout(()=>swallowClick=false,450);handle('candles');
    }
  });
  main.addEventListener('click',e=>{if(swallowClick){e.preventDefault();e.stopPropagation();swallowClick=false;}},true);
  $('#night-button').addEventListener('click',()=>{state.night=!state.night;save();nightUI();if(state.night){unlock('noche');if(scene==='refugio')refresh();}});
  if(route()==='mapa')mapExpanded=true;
  draw(false);
  if(route()==='mapa')requestAnimationFrame(()=>$('#mapa').scrollIntoView());
})();

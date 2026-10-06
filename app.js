(()=>{
const d3=G3,$=id=>document.getElementById(id),RAD=Math.PI/180,R=6371;
const cv=$('map'),ctx=cv.getContext('2d');
let W=1,H=1,dpr=1,view='globe',dirty=true,anc=null,tab='play',usingHigh=false,lastBusy=0;
const cur={lon:0,lat:20,z:1},tgt={lon:0,lat:20,z:1},zs={globe:1,map:1};
const gp=d3.geoOrthographic().clipAngle(90).precision(.6),mp=d3.geoEquirectangular().precision(.6),path=d3.geoPath().context(ctx);
const MP={on:false,host:false,ph:'',r:-1,subm:false,cfg:null,tot:{},nm:{}};
const COL={ocean:'#d9e9f8',land:'#e6f4ea',bord:'#5b9a72',hov:'#c4d9fa',rev:'#8fd3a9',ink:'#0b1220',g:'#0a8a4a',b:'#1a5fd0'};
function mk(id){const o=JSON.parse($(id).textContent),t=o.t,fs=d3.feature(t,t.objects.countries).features;fs.forEach((f,i)=>{f.m=o.m[i];f.properties={name:o.m[i].n}});return fs}
let LO=mk('lo'),HI=null,F=LO;
const zr=()=>view==='globe'?[.6,40]:[1,80];
const base=()=>view==='globe'?Math.min(W,H)*.45:Math.min(W/(2*Math.PI),H/Math.PI);
const scale=()=>base()*cur.z;
const cz=z=>Math.max(zr()[0],Math.min(zr()[1],z));
const sh=d=>((d+540)%360)-180;
function P(){const p=view==='globe'?gp:mp;p.scale(scale()).translate([W/2,H/2]);view==='globe'?p.rotate([-cur.lon,-cur.lat,0]):p.rotate([0,0,0]).center([cur.lon,cur.lat]);path.projection(p);return p}
function clampC(o){if(view==='globe'){o.lat=Math.max(-90,Math.min(90,o.lat));o.lon=sh(o.lon);return}
 const s=base()*o.z*RAD,hw=W/2/s,hh=H/2/s;o.lon=hw>=180?0:Math.max(-180+hw,Math.min(180-hw,o.lon));o.lat=hh>=90?0:Math.max(-90+hh,Math.min(90-hh,o.lat))}
function resize(){dpr=devicePixelRatio||1;W=cv.clientWidth||1;H=cv.clientHeight||1;cv.width=W*dpr;cv.height=H*dpr;clampC(cur);clampC(tgt);dirty=true}
new ResizeObserver(resize).observe(cv);

// ---------- navigation ----------
function showTab(t){tab=t;document.querySelectorAll('#nav button').forEach(b=>b.className=b.dataset.t===t?'on':'');
 document.querySelectorAll('aside section').forEach(s=>s.hidden=s.id!=='p-'+t);document.body.classList.toggle('hidecoords',t==='play'||t==='party');updMission()}
$('nav').onclick=e=>{if(e.target.dataset.t)showTab(e.target.dataset.t)};$('mgo').onclick=()=>showTab('play');
function updMission(){const on=tab!=='play'&&T&&!locked&&!MP.on;$('mission').hidden=!on;if(on)$('mtxt').innerHTML=promptPlain}

// ---------- zoom & pan ----------
function zoomBy(f,mx,my){const nz=cz(tgt.z*f);if(nz===tgt.z)return;const inv=P().invert([mx,my]);
 if(view==='map'){if(inv&&Math.abs(inv[0])<=180&&Math.abs(inv[1])<=90)anc={lon:inv[0],lat:inv[1],x:mx,y:my}}
 else if(f>1&&inv){tgt.lon+=sh(inv[0]-tgt.lon)*.28;tgt.lat+=(inv[1]-tgt.lat)*.28}
 tgt.z=nz;clampC(tgt)}
cv.addEventListener('wheel',e=>{e.preventDefault();const dy=e.deltaY*(e.deltaMode===1?16:1);zoomBy(Math.exp(-dy*(e.ctrlKey?.012:.0016)),e.offsetX,e.offsetY)},{passive:false});
cv.ondblclick=e=>zoomBy(2.2,e.offsetX,e.offsetY);
$('zi').onclick=()=>zoomBy(1.7,W/2,H/2);$('zo').onclick=()=>zoomBy(1/1.7,W/2,H/2);
$('zh').onclick=()=>{anc=null;tgt.z=1;tgt.lon=0;tgt.lat=20;clampC(tgt)};
$('zsl').oninput=e=>{const[a,b]=zr();anc=null;tgt.z=a*Math.pow(b/a,e.target.value/1000);clampC(tgt)};
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key==='+'||e.key==='=')zoomBy(1.5,W/2,H/2);if(e.key==='-')zoomBy(1/1.5,W/2,H/2)});
function drag(dx,dy){const s=scale()*RAD;cur.lon-=dx/s;cur.lat+=dy/s;clampC(cur);tgt.lon=cur.lon;tgt.lat=cur.lat;anc=null}
const pt=new Map();let pinch=null,mv=0;
const pd=()=>{const a=[...pt.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);pt.set(e.pointerId,[e.offsetX,e.offsetY]);mv=0;anc=null;if(pt.size===2)pinch={d:pd(),z:tgt.z}};
cv.onpointermove=e=>{const o=pt.get(e.pointerId);if(!o){hover(e.offsetX,e.offsetY);return}const n=[e.offsetX,e.offsetY];
 if(pt.size===1){mv+=Math.abs(n[0]-o[0])+Math.abs(n[1]-o[1]);drag(n[0]-o[0],n[1]-o[1])}
 pt.set(e.pointerId,n);
 if(pt.size===2&&pinch){mv+=9;tgt.z=cur.z=cz(pinch.z*pd()/pinch.d);clampC(cur);clampC(tgt)}dirty=true};
cv.onpointerup=e=>{const one=pt.size===1;pt.delete(e.pointerId);pinch=null;if(one&&mv<6){hover(e.offsetX,e.offsetY);clickAt(e.offsetX,e.offsetY)}};
cv.onpointercancel=e=>{pt.delete(e.pointerId);pinch=null};
cv.onpointerleave=()=>{$('tip').hidden=true;if(hovF||hovCell){hovF=null;hovCell=null;dirty=true}};
function setView(v){if(v===view)return;zs[view]=tgt.z;view=v;anc=null;cur.z=tgt.z=zs[v];clampC(cur);clampC(tgt);$('vg').className=v==='globe'?'on':'';$('vm').className=v==='map'?'on':'';dirty=true}
$('vg').onclick=()=>setView('globe');$('vm').onclick=()=>setView('map');
function focus(lon,lat,sl,st){anc=null;tgt.lon=lon;tgt.lat=lat;let z;
 if(view==='globe'){const half=Math.min(Math.max(sl,st)/2*RAD,1.5);z=.4*Math.min(W,H)/Math.max(Math.sin(half),.004)/base()}
 else z=Math.min(.8*W/(Math.max(sl,.5)*RAD),.8*H/(Math.max(st,.5)*RAD))/base();
 tgt.z=Math.min(cz(z),25);clampC(tgt)}

// ---------- picking ----------
function featAt(lon,lat){for(const f of F){const b=f.m.b;if(lat<b[1]||lat>b[3])continue;if(b[0]<=b[2]?(lon<b[0]||lon>b[2]):(lon<b[0]&&lon>b[2]))continue;if(d3.geoContains(f,[lon,lat]))return f}return null}
let GX=0,GY=0,hovF=null,hovCell=null;
const cellOf=(lon,lat)=>{const cw=360/GX,ch=180/GY,c=Math.min(GX-1,Math.max(0,Math.floor((lon+180)/cw))),r=Math.min(GY-1,Math.max(0,Math.floor((90-lat)/ch)));return{c,r,w:-180+c*cw,e:-180+(c+1)*cw,n:90-r*ch,s:90-(r+1)*ch}};
const fmt=(lat,lon)=>`${Math.abs(lat).toFixed(2)}°${lat>=0?'N':'S'}, ${Math.abs(lon).toFixed(2)}°${lon>=0?'E':'W'}`;
function hover(x,y){if(MP.on&&MP.cfg&&!MP.cfg.pin)return;const inv=P().invert([x,y]),t=$('tip');
 if(!inv||Math.abs(inv[0])>180||Math.abs(inv[1])>90){t.hidden=true;$('stat').textContent='Outside the map';if(hovF||hovCell){hovF=null;hovCell=null;dirty=true}return}
 const f=featAt(inv[0],inv[1]),cl=GX?cellOf(inv[0],inv[1]):null;
 if(f!==hovF||(cl&&(!hovCell||cl.c!==hovCell.c||cl.r!==hovCell.r))||(!cl&&hovCell)){hovF=f;hovCell=cl;dirty=true}
 $('stat').textContent=`${fmt(inv[1],inv[0])}  ·  ${f?f.properties.name:'Ocean'}${cl?`  ·  Cell col ${cl.c+1}, row ${cl.r+1}`:''}`;
 if(f){t.hidden=false;t.textContent=f.properties.name;t.style.left=Math.min(x+14,W-130)+'px';t.style.top=(y+16)+'px'}else t.hidden=true}

// ---------- lines, grid, cities ----------
const LINES=[
 {n:'Equator',t:'lat',v:0,c:COL.g,w:2.5,d:[],i:'0° · Ecuador, Kenya, Indonesia'},
 {n:'Tropic of Cancer',t:'lat',v:23.4366,c:COL.b,w:2,d:[],i:'23.4°N · Mexico, Sahara, India'},
 {n:'Tropic of Capricorn',t:'lat',v:-23.4366,c:COL.b,w:2,d:[],i:'23.4°S · Brazil, Namibia, Australia'},
 {n:'Arctic Circle',t:'lat',v:66.5634,c:COL.b,w:2,d:[6,5],i:'66.6°N · N. Norway, Russia, Alaska'},
 {n:'Antarctic Circle',t:'lat',v:-66.5634,c:COL.b,w:2,d:[6,5],i:'66.6°S · ocean around Antarctica'},
 {n:'Prime Meridian',t:'lon',v:0,c:COL.g,w:2.5,d:[6,5],i:'0° · UK, France, Spain, Ghana'},
 {n:'International Date Line',t:'lon',v:179.99,c:COL.ink,w:2,d:[3,4],i:'≈180° · Pacific Ocean, near Fiji'}];
LINES.forEach(l=>l.on=false);
$('lines').innerHTML=LINES.map((l,i)=>`<label class="ln"><input type="checkbox" data-i="${i}"><span><span class="sw" style="border-color:${l.c};border-top-style:${l.d.length?'dashed':'solid'}"></span>${l.n}<small>${l.i}</small></span></label>`).join('');
$('lines').onchange=e=>{LINES[e.target.dataset.i].on=e.target.checked;dirty=true};
const setAll=v=>{LINES.forEach(l=>l.on=v);document.querySelectorAll('#lines input').forEach(c=>c.checked=v);dirty=true};
$('la').onclick=()=>setAll(true);$('lh').onclick=()=>setAll(false);
$('ga').onclick=()=>{GX=Math.max(1,Math.min(72,+$('gx').value|0));GY=Math.max(1,Math.min(36,+$('gy').value|0));
 $('ginfo').textContent=`${GX} × ${GY} grid: each cell spans ${(360/GX).toFixed(1)}° of longitude (about ${Math.round(111*360/GX)} km at the equator) and ${(180/GY).toFixed(1)}° of latitude (about ${Math.round(111*180/GY)} km). Hover the map to see the cell you are in.`;updHint();dirty=true};
$('gc').onclick=()=>{GX=GY=0;hovCell=null;$('ginfo').textContent='';updHint();dirty=true};
const CITIES=[['Delhi',28.6,77.2],['Mumbai',19.1,72.9],['Karachi',24.9,67],['Kathmandu',27.7,85.3],['Dubai',25.2,55.3],['Istanbul',41,29],['Cairo',30,31.2],['Nairobi',-1.3,36.8],['Lagos',6.5,3.4],['Cape Town',-33.9,18.4],['London',51.5,-.1],['Paris',48.9,2.35],['Madrid',40.4,-3.7],['Rome',41.9,12.5],['Oslo',59.9,10.75],['Reykjavik',64.1,-21.9],['Moscow',55.8,37.6],['Bangkok',13.75,100.5],['Singapore',1.35,103.8],['Jakarta',-6.2,106.8],['Beijing',39.9,116.4],['Tokyo',35.7,139.7],['Sydney',-33.9,151.2],['Auckland',-36.8,174.8],['Honolulu',21.3,-157.9],['Anchorage',61.2,-149.9],['Los Angeles',34,-118.2],['Mexico City',19.4,-99.1],['New York',40.7,-74],['Bogotá',4.7,-74.1],['Lima',-12,-77],['São Paulo',-23.5,-46.6],['Buenos Aires',-34.6,-58.4],['Santiago',-33.5,-70.7]];
let showCities=false,X=null,exF=null;$('cities').onchange=e=>{showCities=e.target.checked;dirty=true};
const par=lat=>({type:'LineString',coordinates:Array.from({length:121},(_,i)=>[-180+i*3,lat])});
const mer=lon=>({type:'LineString',coordinates:[-90,-45,0,45,90].map(l=>[lon,l])});
function stroke(g,c,w,d){ctx.beginPath();path(g);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(d||[]);ctx.stroke();ctx.setLineDash([])}
const vis=(ll)=>view==='map'||d3.geoDistance([cur.lon,cur.lat],ll)<Math.PI/2-.05;
function label(t,x,y,c){ctx.font='600 11px system-ui';ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.strokeText(t,x,y);ctx.fillStyle=c;ctx.fillText(t,x,y)}
function latLab(p,lat,t,c){let q;if(view==='map'){const l=p.invert([70,H/2]);q=p([Math.max(-180,l?l[0]:-180),lat]);q[0]=Math.max(8,q[0]+4)}else{if(!vis([cur.lon,lat]))return;q=p([cur.lon,lat]);q[0]+=5}
 if(q[1]>12&&q[1]<H-8)label(t,q[0],q[1]-4,c)}
function lonLab(p,lon,t,c){let q;if(view==='map'){q=p([lon,90]);q[1]=Math.max(q[1],0)+18;q[0]+=4}else{const la=Math.max(-70,Math.min(70,cur.lat));if(!vis([lon,la]))return;q=p([lon,la]);q[0]+=4}
 if(q[0]>0&&q[0]<W-30)label(t,q[0],q[1],c)}

// ---------- drawing ----------
function pin(p,ll,c,t){if(!vis(ll))return;const q=p(ll);ctx.beginPath();ctx.arc(q[0],q[1],7,0,7);ctx.fillStyle=c;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle='#fff';ctx.stroke();label(t,q[0]+11,q[1]+4,c)}
function draw(){
 const p=P();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);const s=scale();
 ctx.beginPath();path({type:'Sphere'});
 if(view==='globe'){const g=ctx.createRadialGradient(W/2-s*.35,H/2-s*.35,s*.1,W/2,H/2,s*1.1);g.addColorStop(0,'#eef6fd');g.addColorStop(1,'#cfe1f4');ctx.fillStyle=g}else ctx.fillStyle=COL.ocean;
 ctx.fill();
 const hi=usingHigh&&HI,list=hi?HI:LO,vr=view==='globe'?Math.min(Math.PI/2+.05,Math.hypot(W,H)/2/s+.05):Math.hypot(W,H)/2/s+.05,ctr=[cur.lon,cur.lat];
 ctx.beginPath();for(const f of list){if(hi&&d3.geoDistance(ctr,f.m.c)-f.m.r>vr)continue;path(f)}
 ctx.fillStyle=COL.land;ctx.fill();ctx.lineWidth=.6;ctx.strokeStyle=COL.bord;ctx.stroke();
 [[exF,COL.rev],[revF,COL.rev],[hovF,COL.hov]].forEach(([f,c])=>{if(!f)return;ctx.beginPath();path(f);ctx.fillStyle=c;ctx.fill();ctx.lineWidth=1.2;ctx.strokeStyle=COL.g;ctx.stroke()});
 const cellFill=(cl,c,a)=>{ctx.beginPath();path(d3.geoGraticule().extent([[cl.w,cl.s],[cl.e,cl.n]]).outline());ctx.globalAlpha=a;ctx.fillStyle=c;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=1.5;ctx.strokeStyle=c;ctx.stroke()};
 if(hintCell)cellFill(hintCell,COL.g,.2);if(hovCell)cellFill(hovCell,COL.b,.2);
 if(GX&&GY){const cw=360/GX,ch=180/GY;
  for(let i=0;i<GX;i++)stroke(mer(i?-180+i*cw:-179.99),'rgba(11,18,32,.5)',1);
  for(let j=1;j<GY;j++)stroke(par(90-j*ch),'rgba(11,18,32,.5)',1);
  const sy=Math.max(1,Math.ceil(16/(ch*RAD*s))),sx=Math.max(1,Math.ceil(46/(cw*RAD*s*(view==='globe'?Math.cos(cur.lat*RAD)+.15:1))));
  for(let i=0;i<GX;i+=sx)lonLab(p,-180+i*cw,(Math.round((-180+i*cw)*10)/10)+'°',COL.g);
  for(let j=1;j<GY;j+=sy)latLab(p,90-j*ch,(Math.round((90-j*ch)*10)/10)+'°',COL.g)}
 LINES.forEach(l=>{if(!l.on)return;stroke(l.t==='lat'?par(l.v):mer(l.v),l.c,l.w,l.d);l.t==='lat'?latLab(p,l.v,l.n,l.c):lonLab(p,l.v,l.n,l.c)});
 ctx.beginPath();path({type:'Sphere'});ctx.lineWidth=1.2;ctx.strokeStyle='#8fa6bd';ctx.stroke();
 if(showCities)CITIES.forEach(c=>{const ll=[c[2],c[1]];if(!vis(ll))return;const q=p(ll);ctx.beginPath();ctx.arc(q[0],q[1],3.5,0,7);ctx.fillStyle=COL.b;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#fff';ctx.stroke();if(cur.z>=1.3||view==='globe')label(c[0],q[0]+6,q[1]+3,COL.ink)});
 if(X)pin(p,[X.lon,X.lat],COL.ink,'Here');
 if(locked&&G&&T)stroke({type:'LineString',coordinates:[[G.lon,G.lat],[T.lon,T.lat]]},COL.ink,2,[6,5]);
 if(locked&&T)pin(p,[T.lon,T.lat],COL.g,'Target');
 OTH.forEach(o=>pin(p,[o.lon,o.lat],o.c,o.name));
 if(LC&&(mode!=='guess'||locked))pin(p,[LC.lon,LC.lat],COL.g,'Clicked');
 if(G)pin(p,[G.lon,G.lat],COL.b,'You')}
function syncUI(){const[a,b]=zr();$('zl').textContent='×'+cur.z.toFixed(1);$('zsl').value=Math.round(1000*Math.log(cur.z/a)/Math.log(b/a))}
function tick(now){let ch=false;const dz=Math.log(tgt.z/cur.z);
 if(Math.abs(dz)>.0004){cur.z*=Math.exp(dz*.22);ch=true}else if(cur.z!==tgt.z){cur.z=tgt.z;ch=true}
 if(anc&&view==='map'){const s=scale()*RAD;cur.lon=anc.lon-(anc.x-W/2)/s;cur.lat=anc.lat+(anc.y-H/2)/s;clampC(cur);tgt.lon=cur.lon;tgt.lat=cur.lat;if(cur.z===tgt.z)anc=null;ch=true}
 else{const dl=sh(tgt.lon-cur.lon),dt=tgt.lat-cur.lat;
  if(Math.abs(dl)>.002||Math.abs(dt)>.002){cur.lon+=dl*.2;cur.lat+=dt*.2;ch=true}else if(cur.lon!==tgt.lon||cur.lat!==tgt.lat){cur.lon=tgt.lon;cur.lat=tgt.lat;ch=true}
  clampC(cur)}
 if(ch||pt.size)lastBusy=now;
 const want=!!HI&&(cur.z>=8||(cur.z>=2.5&&now-lastBusy>140));
 if(want!==usingHigh){usingHigh=want;dirty=true}
 if(ch){syncUI();dirty=true}
 if(dirty){dirty=false;draw()}requestAnimationFrame(tick)}

// ---------- practice ----------
let mode='guess',T=null,G=null,locked=false,total=0,rounds=0,tgtF=null,revF=null,hintCell=null,hinted=false,promptPlain='';
const dist=(a,b)=>R*d3.geoDistance([a.lon,a.lat],[b.lon,b.lat]);
function parseC(s,lat){const m=s.trim().match(/^(-?\d+(?:\.\d+)?)\s*°?\s*([NSEWnsew])?$/);if(!m)return null;let v=+m[1];const d=(m[2]||'').toUpperCase();
 if(d&&!(lat?'NS':'EW').includes(d))return null;if(d==='S'||d==='W')v=-Math.abs(v);return Math.abs(v)>(lat?90:180)?null:v}
function updHint(){$('hnt').hidden=!(mode==='guess'&&GX&&!locked&&T);$('hnt').disabled=hinted}
function setMode(m){mode=m;$('tg').className=m==='guess'?'on':'';$('tt').className=m==='try'?'on':'';$('tin').hidden=m!=='try';newRound()}
$('tg').onclick=()=>setMode('guess');$('tt').onclick=()=>setMode('try');
function newRound(){locked=false;G=null;revF=null;tgtF=null;hintCell=null;hinted=false;$('res').hidden=true;$('sub').textContent='Submit';$('ilat').value=$('ilon').value='';
 if(mode==='guess'){let lat,lon,n=0;do{lat=Math.asin(2*Math.random()-1)/RAD;lon=Math.random()*360-180;n++}while(n<500&&(Math.abs(lat)>72||!featAt(lon,lat)));
  T={lat,lon};promptPlain=`Find <b>${fmt(lat,lon)}</b>`;$('prompt').innerHTML=`Find this point on the map:<br><b>${fmt(lat,lon)}</b>`;$('sub').disabled=true}
 else{const c=F.filter(f=>f.m.a>.0008&&f.properties.name!=='Antarctica');tgtF=c[Math.floor(Math.random()*c.length)];
  T={lon:tgtF.m.c[0],lat:tgtF.m.c[1]};promptPlain=`Where is <b>${tgtF.properties.name}</b>?`;
  $('prompt').innerHTML=`Where is <b>${tgtF.properties.name}</b>?<br><span class="mu">Type a coordinate inside it. Landing in the country scores full marks.</span>`;$('sub').disabled=false}
 updHint();updMission();LC=null;pinOpen=false;$('pinbtn').hidden=true;renderPin();dirty=true}
function liveTry(){const la=parseC($('ilat').value,true),lo=parseC($('ilon').value,false);G=la!==null&&lo!==null?{lat:la,lon:lo}:null;dirty=true}
$('ilat').oninput=$('ilon').oninput=liveTry;
let LC=null,pinOpen=false,lastRes='';
const dms=(v,ax)=>{const a=Math.abs(v),d=Math.floor(a),m=Math.floor((a-d)*60),s=((a-d)*60-m)*60;return`${d}°${m}′${s.toFixed(0)}″${ax[v>=0?0:1]}`};
function renderPin(){const m=$('pinmsg');if(!LC||!pinOpen){m.hidden=true;return}
 const f=featAt(LC.lon,LC.lat),cl=GX?cellOf(LC.lon,LC.lat):null;let best='',bd=1e9;CITIES.forEach(c=>{const d=dist(LC,{lat:c[1],lon:c[2]});if(d<bd){bd=d;best=c[0]}});
 m.innerHTML=`<b>Clicked point</b><br>${fmt(LC.lat,LC.lon)}<br>Decimal: ${LC.lat.toFixed(4)}, ${LC.lon.toFixed(4)}<br>DMS: ${dms(LC.lat,'NS')}, ${dms(LC.lon,'EW')}<br>Place: ${f?f.properties.name:'Ocean'}${cl?`<br>Grid cell: col ${cl.c+1}, row ${cl.r+1}`:''}<br>Nearest anchor city: ${best}, about ${Math.round(bd).toLocaleString()} km${mode==='guess'&&!locked&&T?'<br><span class="mu">This is your pin. Press Submit to lock it in.</span>':''}`;m.hidden=false}
$('pinbtn').onclick=()=>{pinOpen=!pinOpen;renderPin()};
function clickAt(x,y){const inv=P().invert([x,y]);if(!inv||Math.abs(inv[0])>180||Math.abs(inv[1])>90)return;
 LC={lon:inv[0],lat:inv[1]};$('pinbtn').hidden=false;if(pinOpen)renderPin();dirty=true;
 if(MP.on){if(MP.ph!=='guess'||MP.subm||mode!=='guess'||!T)return;G={lon:LC.lon,lat:LC.lat};mpGuess(0);mpRender();return}
 if(mode!=='guess'||locked||!T)return;G={lon:LC.lon,lat:LC.lat};$('sub').disabled=false}
$('hnt').onclick=()=>{if(!T||!GX)return;hinted=true;hintCell=cellOf(T.lon,T.lat);$('hnt').disabled=true;const r=$('res');r.hidden=false;
 r.innerHTML=`The target is in the green cell: col ${hintCell.c+1}, row ${hintCell.r+1} (lon ${hintCell.w.toFixed(1)}° to ${hintCell.e.toFixed(1)}°, lat ${hintCell.s.toFixed(1)}° to ${hintCell.n.toFixed(1)}°).`;dirty=true};
function minDist(f,g){let m=1e9;(function w(a){if(typeof a[0]==='number'){const d=dist(g,{lon:a[0],lat:a[1]});if(d<m)m=d}else a.forEach(w)})(f.geometry.coordinates);return m}
const dirWord=(a,b)=>{const y=Math.sin((b.lon-a.lon)*RAD)*Math.cos(b.lat*RAD),x=Math.cos(a.lat*RAD)*Math.sin(b.lat*RAD)-Math.sin(a.lat*RAD)*Math.cos(b.lat*RAD)*Math.cos((b.lon-a.lon)*RAD);
 return['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(((Math.atan2(y,x)/RAD+360)%360)/45)%8]};
function flyTo(a,b){const m=d3.geoInterpolate([a.lon,a.lat],[b.lon,b.lat])(.5),ang=d3.geoDistance([a.lon,a.lat],[b.lon,b.lat])/RAD;
 if(view==='globe')focus(m[0],m[1],ang*1.5+3,ang*1.5+3);else focus(m[0],m[1],Math.abs(sh(a.lon-b.lon))*1.7+3,Math.abs(a.lat-b.lat)*1.7+3)}
$('sub').onclick=()=>{
 if(locked){newRound();return}
 if(!G){const r=$('res');r.hidden=false;r.textContent=mode==='try'?'Enter a valid latitude (−90 to 90) and longitude (−180 to 180). Use a minus sign or N/S/E/W.':'Click the map to drop a pin first.';return}
 const gf=featAt(G.lon,G.lat);let d;
 if(mode==='try'){revF=tgtF;d=gf===tgtF?0:minDist(tgtF,G)}else{d=dist(G,T);revF=featAt(T.lon,T.lat)}
 const sc=Math.round(5000*Math.exp(-d/1500)*(hinted?.8:1)),tag=sc>=4500?'Excellent!':sc>=3000?'Good':sc>=1500?'Getting there':'Keep practising';
 locked=true;hintCell=null;total+=sc;rounds++;
 lastRes=`Round ${rounds}: target ${fmt(T.lat,T.lon)}${mode==='try'?' ('+tgtF.properties.name+')':''}, guess ${fmt(G.lat,G.lon)}, ${Math.round(d)} km off, ${sc} pts`;
 let h=`<div class="big">${sc} / 5000</div>${tag}${hinted?' (hint used)':''}<br>`;
 h+=d<1?'You landed inside it, a perfect hit.<br>':`You were <b>${Math.round(d).toLocaleString()} km</b> away${mode==='try'?' from its border':''}. The target lies to the ${dirWord(G,T)}.<br>`;
 h+=`Your guess: ${fmt(G.lat,G.lon)} (${gf?gf.properties.name:'ocean'})<br>`;
 h+=mode==='try'?`${tgtF.properties.name} is centred near ${fmt(T.lat,T.lon)}.<br>`:`Target: ${fmt(T.lat,T.lon)} (${revF?revF.properties.name:'ocean'})<br>`;
 h+=`Latitude off by ${Math.abs(G.lat-T.lat).toFixed(1)}°, longitude off by ${Math.abs(sh(G.lon-T.lon)).toFixed(1)}°.`;
 if(GX){const a=cellOf(G.lon,G.lat),b=cellOf(T.lon,T.lat);h+=`<br>Your cell: col ${a.c+1}, row ${a.r+1}. Target cell: col ${b.c+1}, row ${b.r+1}.`}
 const r=$('res');r.hidden=false;r.innerHTML=h;$('sub').textContent='Next round';updHint();updMission();
 $('cs').textContent=total;$('cr').textContent=rounds;$('ca').textContent=Math.round(total/rounds);flyTo(G,T);dirty=true};

// ---------- explore ----------
function exOut(h){const o=$('exres');o.hidden=false;o.innerHTML=h}
$('ego').onclick=()=>{const la=parseC($('elat').value,true),lo=parseC($('elon').value,false);
 if(la===null||lo===null){exOut('Enter a valid latitude (−90 to 90) and longitude (−180 to 180). Use a minus sign or N/S/E/W.');return}
 X={lat:la,lon:lo};exF=null;const f=featAt(lo,la);let best=null,bd=1e9;CITIES.forEach(c=>{const d=dist(X,{lat:c[1],lon:c[2]});if(d<bd){bd=d;best=c[0]}});
 let h=`<b>${fmt(la,lo)}</b> is ${f?'in <b>'+f.properties.name+'</b>':'over the ocean'}.<br>Nearest anchor city: ${best}, about ${Math.round(bd).toLocaleString()} km away.`;
 if(GX){const c=cellOf(lo,la);h+=`<br>Grid cell: col ${c.c+1}, row ${c.r+1}.`}
 exOut(h);focus(lo,la,view==='globe'?30:25,view==='globe'?30:25);dirty=true};
$('cgo').onclick=()=>{const q=$('cname').value.trim().toLowerCase();if(!q)return;if(!HI){exOut('Still loading country detail, try again in a moment.');return}
 const f=HI.find(f=>f.properties.name.toLowerCase()===q)||HI.find(f=>f.properties.name.toLowerCase().startsWith(q))||HI.find(f=>f.properties.name.toLowerCase().includes(q));
 if(!f){exOut('No country found with that name.');return}
 exF=f;X=null;const m=f.m,b=m.b,cross=b[0]>b[2],sl=cross?360-(b[0]-b[2]):b[2]-b[0],st=b[3]-b[1];
 const L=(a,n)=>`${Math.abs(a).toFixed(1)}°${n[a>=0?0:1]}`;
 exOut(`<b>${f.properties.name}</b><br>Centre: ${fmt(m.c[1],m.c[0])}<br>Latitude: ${L(b[1],'NS')} to ${L(b[3],'NS')}<br>Longitude: ${L(b[0],'EW')} to ${L(b[2],'EW')}${cross?' (crosses the 180° line)':''}`);
 focus(m.c[0],m.c[1],cross?120:sl*1.6,st*1.6);dirty=true};
$('cname').onkeydown=e=>{if(e.key==='Enter')$('cgo').click()};

// ---------- notepad ----------
const NT=$('nt'),nm=t=>{$('nmsg').textContent=t};let clr=false;
try{NT.value=localStorage.getItem('ct-notes')||''}catch(e){}
const saveN=()=>{try{localStorage.setItem('ct-notes',NT.value)}catch(e){}};NT.oninput=saveN;
function addNote(s){NT.value+=(NT.value&&!NT.value.endsWith('\n')?'\n':'')+s+'\n';saveN();NT.scrollTop=NT.scrollHeight}
$('npin').onclick=()=>{if(!LC){nm('Click a point on the map first.');return}const f=featAt(LC.lon,LC.lat);addNote(`${fmt(LC.lat,LC.lon)} - ${f?f.properties.name:'Ocean'}`);nm('Added.')};
$('nlast').onclick=()=>{if(!lastRes){nm('Finish a round first.');return}addNote(lastRes);nm('Added.')};
$('ncp').onclick=()=>{NT.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}nm(ok?'Copied to clipboard.':'Press Ctrl+C to copy the selected text.')};
$('nclr').onclick=()=>{if(!clr){clr=true;$('nclr').textContent='Click again to clear';setTimeout(()=>{clr=false;$('nclr').textContent='Clear'},2500);return}NT.value='';saveN();clr=false;$('nclr').textContent='Clear';nm('Cleared.')};

// ---------- party (multiplayer) ----------
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SET={mode:'guess',grid:false,gx:20,gy:10,time:30,pin:true,rounds:5},PCOL=['#1a5fd0','#0a8a4a','#0b1220','#2aa6c9','#6aa84f','#4b5a6b','#0f4c81','#3aa17e'];
let RM=null,savedGrid=null,tickT=0,goneT=0,OTH=[];
const NAVH=['play','explore','grid'],navb=t=>document.querySelector(`#nav [data-t=${t}]`);
const scr=id=>['pm-home','pm-setup','pm-lobby','pm-game'].forEach(x=>$(x).hidden=x!==id),pm=s=>$('pmsg').textContent=s;
const hostP=()=>RM&&RM.peers().find(p=>p.presence&&p.presence.host===1),plist=()=>RM.peers().filter(p=>p.kind==='viewer'&&p.presence&&p.presence.nm),me=()=>RM.peers().find(p=>p.isMe&&p.sameTab);
const cv2=v=>v==='true'?true:v==='false'?false:isNaN(+v)?v:+v,hset=p=>RM?RM.presence(p).catch(()=>{}):0;
document.querySelectorAll('.chipset').forEach(cs=>cs.onclick=e=>{const b=e.target.closest('button');if(!b)return;cs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));SET[cs.dataset.k]=cv2(b.dataset.v);$('pgrid').hidden=!SET.grid});
function localRoom(){return{join:async name=>{const ch=new BroadcastChannel('ct-'+name),id=Math.random().toString(36).slice(2,10);let mine={},oth=new Map(),subs=[];
 const snap=()=>[{peer:id,isMe:true,sameTab:true,kind:'viewer',guest:false,by:null,presence:mine,updatedAt:Date.now()}].concat([...oth].map(([k,v])=>({peer:k,isMe:false,sameTab:false,kind:'viewer',guest:false,by:null,presence:v.p,updatedAt:v.t})));
 const fire=()=>{const s=snap();subs.forEach(f=>f({peers:s,joined:[],left:[],updated:[]}))},send=x=>{try{ch.postMessage(Object.assign({id},x))}catch(e){}};
 ch.onmessage=e=>{const m=e.data;if(!m||m.id===id)return;if(m.t==='bye')oth.delete(m.id);else{oth.set(m.id,{p:m.p||{},t:Date.now()});if(m.t==='hi')send({t:'p',p:mine})}fire()};
 const hb=setInterval(()=>{send({t:'p',p:mine});const n=Date.now();let c=false;oth.forEach((v,k)=>{if(n-v.t>7000){oth.delete(k);c=true}});if(c)fire()},2000),bye=()=>send({t:'bye'});
 addEventListener('pagehide',bye);send({t:'hi',p:mine});
 return{peers:snap,presence:async patch=>{const m=Object.assign({},mine);for(const k in patch){patch[k]===null?delete m[k]:m[k]=patch[k]}mine=m;send({t:'p',p:mine});fire()},
  onPeers:f=>{subs.push(f);return()=>{subs=subs.filter(x=>x!==f)}},leave:async()=>{bye();clearInterval(hb);ch.close();removeEventListener('pagehide',bye);subs=[]}}}}}
async function joinRoom(code){if(!$('pname').value.trim())throw new Error('Enter your name before creating or joining a party.');let r=null;try{r=window.claude?await claude.use('room'):null}catch(e){}MP.local=!r;
 if(!r){if(typeof BroadcastChannel!=='function')throw new Error('Multiplayer is not available in this browser.');r=localRoom()}
 RM=await r.join('ct-'+code.toLowerCase());MP.code=code;MP.name=$('pname').value.trim().slice(0,12);await RM.presence({nm:MP.name});RM.onPeers(mpRender)}
$('pcreate').onclick=()=>{if(!$('pname').value.trim()){pm('Enter your name first.');$('pname').focus();return}pm('');scr('pm-setup')};$('pback').onclick=()=>scr('pm-home');
$('pgo').onclick=async()=>{try{const code=Array.from({length:5},()=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.random()*31|0]).join('');
 SET.gx=Math.max(1,Math.min(72,+$('sgx').value|0));SET.gy=Math.max(1,Math.min(36,+$('sgy').value|0));
 await joinRoom(code);MP.host=true;await RM.presence({host:1,cfg:{...SET},ph:'lobby',r:0});mpEnter()}catch(e){pm(e.message||'Could not create the party.');scr('pm-home')}};
$('pjoin').onclick=async()=>{const code=$('pcode').value.trim().toUpperCase();if(!$('pname').value.trim()){pm('Enter your name first.');$('pname').focus();return}if(code.length<4){pm('Enter the party code.');return}pm('Joining…');
 try{await joinRoom(code);for(let i=0;i<24&&!hostP();i++)await new Promise(r=>setTimeout(r,150));
  if(!hostP()){const r=RM;RM=null;await r.leave();pm('No party found with that code, or the host has left.');return}MP.host=false;pm('');mpEnter()}catch(e){pm(e.message||'Could not join.')}};
function mpApply(c){GX=c.grid?c.gx:0;GY=c.grid?c.gy:0;mode=c.mode;document.body.classList.toggle('nopin',!c.pin);hovF=null;hovCell=null;dirty=true}
function mpEnter(){savedGrid=[GX,GY];MP.on=true;MP.ph='';MP.r=-1;MP.subm=false;MP.ending=false;MP.tot={};MP.nm={};MP.cfg=hostP().presence.cfg;mpApply(MP.cfg);NAVH.forEach(t=>navb(t).hidden=true);showTab('party');mpRender()}
function mpRender(){if(!MP.on||!RM)return;const H=hostP();
 if(!H){if(!goneT)goneT=setTimeout(()=>{goneT=0;if(MP.on&&!hostP())mpLeave('The host left, so the party ended.')},4000);return}
 clearTimeout(goneT);goneT=0;const h=H.presence;MP.cfg=h.cfg||MP.cfg;if(h.ph!==MP.ph||h.r!==MP.r)mpPhase(h);mpUI(h)}
function mpPhase(h){MP.ph=h.ph;MP.r=h.r;MP.subm=false;const c=h.cfg;
 if(h.ph==='guess'){mode=c.mode;locked=false;G=null;revF=null;OTH=[];$('milat').value=$('milon').value='';T=h.tg?{lat:h.tg[0],lon:h.tg[1]}:null;
  tgtF=c.mode==='try'?F.find(f=>f.properties.name===h.tc)||null:null;anc=null;tgt.z=1;tgt.lon=0;tgt.lat=20;clampC(tgt);hset({gr:null,gl:null,gn:null,ok:0})}
 else if(h.ph==='res'){locked=true;const m=me(),my=m?m.peer:'';OTH=(h.res||[]).filter(r=>r[0]!==my&&r[3]>=0).map((r,i)=>({name:esc(r[1]),lat:r[4],lon:r[5],c:PCOL[(i+1)%8]}));
  revF=c.mode==='try'?tgtF:(T?featAt(T.lon,T.lat):null);if(T){G?flyTo(G,T):focus(T.lon,T.lat,40,40)}}
 else{T=null;G=null;locked=false;revF=null;OTH=[];anc=null;tgt.z=1;tgt.lon=0;tgt.lat=20;clampC(tgt)}
 updMission();dirty=true}
function board(h,fin){const m=me(),my=m?m.peer:'',Tt=(h.tot||[]).slice().sort((a,b)=>b[2]-a[2]);let s='';
 if(!fin)s+=`<b>Round ${h.r} results</b><table><tr><th>#</th><th>Player</th><th>Distance</th><th>Score</th></tr>`+(h.res||[]).map((r,i)=>`<tr><td>${i+1}</td><td class="${r[0]===my?'me':''}">${esc(r[1])}</td><td>${r[3]<0?'no guess':Math.round(r[3]).toLocaleString()+' km'}</td><td>${r[2]}</td></tr>`).join('')+'</table><br>';
 s+=`<b>${fin?'Final standings':'Standings'}</b><table><tr><th>#</th><th>Player</th><th>Total</th></tr>`+Tt.map((r,i)=>`<tr><td>${i+1}</td><td class="${r[0]===my?'me':''}">${esc(r[1])}</td><td>${r[2]}</td></tr>`).join('')+'</table>';
 return fin&&Tt.length?`<div class="big">${esc(Tt[0][1])} wins!</div>`+s:s}
function mpUI(h){const c=h.cfg,ps=plist(),n=c.rounds,isH=MP.host,meta=`${c.mode==='guess'?'Guess (click map)':'Try (type coordinate)'} · ${c.time?c.time+' s timer':'no timer'} · ${c.grid?'grid '+c.gx+'×'+c.gy:'no grid'} · pinpoint tag ${c.pin?'on':'off'} · ${n} rounds`;
 if(h.ph==='lobby'){scr('pm-lobby');$('pcode2').textContent=MP.code;$('plocal').hidden=!MP.local;$('pmeta').textContent=meta;$('plist').innerHTML=ps.map(p=>`<span class="pl">${esc(p.presence.nm)}${p.presence.host?' (host)':''}${p.isMe&&p.sameTab?' (you)':''}</span>`).join('');
  $('pstart').hidden=!isH;$('pwait').hidden=isH;$('mtimer').hidden=true;return}
 scr('pm-game');$('pgmeta').textContent=meta;$('mtimer').hidden=h.ph==='end';$('mtimer').textContent=`Round ${h.r}/${n}`+(h.ph==='guess'?(c.time?` · ${h.rem}s`:''):' · results');
 if(h.ph==='guess'){const ok=ps.filter(p=>p.presence.gr===h.r&&p.presence.ok===1).length;
  $('pgprompt').innerHTML=c.mode==='guess'&&T?`Find <b>${fmt(T.lat,T.lon)}</b>`:`Where is <b>${esc(tgtF?tgtF.properties.name:h.tc)}</b>?`;
  $('pgin').hidden=c.mode!=='try'||MP.subm;$('pgsub').hidden=false;$('pgsub').disabled=MP.subm||!G;$('pgsub').textContent=MP.subm?'Locked in':'Lock in guess';
  $('pgstat').textContent=`${ok}/${ps.length} locked in`+(MP.subm?'. Waiting for the others…':'');$('pgres').hidden=true}
 else{$('pgprompt').textContent='';$('pgin').hidden=true;$('pgsub').hidden=true;$('pgstat').textContent='';$('pgres').hidden=false;$('pgres').innerHTML=board(h,h.ph==='end')}
 $('pgnext').hidden=!(isH&&h.ph==='res');$('pgnext').textContent=h.r>=n?'Final results':'Next round';$('pgagain').hidden=!(isH&&h.ph==='end')}
function mpGuess(ok){if(G&&RM)hset({gr:MP.r,gl:+G.lat.toFixed(3),gn:+G.lon.toFixed(3),ok:ok?1:0})}
$('pgsub').onclick=()=>{if(!G||MP.subm)return;MP.subm=true;mpGuess(1);mpRender()};
$('milat').oninput=$('milon').oninput=()=>{if(MP.subm)return;const la=parseC($('milat').value,true),lo=parseC($('milon').value,false);G=la!==null&&lo!==null?{lat:la,lon:lo}:null;mpGuess(0);dirty=true;mpRender()};
function startRound(r){const c=MP.cfg;let t;
 if(c.mode==='guess'){let la,lo,k=0;do{la=Math.asin(2*Math.random()-1)/RAD;lo=Math.random()*360-180;k++}while(k<500&&(Math.abs(la)>72||!featAt(lo,la)));t={tg:[+la.toFixed(2),+lo.toFixed(2)]}}
 else{const L=F.filter(f=>f.m.a>.0008&&f.properties.name!=='Antarctica'),f=L[Math.floor(Math.random()*L.length)];t={tc:f.properties.name,tg:[f.m.c[1],f.m.c[0]]}}
 MP.ending=false;MP.deadline=c.time?Date.now()+c.time*1000:0;hset({ph:'guess',r,tg:t.tg,tc:t.tc||null,rem:c.time||0,res:null});
 clearInterval(tickT);tickT=setInterval(()=>{const H=hostP();if(!H||H.presence.ph!=='guess'||MP.ending)return;
  if(MP.deadline){const rem=Math.max(0,Math.ceil((MP.deadline-Date.now())/1000));if(rem!==H.presence.rem)hset({rem});if(Date.now()>MP.deadline+900){endRound();return}}
  const ps=plist();if(ps.length&&ps.every(p=>p.presence.gr===r&&p.presence.ok===1))endRound()},300)}
function endRound(){if(MP.ending)return;MP.ending=true;clearInterval(tickT);const h=hostP().presence,c=h.cfg,r=h.r,tgF=c.mode==='try'?F.find(f=>f.properties.name===h.tc):null,Tp={lat:h.tg[0],lon:h.tg[1]};
 const rows=plist().map(p=>{const q=p.presence;let d=-1,s=0,la=0,lo=0;
  if(q.gr===r&&typeof q.gl==='number'&&typeof q.gn==='number'){la=q.gl;lo=q.gn;const g={lat:la,lon:lo};d=c.mode==='try'?(tgF&&featAt(lo,la)===tgF?0:minDist(tgF,g)):dist(g,Tp);s=Math.round(5000*Math.exp(-d/1500))}
  const nm=String(q.nm).slice(0,12);MP.tot[p.peer]=(MP.tot[p.peer]||0)+s;MP.nm[p.peer]=nm;return[p.peer,nm,s,d<0?-1:Math.round(d),+la.toFixed(2),+lo.toFixed(2)]}).sort((a,b)=>b[2]-a[2]);
 hset({ph:'res',res:rows,tot:Object.keys(MP.tot).map(k=>[k,MP.nm[k],MP.tot[k]]),rem:0})}
$('pstart').onclick=()=>{MP.tot={};MP.nm={};startRound(1)};
$('pgnext').onclick=()=>{const h=hostP().presence;h.r>=h.cfg.rounds?hset({ph:'end'}):startRound(h.r+1)};
$('pgagain').onclick=()=>{MP.tot={};MP.nm={};hset({ph:'lobby',r:0,res:null,tot:null,tg:null,tc:null})};
$('pcopy').onclick=()=>{try{navigator.clipboard.writeText(MP.code)}catch(e){}$('pcopy').textContent='Copied';setTimeout(()=>$('pcopy').textContent='Copy code',1500)};
async function mpLeave(msg){clearInterval(tickT);clearTimeout(goneT);goneT=0;const r=RM;RM=null;MP.on=false;MP.host=false;try{r&&await r.leave()}catch(e){}
 document.body.classList.remove('nopin');NAVH.forEach(t=>navb(t).hidden=false);if(savedGrid){GX=savedGrid[0];GY=savedGrid[1];savedGrid=null}
 OTH=[];$('mtimer').hidden=true;$('pgres').innerHTML='';scr('pm-home');pm(msg||'');showTab('party');setMode('guess')}
$('pleave').onclick=()=>mpLeave();$('pgleave').onclick=()=>mpLeave();

// ---------- login ----------
let USER='';try{USER=localStorage.getItem('ct-user')||''}catch(e){}
function setUser(n){USER=n;try{n?localStorage.setItem('ct-user',n):localStorage.removeItem('ct-user')}catch(e){}
 $('uchip').textContent=n?'👤 '+n:'Guest · Log in';const p=$('pname');if(n){p.value=n;p.readOnly=true}else{if(p.readOnly)p.value='';p.readOnly=false}}
$('lgo').onclick=()=>{const n=$('lname').value.trim();if(!/^[\p{L}\p{N} _.-]{2,12}$/u.test(n)){$('lerr').textContent='Use 2 to 12 letters, numbers, spaces, dots, dashes or underscores.';return}setUser(n);$('login').hidden=true};
$('lguest').onclick=()=>{setUser('');$('login').hidden=true};
$('lname').onkeydown=e=>{if(e.key==='Enter')$('lgo').click()};
$('uchip').onclick=()=>{$('lname').value=USER;$('lerr').textContent='';$('login').hidden=false;$('lname').focus()};
setUser(USER);$('login').hidden=!!USER;

// ---------- boot ----------
resize();syncUI();showTab('play');requestAnimationFrame(tick);
requestAnimationFrame(()=>{$('load').hidden=true;setTimeout(()=>{HI=mk('hi');F=HI;
 $('clist').innerHTML=HI.map(f=>`<option value="${f.properties.name}">`).join('');setMode('guess');dirty=true},20)});
})();

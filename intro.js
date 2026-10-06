(()=>{
let shown=false,running=true;const intro=document.getElementById('intro');

const cv=document.getElementById('ic'),ctx=cv.getContext('2d');
const lerp=(a,b,t)=>a+(b-a)*t,cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
// ---------- paper folding ----------
const W=210,H=148,k=Math.SQRT1_2,c8=.9239,s8=.3827;
const STEPS=[[{p:[-W,0],d:[k,-k],s:-1},{p:[-W,0],d:[k,k],s:1}],[{p:[-W,0],d:[c8,-s8],s:-1},{p:[-W,0],d:[c8,s8],s:1}],[{p:[-W,0],d:[1,0],s:-1}]];
const ST=[.7,1.25,1.8],DUR=.4;
function clip(P,g){const o=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ga=g(a),gb=g(b);if(ga>=0)o.push(a);if((ga>=0)!=(gb>=0)){const t=ga/(ga-gb);o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}return o}
function fold(L,f,th){const n=[-f.d[1],f.d[0]],dd=q=>(q[0]-f.p[0])*n[0]+(q[1]-f.p[1])*n[1],c=Math.cos(th),out=[],mv=[];
for(const l of L){const A=clip(l.p,q=>-f.s*dd(q)),B=clip(l.p,q=>f.s*dd(q));
if(A.length>2)out.push({p:A,b:l.b,sh:l.sh});
if(B.length>2)mv.push({p:B.map(q=>{const k=(1-c)*dd(q);return[q[0]-k*n[0],q[1]-k*n[1]]}),b:l.b!==(c<0),sh:Math.sin(th)})}
return out.concat(mv.reverse())}
const states=[[{p:[[-W,-H],[W,-H],[W,H],[-W,H]],b:false,sh:0}]];
for(const s of STEPS){let L=states[states.length-1];for(const f of s)L=fold(L,f,Math.PI);states.push(L.map(l=>({...l,sh:0})))}
function sheet(t){const n=ST.filter(s=>t>=s+DUR).length;let L=states[n];
if(n<3&&t>ST[n]){const th=Math.PI*ease(cl((t-ST[n])/DUR));for(const f of STEPS[n])L=fold(L,f,th)}
ctx.save();ctx.translate(640,370);const s=lerp(1.45,1.3,cl(t/2.5));ctx.scale(-s,s);
ctx.shadowColor='rgba(30,90,160,.28)';ctx.shadowBlur=18;ctx.shadowOffsetY=10;
for(const l of L){ctx.beginPath();l.p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();
ctx.fillStyle=l.b?'#e1ecf7':'#fff';ctx.fill();ctx.shadowColor='transparent';
if(l.sh>.01){ctx.fillStyle=`rgba(40,100,170,${.16*l.sh})`;ctx.fill()}
ctx.strokeStyle='rgba(110,145,180,.6)';ctx.lineWidth=1.2;ctx.stroke();
ctx.shadowColor='rgba(30,90,160,.2)';ctx.shadowBlur=8;ctx.shadowOffsetY=4}
ctx.restore()}
// ---------- plane sprite ----------
function poly(P,f){ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fillStyle=f;ctx.fill();ctx.strokeStyle='rgba(110,145,180,.7)';ctx.lineWidth=1;ctx.stroke()}
function plane(x,y,a,sc,fl){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(sc,sc*(1-.3*fl));
ctx.shadowColor='rgba(30,90,160,.35)';ctx.shadowBlur=10;ctx.shadowOffsetY=6;
poly([[64,0],[-46,50],[-28,4]],'#d6e4f1');ctx.shadowColor='transparent';
poly([[64,0],[-46,-50],[-28,-4]],'#fff');poly([[64,0],[-28,-3],[-36,14]],'#b9cfe2');ctx.restore()}
// ---------- globe ----------
const EU=[[-9,37],[-9,43],[2,51],[8,54],[5,62],[15,69],[30,71],[60,69],[80,73],[110,77],[140,72],[180,69],[180,64],[160,60],[140,55],[135,44],[129,35],[122,40],[121,31],[117,23],[108,21],[106,10],[103,1],[100,6],[98,16],[94,17],[92,22],[87,21],[80,15],[80,10],[77,8],[73,16],[72,21],[67,24],[61,25],[57,26],[52,28],[48,30],[50,26],[56,24],[59,22],[52,16],[43,13],[39,22],[35,28],[34,31],[36,36],[27,37],[26,40],[22,37],[19,41],[13,44],[8,44],[3,43],[-2,43]];
const AF=[[-17,21],[-6,36],[10,37],[32,31],[35,28],[43,12],[51,12],[40,-3],[40,-15],[33,-26],[20,-35],[12,-17],[9,4],[-8,4],[-17,14]];
const AU=[[114,-22],[130,-12],[142,-11],[153,-27],[146,-39],[130,-32],[115,-34]];
const IN=[[68,24],[72,21],[73,16],[77,8],[80,13],[80,16],[87,21],[89,26],[92,27],[97,28],[88,28],[80,30],[75,35],[74,32],[71,28],[70,25]];
let G={x:0,y:0,R:1,lo:0,la:0};
function proj(la,lo){const f=Math.PI/180,p=la*f,l=(lo-G.lo)*f,p0=G.la*f;return[Math.cos(p)*Math.sin(l),Math.cos(p0)*Math.sin(p)-Math.sin(p0)*Math.cos(p)*Math.cos(l),Math.sin(p0)*Math.sin(p)+Math.cos(p0)*Math.cos(p)*Math.cos(l)]}
const scr=v=>[G.x+G.R*v[0],G.y-G.R*v[1]];
function land(P,fill,stroke){ctx.beginPath();P.forEach(([lo,la],i)=>{let v=proj(la,lo);if(v[2]<0){const m=Math.hypot(v[0],v[1])||1;v=[v[0]/m,v[1]/m,0]}const s=scr(v);i?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1])});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}}
function lines(pts){let pen=false;ctx.beginPath();for(const[la,lo]of pts){const v=proj(la,lo);if(v[2]<0){pen=false;continue}const s=scr(v);pen?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1]);pen=true}ctx.stroke()}
function globe(){const{x,y,R}=G;
let h=ctx.createRadialGradient(x,y,R*.95,x,y,R*1.14);h.addColorStop(0,'rgba(255,255,255,.95)');h.addColorStop(.35,'rgba(150,205,250,.5)');h.addColorStop(1,'rgba(150,205,250,0)');
ctx.fillStyle=h;ctx.beginPath();ctx.arc(x,y,R*1.14,0,7);ctx.fill();
ctx.save();ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.clip();
let o=ctx.createRadialGradient(x-R*.4,y-R*.45,R*.1,x,y,R*1.05);o.addColorStop(0,'#6db8f2');o.addColorStop(.55,'#2f84d6');o.addColorStop(1,'#1c5cae');ctx.fillStyle=o;ctx.fillRect(x-R,y-R,2*R,2*R);
ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;
for(let lo=-180;lo<180;lo+=30){const a=[];for(let la=-80;la<=80;la+=5)a.push([la,lo]);lines(a)}
for(let la=-60;la<=60;la+=30){const a=[];for(let lo=-180;lo<=180;lo+=5)a.push([la,lo]);lines(a)}
for(const P of[EU,AF,AU])land(P,'#58bd72','rgba(255,255,255,.55)');
land(IN,'#33a458','rgba(255,255,255,.7)');
let g=ctx.createRadialGradient(x-R*.45,y-R*.5,0,x-R*.3,y-R*.3,R*.9);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(.5,'rgba(255,255,255,.06)');g.addColorStop(1,'rgba(10,50,120,.22)');ctx.fillStyle=g;ctx.fillRect(x-R,y-R,2*R,2*R);ctx.restore();
ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.stroke()}
function setG(t){const q=ease(cl((t-3.2)/3)),l=ease(cl((t-6.2)/1));G={x:lerp(920,640,q),y:lerp(230,500,q)+30*l,R:lerp(70,380,q)+60*l,lo:lerp(25,78,q),la:lerp(8,22,q)}}
const dl=()=>scr(proj(28.6139,77.209));
function bg(t){ctx.fillStyle='#fff';ctx.fillRect(0,0,1280,720);const a=.22+.2*cl((t-3.2)/1.5);
let g=ctx.createRadialGradient(1100,80,0,1100,80,700);g.addColorStop(0,`rgba(70,150,230,${a})`);g.addColorStop(1,'rgba(70,150,230,0)');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);
g=ctx.createRadialGradient(120,680,0,120,680,520);g.addColorStop(0,'rgba(60,180,100,.22)');g.addColorStop(1,'rgba(60,180,100,0)');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720)}
function clouds(t){const p=cl((t-3.2)/3);if(p<=0||p>=1)return;ctx.fillStyle=`rgba(255,255,255,${.7*(1-p)})`;
for(let i=0;i<8;i++){const x=((i*251-(t-3.2)*(520+i*60))%1500+1500)%1500-100,y=80+(i*97)%540;ctx.beginPath();ctx.ellipse(x,y,120+i*12,14+i*2,0,0,7);ctx.fill()}}
function pin(t){const u=cl((t-7.2)/.5);if(u<=0)return;const[x,y]=dl();const c1=1.70158,e=1+(c1+1)*Math.pow(u-1,3)+c1*Math.pow(u-1,2);
const dy=-90*(1-e),a=cl(u*3);ctx.save();ctx.globalAlpha=a;
ctx.fillStyle='rgba(20,60,110,.25)';ctx.beginPath();ctx.ellipse(x,y+1,9,3.5,0,0,7);ctx.fill();
const rp=cl((t-7.5)/.6);if(rp>0&&rp<1){ctx.strokeStyle=`rgba(229,38,38,${.5*(1-rp)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,8+30*rp,3+11*rp,0,0,7);ctx.stroke()}
ctx.translate(x,y+dy);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-6,-14,-16,-22,-16,-34);ctx.arc(0,-34,16,Math.PI,0);ctx.bezierCurveTo(16,-22,6,-14,0,0);
ctx.shadowColor='rgba(120,0,0,.35)';ctx.shadowBlur=8;ctx.fillStyle='#e52424';ctx.fill();ctx.shadowColor='transparent';
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-34,6,0,7);ctx.fill();ctx.restore()}
const TR=[];
function trail(){const n=TR.length;ctx.save();ctx.lineCap='round';ctx.shadowColor='rgba(60,130,210,.7)';ctx.shadowBlur=8;
for(let i=1;i<n;i++){const f=i/n;ctx.strokeStyle=`rgba(255,255,255,${.9*f})`;ctx.lineWidth=1+6*f;ctx.beginPath();ctx.moveTo(TR[i-1][0],TR[i-1][1]);ctx.lineTo(TR[i][0],TR[i][1]);ctx.stroke()}ctx.restore()}
function frame(t){ctx.setTransform(1.5,0,0,1.5,0,0);bg(t);
if(t<2.5){TR.length=0;sheet(t);return}
if(t<3.2){plane(640,370+Math.sin((t-2.5)*6)*4,0,2.6*(1+.1*Math.max(0,1-(t-2.5)*6)),0);return}
setG(t);clouds(t);ctx.save();ctx.globalAlpha=cl((t-3)/.4);globe();ctx.restore();
const D=dl(),r=G.R/380,T=[D[0]-44*r,D[1]+14*r],A=[T[0]-90*r,T[1]-75*r],P0=[640,370],C1=[900,330],C2=[380,300];let x,y,a,sc,fl=0,u=0;
if(t<6.2){const p=ease((t-3.2)/3),m=1-p,B=i=>m*m*m*P0[i]+3*m*m*p*C1[i]+3*m*p*p*C2[i]+p*p*p*A[i],
d=i=>3*m*m*(C1[i]-P0[i])+6*m*p*(C2[i]-C1[i])+3*p*p*(A[i]-C2[i]);x=B(0);y=B(1);a=Math.atan2(d(1)||.001,d(0)||.001);sc=lerp(2.6,.9,p);fl=.5*Math.sin((t-3.2)*5)*(1-p)}
else{u=ease(cl((t-6.2)/1));x=lerp(A[0],T[0],u);y=lerp(A[1],T[1],u);if(t>7)y-=Math.max(0,Math.sin((t-7)*16))*7*Math.max(0,1-(t-7)*3.5);
a=lerp(Math.atan2(A[1]-C2[1],A[0]-C2[0]),.17,u);sc=lerp(.9,.55,u);fl=u}
if(t<7.2)TR.push([x,y]);if(TR.length>45||(t>=7.2&&TR.length))TR.shift();trail();
if(u>0){ctx.fillStyle=`rgba(10,50,110,${.22*u})`;ctx.beginPath();ctx.ellipse(x+6,y+14,34*sc,9*sc,0,0,7);ctx.fill()}
const dr=cl((t-6.95)/.5);if(dr>0&&dr<1){ctx.strokeStyle=`rgba(255,255,255,${.9*(1-dr)})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(T[0],T[1]+8,14+46*dr,5+16*dr,0,0,7);ctx.stroke()}
plane(x,y,a,sc,fl);pin(t)}
// ---------- sound (synthesized, no files) ----------
let actx,master,nb,snd=false;
function enable(){if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)();const cp=actx.createDynamicsCompressor();master=actx.createGain();master.connect(cp);cp.connect(actx.destination);
nb=actx.createBuffer(1,actx.sampleRate*2,actx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
actx.resume();master.gain.value=.8;snd=true}
function tone(f,at,d,type,v,f2){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+d);
g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.01);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(g);g.connect(master);o.start(at);o.stop(at+d+.05)}
function noise(at,d,f1,f2,v,q,pk){const s=actx.createBufferSource(),b=actx.createBiquadFilter(),g=actx.createGain();s.buffer=nb;s.loop=true;b.type='bandpass';b.Q.value=q;
b.frequency.setValueAtTime(f1,at);b.frequency.exponentialRampToValueAtTime(f2,at+d);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+d*pk);g.gain.exponentialRampToValueAtTime(.0001,at+d);
s.connect(b);b.connect(g);g.connect(master);s.start(at);s.stop(at+d+.05)}
const PEN=[523,587,659,784,880],crease=n=>noise(n,.25,3500,1400,.4,2,.2),pluck=f=>n=>{tone(f,n,.6,'triangle',.18);tone(f/2,n,.7,'sine',.12)};
const CUES=[[.7,crease],[1.1,pluck(PEN[2])],[1.25,crease],[1.65,pluck(PEN[3])],[1.8,crease],[2.2,pluck(PEN[4]*2)],
[2.5,n=>{tone(1047,n,.6,'sine',.15);tone(1568,n+.08,.7,'sine',.12)}],
[3.2,n=>{noise(n,3,400,3200,.3,.8,.6);for(let i=0;i<12;i++)tone(PEN[i%5]*(i<5?1:2),n+i*.25,.35,'triangle',.07)}],
[6.2,n=>{noise(n,.9,2500,300,.25,.8,.3);tone(700,n,.9,'sine',.07,220);noise(n+.8,.2,900,300,.4,1,.1);tone(150,n+.8,.3,'sine',.4,45);[523,659,784].forEach((f,i)=>tone(f,n+1+i*.05,1.2,'sine',.08))}],
[7.2,n=>{tone(500,n,.15,'sine',.25,1300);[1319,1760,2093].forEach((f,i)=>tone(f,n+.12+i*.12,.8,'sine',.12));tone(880,n+.4,.15,'triangle',.07);tone(1100,n+.55,.12,'triangle',.05)}]];
const btn=document.getElementById('isnd'),T0=()=>{t0=performance.now();shown=false;intro.classList.remove('done')};
function ui(){document.getElementById('ix').style.display=snd?'none':'';document.getElementById('iw').style.display=snd?'':'none';btn.classList.toggle('hint',!snd)}
btn.onclick=e=>{e.stopPropagation();if(snd){snd=false;master.gain.value=0}else{enable();T0()}ui()};
let t0=performance.now(),prev=-1,pt=0;
cv.onclick=()=>{T0();if(!snd){enable();ui()}};
(function loop(n){if(!running)return;const tt=(n-t0)/1000,t=Math.min(tt,8);if(tt<pt)prev=-1;pt=tt;
if(snd)for(const[c,f]of CUES)if(c>prev&&c<=t)f(actx.currentTime);prev=t;frame(t);
if(tt>7.3&&!shown){shown=true;intro.classList.add('done')}requestAnimationFrame(loop)})(performance.now());
function closeIntro(){if(!running)return;running=false;snd=false;if(master)master.gain.value=0;intro.classList.add('out');setTimeout(()=>intro.remove(),700)}
document.getElementById('enter').onclick=closeIntro;document.getElementById('iskip').onclick=closeIntro;
addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter')closeIntro()});

})();

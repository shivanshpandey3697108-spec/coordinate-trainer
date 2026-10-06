
let SND=true,gest=false,ax=null,mg=null,nb=null;try{SND=localStorage.getItem('ct-sfx')!=='0'}catch(e){}
const replay=(el,c='unfold')=>{el.classList.remove(c);void el.offsetWidth;el.classList.add(c)};
function axInit(){if(!gest)return false;if(ax){if(ax.state==='suspended')ax.resume();return true}
 try{ax=new(window.AudioContext||window.webkitAudioContext)();const cp=ax.createDynamicsCompressor();mg=ax.createGain();mg.gain.value=.55;mg.connect(cp);cp.connect(ax.destination);
 nb=ax.createBuffer(1,ax.sampleRate,ax.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true}catch(e){return false}}
function tn(f,at,d,ty,v,f2){const o=ax.createOscillator(),g=ax.createGain();o.type=ty;o.frequency.setValueAtTime(f,at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+d);
 g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(g);g.connect(mg);o.start(at);o.stop(at+d+.05)}
function nz(at,d,f1,f2,v,q){const s=ax.createBufferSource(),b=ax.createBiquadFilter(),g=ax.createGain();s.buffer=nb;s.loop=true;b.type='bandpass';b.Q.value=q;
 b.frequency.setValueAtTime(f1,at);b.frequency.exponentialRampToValueAtTime(f2,at+d);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+d*.3);g.gain.exponentialRampToValueAtTime(.0001,at+d);
 s.connect(b);b.connect(g);g.connect(mg);s.start(at);s.stop(at+d+.05)}
const SFX={click:n=>tn(900,n,.05,'sine',.05),unfold:n=>nz(n,.34,700,3200,.11,1.2),fold:n=>nz(n,.24,3000,800,.11,1.2),
 pin:n=>{tn(620,n,.12,'sine',.11,320);tn(880,n+.09,.1,'triangle',.06)},confirm:n=>{tn(660,n,.12,'sine',.09);tn(990,n+.09,.18,'sine',.09)},
 correct:n=>[523,659,784].forEach((f,i)=>tn(f,n+i*.09,.35,'sine',.09)),wrong:n=>{tn(330,n,.22,'triangle',.07,247);tn(247,n+.14,.3,'triangle',.06,196)},
 tick:n=>tn(1200,n,.04,'square',.02),hover:n=>tn(1400,n,.025,'sine',.012),select:n=>{tn(740,n,.07,'sine',.07);tn(1110,n+.05,.09,'sine',.05)},zoom:n=>nz(n,.18,900,1800,.05,2),card:n=>{nz(n,.22,1200,2400,.07,1.5);tn(988,n+.1,.18,'sine',.05)},chime:n=>[659,880,1175].forEach((f,i)=>tn(f,n+i*.1,.5,'sine',.07)),perfect:n=>[1175,1568,1976].forEach((f,i)=>tn(f,n+.3+i*.07,.5,'sine',.05)),nope:n=>tn(260,n,.18,'triangle',.06,200),win:n=>[523,659,784,1047].forEach((f,i)=>tn(f,n+i*.12,.6,'triangle',.07)),round:n=>{nz(n,.4,500,2600,.09,1);tn(784,n+.25,.4,'sine',.07)},
 join:n=>{tn(587,n,.12,'sine',.08);tn(880,n+.1,.2,'sine',.08)},start:n=>[392,523,659,784].forEach((f,i)=>tn(f,n+i*.07,.4,'triangle',.07))};
function sfx(k){if(!SND||!axInit())return;try{SFX[k](ax.currentTime+.01)}catch(e){}}

function setSoundEnabled(v){SND=!!v;gest=true;try{localStorage.setItem('ct-sfx',SND?'1':'0')}catch(e){}}
function soundEnabled(){return SND}
export { sfx, replay, setSoundEnabled, soundEnabled };

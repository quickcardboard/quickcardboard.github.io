/* ===== STATE ===== */
let endR=0,endT=null,loot=[],objT=0,units=[],smokes=[],gren=[],tracers=[],rec=[],rp=null,paused=false,state="menu",res="",sel=null,cmd=null,drag=null,dpr=1,cam={s:20,ox:0,oy:0},minS,maxS,CFG={};
const players=()=>units.filter(u=>u.team==0&&u.alive&&!u.obj),foes=()=>units.filter(u=>u.team==0&&u.alive);
function init(){ex.setTransform(FS,0,0,FS,0,0);ex.fillStyle="#fff";ex.fillRect(0,ZY-1,W,H-ZY+1);units=[];
 if(LV){LV.spawns.forEach((s,i)=>{const u=mk(0,s.x,s.y,CFG.sh);u.n=i+1;units.push(u)});LV.enemies.forEach(spawnEn);spawnObj()}else{for(let i=0;i<CFG.sq;i++){const cl=Math.min(CFG.sq,6),rw=Math.floor(i/cl),ct=Math.min(cl,CFG.sq-rw*cl),u=mk(0,W/2+(i%cl-(ct-1)/2)*1.1,H-2.5-rw*.9,CFG.sh);u.n=i+1;units.push(u)}
 const open=[];for(let y=1;y<=ZY-4;y++)for(let x=1;x<W-1;x++)if(reach[y*W+x]&&!T[y*W+x]&&wk(x+.5,y+.5))open.push([x+.5,y+.5]);
 for(let i=0;i<CFG.en&&open.length;i++){const a=open[rnd(open.length)],e=mk(1,a[0],a[1],CFG.eh);e.mode="walk";e.type="rifle";e.face=Math.random()*6.28;let r=[];
  for(let t=0;t<40&&!r.length;t++){const b=open[rnd(open.length)],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d<3||d>10)continue;const p1=path(a[0],a[1],b[0],b[1],1),p2=path(b[0],b[1],a[0],a[1],1);if(p1&&p2)r=p1.concat(p2)}
  e.route=r.length?r:[a];units.push(e)}}
 endT=null;endR=0;objT=0;fx.reset();fx.cam0=null;loot=(LV&&LV.objective=="collect"?LV.items||[]:[]).map(i=>({x:i.x,y:i.y,got:0}));smokes=[];gren=[];tracers=[];rec=[];sel=null;cmd=null;drag=null;setPause(false);rec.push(snapRec(0))}
function resize(){dpr=devicePixelRatio||1;cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;minS=Math.min((innerWidth-160)/W,(innerHeight-230)/H);maxS=innerWidth/6;clampCam()}
function clampCam(){const vw=innerWidth,vh=innerHeight;cam.s=Math.max(minS,Math.min(maxS,cam.s));const mw=W*cam.s,mh=H*cam.s,M=80;
 cam.ox=mw+2*M<=vw?(vw-mw)/2:Math.min(M,Math.max(vw-mw-M,cam.ox));cam.oy=Math.min(M,Math.max(vh-mh-150,cam.oy))}
function fitCam(){resize();cam.s=innerWidth/Math.min(W,20);cam.ox=-(W*cam.s-innerWidth)/2;cam.oy=-1e9;clampCam()}
function zoomAt(cx,cy,ns){const wx=(cx-cam.ox)/cam.s,wy=(cy-cam.oy)/cam.s;cam.s=ns;cam.ox=cx-wx*cam.s;cam.oy=cy-wy*cam.s;clampCam()}
const s2w=(x,y)=>({x:(x-cam.ox)/cam.s,y:(y-cam.oy)/cam.s}),w2s=(x,y)=>({x:x*cam.s+cam.ox,y:y*cam.s+cam.oy}),hr=()=>Math.min(.7,20/cam.s);
addEventListener("resize",resize);
function toast(t){const e=$("toast");e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,1400)}
function setPause(p){paused=p;$("pp").textContent=p?"▶":"❚❚";$("pp").className=p?"on":"";$("pulse").style.display=p?"block":"none";if(!p){for(const u of units)if(u.pc!=null){u.crouch=u.pc;u.pc=null}sel=null;cmd=null;drag=null}menu()}
$("pp").onclick=()=>{if(state=="play")setPause(!paused)};
function menu(){const m=$("menu"),hn=$("hx");$("pp").style.visibility=sel&&paused&&sel.alive&&cmd?"hidden":"";if(!sel||!paused||!sel.alive){m.style.display="none";hn.style.display="none";return}
 if(cmd){m.style.display="none";hn.style.display="block";return}
 hn.style.display="none";m.style.display="block";m.innerHTML="";(sel.host?["follow"]:["walk","crouch","wait","run","throw"]).forEach((k,i)=>{const a=(-90+i*72)*Math.PI/180,b=document.createElement("button");
  b.style.left=Math.cos(a)*68+"px";b.style.top=Math.sin(a)*68+"px";b.textContent=k=="crouch"?((sel.pc==null?sel.crouch:sel.pc)?"STAND":"CROUCH")+(sel.pc!=null?"*":""):k=="throw"?"SMOKE ×"+sel.gren:k.toUpperCase();
  if(k=="throw"&&!sel.gren)b.disabled=true;
  b.onclick=()=>{if(k=="crouch"){const n=!(sel.pc==null?sel.crouch:sel.pc);sel.pc=n==sel.crouch?null:n;if(n&&sel.mode=="run"){sel.mode="walk";sel.aim=null}} /* stance applies on PLAY */else cmd=k;menu()};m.appendChild(b)})}
$("hx").onclick=()=>{cmd=null;menu()};

/* ===== INPUT ===== */
const cv=$("c"),ctx=cv.getContext("2d"),ptrs=new Map();let pan=null,pinch=null;
cv.onpointerdown=e=>{fx.unlock();cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptrs.size==2){drag=null;pan=null;const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:cam.s};return}
 if(state=="play"){const w=s2w(e.clientX,e.clientY),hit=pickChar(w);
  if(paused&&sel&&cmd=="follow"){const s=pickChar(w);if(s&&!s.host){sel.fol=s;sel.path=[]}cmd=null;sel=null;menu();return}
  if(paused&&sel&&cmd){drag={t:cmd,dest:snap(w.x,w.y),aim:null,tx:w.x,ty:w.y};dragUpd(w);return}
  if(hit){if(!paused){toast("Pause to give orders");return}sel=hit;cmd=null;menu();return}}
 pan={x:e.clientX,y:e.clientY,ox:cam.ox,oy:cam.oy,m:0}};
/* whole sprite (plus ~12px padding at any zoom) is clickable */
function pickChar(w){const p=12/cam.s;let b=null,bd=1e9;for(const u of units){if(!u.alive||u.team||(u.obj&&!u.host))continue;const top=u.crouch?1:1.3;if(w.x>=u.x-.5-p&&w.x<=u.x+.5+p&&w.y>=u.y-top-p&&w.y<=u.y+.3+p){const d=Math.hypot(w.x-u.x,w.y-(u.y-.5));if(d<bd){bd=d;b=u}}}return b}
function throwPt(u,w){let dx=w.x-u.x,dy=w.y-u.y,l=Math.hypot(dx,dy);if(l>7){dx*=7/l;dy*=7/l;l=7}const L=l||1;let lx=u.x+dx,ly=u.y+dy;
 for(let i=1;i*.2<=l;i++){const px=u.x+dx/L*i*.2,py=u.y+dy/L*i*.2;if(tile(px,py)==2){lx=u.x+dx/L*(i-1)*.2;ly=u.y+dy/L*(i-1)*.2;break}}return[lx,ly]}
function dragUpd(w){const u=sel,thr=Math.min(.6,16/cam.s);
 if(drag.t=="walk"){if(Math.hypot(w.x-drag.dest[0],w.y-drag.dest[1])>thr)drag.aim=Math.atan2(w.y-drag.dest[1],w.x-drag.dest[0])}
 else if(drag.t=="wait"){if(Math.hypot(w.x-u.x,w.y-u.y)>thr)drag.aim=Math.atan2(w.y-u.y,w.x-u.x)}
 else if(drag.t=="run")drag.dest=snap(w.x,w.y);
 else{const p=throwPt(u,w);drag.tx=p[0];drag.ty=p[1]}}
cv.onpointermove=e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&ptrs.size==2){const[a,b]=[...ptrs.values()];zoomAt((a.x+b.x)/2,(a.y+b.y)/2,pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d);return}
 if(drag){dragUpd(s2w(e.clientX,e.clientY));const r=$("hx").getBoundingClientRect();drag.cx=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;$("hx").classList.toggle("hot",drag.cx);return}
 if(pan){const dx=e.clientX-pan.x,dy=e.clientY-pan.y;pan.m=Math.max(pan.m,Math.hypot(dx,dy));cam.ox=pan.ox+dx;cam.oy=pan.oy+dy;clampCam()}};
cv.onpointerup=cv.onpointercancel=e=>{ptrs.delete(e.pointerId);if(pinch){if(ptrs.size<2)pinch=null;pan=null;return}
 if(drag){$("hx").classList.remove("hot");if(drag.cx){drag=null;cmd=null;menu()}else{commit();drag=null}} // release over CANCEL = abort, even after targeting
 else if(pan&&pan.m<8&&!cmd&&sel){sel=null;menu()}pan=null};
cv.addEventListener("wheel",e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,cam.s*(e.deltaY<0?1.12:.89))},{passive:false});
function commit(){const u=sel,d=drag;if(!u)return;
 if(d.t=="walk"||d.t=="run"){const p=path(u.x,u.y,d.dest[0],d.dest[1]);if(!p){toast("Can't reach that spot");return}
  u.path=p;if(d.t=="run"){u.pc=u.crouch?false:null;u.mode="run";u.aim=null}else{u.mode=p.length?"walk":"wait";u.aim=d.aim}}
 else if(d.t=="wait"){u.mode="wait";u.path=[];if(d.aim!=null)u.aim=d.aim;else if(u.aim==null)u.aim=u.face}
 else if(u.gren>0){u.gren--;gren.push({sx:u.x,sy:u.y,tx:d.tx,ty:d.ty,t:0})}
 cmd=null;sel=null;menu()}

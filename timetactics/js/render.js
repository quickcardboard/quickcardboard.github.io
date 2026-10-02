/* ===== FOG + RENDER (smooth, non-pixel effects) ===== */
function conePath(c,u,ns){const R=rng(u),h=half(u),N=36;c.beginPath();c.moveTo(u.x,u.y);
 for(let k=0;k<=N;k++){const a=u.face-h+2*h*k/N;let r=0;while(r<R&&!stopT(u,u.x+Math.cos(a)*(r+.15),u.y+Math.sin(a)*(r+.15),ns))r+=.15;c.lineTo(u.x+Math.cos(a)*r,u.y+Math.sin(a)*r)}c.closePath()}
function cone(u,col){conePath(ctx,u);ctx.fillStyle=col;ctx.fill()}
let coneC=null;
function updVis(){vx.setTransform(1,0,0,1,0,0);vx.clearRect(0,0,W*FS,H*FS);const ps=players();
 for(const c of[ex,vx]){c.setTransform(FS,0,0,FS,0,0);c.fillStyle="#fff";for(const p of ps){conePath(c,p);c.fill();c.beginPath();c.arc(p.x,p.y,1,0,7);c.fill()}}
 for(const e of units){if(!e.team)continue;const was=e.vis;e.vis=e.alive&&ps.some(p=>canSee(p,e)||Math.hypot(p.x-e.x,p.y-e.y)<1.2);
  if(e.vis)e.ghost=null;else if(was&&e.alive)e.ghost={x:e.x,y:e.y};
  const g=e.ghost;if(g&&ps.some(p=>inCone(p,g.x,g.y)&&los(p,{x:g.x,y:g.y,crouch:false,smk:null})))e.ghost=null}
 const F=(c,col,src)=>{c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation="source-over";c.filter="none";c.clearRect(0,0,W*FS,H*FS);c.fillStyle=col;c.fillRect(0,0,W*FS,H*FS);c.globalCompositeOperation="destination-out";c.filter="blur(5px)";c.drawImage(src,0,0);c.filter="none";c.globalCompositeOperation="source-over"};
 if(CFG.fog){F(fa,"#aab2be",exC);F(fb,"rgba(80,92,115,.3)",vxC)}}
function arrow(x,y,a,c){ctx.strokeStyle=c;ctx.lineWidth=.08;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*1.1,y+Math.sin(a)*1.1);ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+Math.cos(a)*1.1,y+Math.sin(a)*1.1,.11,0,7);ctx.fill()}
function route(u,pts,c){if(!pts.length)return;ctx.strokeStyle=c;ctx.lineWidth=.06;ctx.setLineDash([.2,.15]);ctx.beginPath();ctx.moveTo(u.x,u.y);pts.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);const l=pts[pts.length-1];ctx.beginPath();ctx.arc(l[0],l[1],.2,0,7);ctx.stroke()}
function draw(){const rp2=state=="replay";ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#dfe3e9";ctx.fillRect(0,0,cv.width,cv.height);
 ctx.setTransform(dpr*cam.s,0,0,dpr*cam.s,dpr*cam.ox,dpr*cam.oy);ctx.imageSmoothingEnabled=false;ctx.drawImage(floorC,0,0,W,H);
 for(const i of loot)if(!i.got){const b=Math.sin(Date.now()/250+i.x)*.06;ctx.fillStyle="#35d0e8";ctx.strokeStyle="#0c6a7a";ctx.lineWidth=.04;ctx.beginPath();ctx.moveTo(i.x,i.y-.35+b);ctx.lineTo(i.x+.2,i.y-.1+b);ctx.lineTo(i.x,i.y+.15+b);ctx.lineTo(i.x-.2,i.y-.1+b);ctx.closePath();ctx.fill();ctx.stroke()}
 if(LV&&LV.exit&&(LV.objective=="reach"||LV.objective=="hostage")){ctx.strokeStyle="#2f6bff";ctx.lineWidth=.08;ctx.setLineDash([.2,.15]);ctx.beginPath();ctx.arc(LV.exit.x,LV.exit.y,1,0,7);ctx.stroke();ctx.setLineDash([])}
 const items=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=T[y*W+x];if(k){const e=EXT[k]/PX;items.push({y:y+.99,f:()=>{ctx.imageSmoothingEnabled=false;ctx.drawImage(TS[k],x+fx.jit(y*W+x),y-e,1,1+e)}})}}
 /* cones go to an offscreen layer; smoke then erases them with a soft radial falloff so they fade out before the smoke */
 if(!coneC||coneC.width!=cv.width||coneC.height!=cv.height)coneC=cvs(cv.width,cv.height);
 const kc=coneC.getContext("2d");kc.setTransform(1,0,0,1,0,0);kc.globalCompositeOperation="source-over";kc.clearRect(0,0,coneC.width,coneC.height);kc.setTransform(dpr*cam.s,0,0,dpr*cam.s,dpr*cam.ox,dpr*cam.oy);
 units.forEach(u=>{if(u.alive&&!u.obj&&(!u.team||u.vis)){kc.fillStyle=u.team?"rgba(229,56,59,.13)":"rgba(47,107,255,.14)";conePath(kc,u);kc.fill()}});
 kc.globalCompositeOperation="destination-out";
 for(const s of smokes){const R=s.r*1.7+.01,gr=kc.createRadialGradient(s.x,s.y,0,s.x,s.y,R);gr.addColorStop(0,"rgba(0,0,0,1)");gr.addColorStop(.45,"rgba(0,0,0,1)");gr.addColorStop(1,"rgba(0,0,0,0)");kc.fillStyle=gr;kc.beginPath();kc.arc(s.x,s.y,R,0,7);kc.fill()}
 kc.globalCompositeOperation="source-over";ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(coneC,0,0);ctx.restore();
 units.forEach(u=>{if(!rp2&&u.host&&u.alive&&u.fol&&u.fol.alive){ctx.strokeStyle="rgba(242,193,78,.8)";ctx.lineWidth=.05;ctx.setLineDash([.1,.12]);ctx.beginPath();ctx.moveTo(u.x,u.y);ctx.lineTo(u.fol.x,u.fol.y);ctx.stroke();ctx.setLineDash([])}});
 if(!rp2)players().forEach(u=>{route(u,u.path,"rgba(47,107,255,.6)");if(u.mode=="wait"&&u.aim!=null)arrow(u.x,u.y,u.aim,"rgba(47,107,255,.35)")});
 if(drag&&sel){const c="#2f6bff",cc="rgba(47,107,255,.2)";
  if(drag.t=="walk"||drag.t=="run"){const p=path(sel.x,sel.y,drag.dest[0],drag.dest[1]);if(p){route(sel,p,c);if(drag.aim!=null){cone({x:drag.dest[0],y:drag.dest[1],face:drag.aim,mode:"walk",type:"soldier",smk:null},cc);arrow(drag.dest[0],drag.dest[1],drag.aim,c)}}}
  else if(drag.t=="wait"&&drag.aim!=null){cone({x:sel.x,y:sel.y,face:drag.aim,mode:"wait",type:"soldier",smk:sel.smk},cc);arrow(sel.x,sel.y,drag.aim,c)}
  else if(drag.t=="throw"){ctx.strokeStyle=c;ctx.lineWidth=.05;ctx.beginPath();ctx.arc(sel.x,sel.y,7,0,7);ctx.globalAlpha=.25;ctx.stroke();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(drag.tx,drag.ty,BAL.smokeR,0,7);ctx.stroke()}}
 for(const s of smokes){const a=Math.min(1,s.t/2);[[0,0,1],[.3,.2,.75],[-.3,-.25,.75]].forEach(b=>{const x=s.x+b[0]*s.r,y=s.y+b[1]*s.r,r=s.r*b[2],g=ctx.createRadialGradient(x,y,r*.15,x,y,r);
  g.addColorStop(0,"rgba(255,140,40,"+.5*a+")");g.addColorStop(.55,"rgba(255,140,40,"+.38*a+")");g.addColorStop(1,"rgba(255,140,40,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()})}
 units.forEach(u=>{if(u.team&&u.alive&&!u.vis)return;items.push({y:u.alive?u.y:u.y-.5,f:()=>{ctx.globalAlpha=1;drawChar(u)}})});
 items.sort((a,b)=>a.y-b.y).forEach(i=>i.f());
 if(!rp2){if(CFG.fog){ctx.imageSmoothingEnabled=true;ctx.drawImage(faC,0,0,W,H);ctx.drawImage(fbC,0,0,W,H)}
  units.forEach(e=>{const g=e.ghost;if(g){ctx.strokeStyle="#e5383b";ctx.globalAlpha=.85;ctx.lineWidth=.1;ctx.beginPath();ctx.moveTo(g.x-.22,g.y-.22);ctx.lineTo(g.x+.22,g.y+.22);ctx.moveTo(g.x+.22,g.y-.22);ctx.lineTo(g.x-.22,g.y+.22);ctx.stroke();ctx.lineWidth=.05;ctx.beginPath();ctx.arc(g.x,g.y,.38,0,7);ctx.stroke();ctx.globalAlpha=1}})}
 fx.drawTracers();fx.draw();
 for(const g of gren){const k=g.t/.6,x=g.sx+(g.tx-g.sx)*k,y=g.sy+(g.ty-g.sy)*k-Math.sin(k*Math.PI)*1.2;ctx.fillStyle="#6b7280";ctx.beginPath();ctx.arc(x,y,.15,0,7);ctx.fill()}}
function frame(t){const dt=Math.min(.05,(t-(frame.l||t))/1000);frame.l=t;
 const ts=fx.tick(dt);if(state=="play"&&!paused)update(dt*.5*ts);
 else if(state=="replay"){rp.acc+=dt*.5*ts;while(rp.i<rec.length-1&&rp.acc>=rec[rp.i+1].dt){rp.acc-=rec[rp.i+1].dt;rp.i++}rframe(rec[rp.i]);{let mx=fx.rid;for(const t of tracers)if(t.id>fx.rid){fx.shot(t);mx=Math.max(mx,t.id)}fx.rid=mx}if(rp.i>=rec.length-1&&!rp.done){rp.done=1;$("rx").textContent="✓ REPLAY FINISHED – CLOSE"}}
 if(state!="play"||!paused)fx.upd(dt*ts);if(state!="replay")updVis();draw();
 $("h1").textContent="HOSTILES "+units.filter(u=>u.team&&u.alive).length;$("h2").textContent="SQUAD "+units.filter(u=>!u.team&&u.alive&&!u.obj).length;const ot=objText();$("h3").textContent=ot;$("h3").style.display=ot?"":"none";
 if(sel&&paused){const p=w2s(sel.x,sel.y),m=$("menu");m.style.left=p.x+"px";m.style.top=p.y+"px"}
 requestAnimationFrame(frame)}
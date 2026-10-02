/* ===== FX: synthesized sound, hit-stop, muzzle flash, particles, tracers, replay camera =====
 Tunables live in BAL (vol, hitStop, hitStopT, lastKillT, fxAmt). fx.shot(tracer) is the single entry point: live fire() and replay both call it. */
const fx={tid:0,rid:0,parts:[],rings:[],flashes:[],stop:0,stopS:1,au:null,stuns:[],muted:false,vt:[],tj:{},
 reset(){this.stuns=[];this.tj={};this.parts=[];this.rings=[];this.flashes=[];this.stop=0},
 tick(dt){this.stop-=dt;return this.stop>0?this.stopS:1},
 hold(t,s){if(t>this.stop){this.stop=t;this.stopS=s}},
 unlock(){if(!this.au){try{const C=new(window.AudioContext||window.webkitAudioContext)(),m=C.createGain(),b=C.createBuffer(1,C.sampleRate,C.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;m.connect(C.destination);this.au={C,m,b}}catch(e){}}
  if(this.au&&this.au.C.state=="suspended")this.au.C.resume()},
 vq(x,y){const cx=(innerWidth/2-cam.ox)/cam.s,cy=((innerHeight-150)/2-cam.oy)/cam.s,d=Math.hypot(x-cx,y-cy);return{v:1/(1+d/9),lp:Math.max(1200,9000/(1+d/5))}}, // farther = quieter + duller
 snd(k,x,y){const A=this.au;if(!A||BAL.vol<=0||this.muted)return;const now=A.C.currentTime;this.vt=this.vt.filter(q=>now-q<.25);if(this.vt.length>=14&&k!="kill")return;this.vt.push(now); // voice cap keeps big firefights clean
  const{v,lp}=this.vq(x,y),C=A.C,t=C.currentTime,o=C.createBiquadFilter();o.type="lowpass";o.frequency.value=lp;
  const g0=C.createGain();g0.gain.value=v*BAL.vol;o.connect(g0);g0.connect(A.m);
  const N=(f,type,q,dur,vol,att)=>{const s=C.createBufferSource();s.buffer=A.b;s.loop=true;const bf=C.createBiquadFilter();bf.type=type;bf.frequency.value=f;bf.Q.value=q;const g=C.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||.003));g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(bf);bf.connect(g);g.connect(o);s.start(t,Math.random());s.stop(t+dur+.05)};
  const T=(f0,f1,dur,vol)=>{const s=C.createOscillator();s.frequency.setValueAtTime(f0,t);s.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=C.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(g);g.connect(o);s.start(t);s.stop(t+dur+.02)};
  const p=.88+Math.random()*.24; // per-shot pitch variation
  if(k=="shot"){N(2200*p,"bandpass",.8,.09,.9);N(5000,"highpass",.5,.03,.5);T(150*p,45,.11,.9)}
  else if(k=="eshot"){N(1500*p,"bandpass",.8,.1,.8);N(3500,"highpass",.5,.03,.4);T(115*p,40,.12,.9)}
  else if(k=="hit"){T(1100*p,380,.06,.35);N(3000,"highpass",.5,.04,.4)}
  else if(k=="kill"){T(120*p,32,.28,1);N(700,"lowpass",.7,.2,.6)}
  else if(k=="claw"){N(2500*p,"bandpass",1.2,.1,.8);T(220*p,90,.1,.6)}
  else if(k=="smoke"){N(3200,"bandpass",.4,1,.5,.25);T(90,50,.2,.5)}
  else if(k=="whizz"){T(3200*p,1300,.14,.22)}
  else if(k=="ping"){T(2300*p,1600,.07,.3);N(4500,"highpass",.5,.03,.4)}
  else if(k=="pick"){T(700,1400,.12,.35)}},
 smoke(x,y){this.snd("smoke",x,y)},
 pickup(x,y){this.snd("pick",x,y);this.rings.push({x,y:y-.3,t:.3,m:.3,c:"#35d0e8",r:.9,d:0})},
 clip(x,y,a,L){for(let s=.3;s<L;s+=.15)if(tile(x+Math.cos(a)*s,y+Math.sin(a)*s)==2)return{L:Math.max(.3,s-.1),wall:true};return{L,wall:false}},
 jit(i){const j=this.tj[i];return j?j.dx*j.t/j.m:0},
 spark(x,y,a,col){const ti=Math.floor(y+Math.sin(a)*.2)*W+Math.floor(x+Math.cos(a)*.2);if(T[ti]>0&&T[ti]<3)this.tj[ti]={t:.14,m:.14,dx:(Math.random()<.5?-1:1)*.045}; // wall flinch
  for(let i=0;i<Math.round(6*BAL.fxAmt);i++){const s=a+Math.PI+(Math.random()-.5)*2.2,v=1.5+Math.random()*3;this.parts.push({x,y,z:.45,vx:Math.cos(s)*v,vy:Math.sin(s)*v*.6,vz:1+Math.random()*3,life:.3+Math.random()*.3,col:i%2?col:"#fff3b0",s:.06,d:0})}
  this.rings.push({x,y:y-.45,t:.12,m:.12,c:"#fff3b0",r:.35,d:0})},
 shot(tr,tgt){const a=tr.a,cs=Math.cos(a),sn=Math.sin(a),mx=tr.x1+cs*.5,my=tr.y1+sn*.5-.45,A=BAL.fxAmt;
  if(!tr.melee){this.flashes.push({x:mx,y:my,a,t:.1,m:.1,e:tr.team}); // drawn above fog: gunfire gives away position
   this.snd(tr.team?"eshot":"shot",tr.x1,tr.y1);
   if(tr.show!==false&&this.parts.length<500)this.parts.push({x:tr.x1+cs*.3-sn*.2,y:tr.y1+sn*.3+cs*.2,z:.6,vx:-sn*(1.3+Math.random())+cs*.3,vy:cs*(1.3+Math.random())+sn*.3,vz:2+Math.random()*1.5,life:4,col:"#e0b94a",s:.07,cas:1,d:0})} // shell casing
  else this.snd("claw",tr.tx,tr.ty);
  if(tr.hit){const col=tr.team?["#2f6bff","#9bb8ff","#fff"]:["#e5383b","#ff9a9c","#fff"];
   if(tr.tv!==false){const n=Math.round((tr.kill?16:7)*A);for(let i=0;i<n;i++){const s=a+(Math.random()-.5)*1.6,v=1.5+Math.random()*3;this.parts.push({x:tr.tx,y:tr.ty,z:.5+Math.random()*.3,vx:Math.cos(s)*v,vy:Math.sin(s)*v*.6,vz:1.5+Math.random()*3,life:.7+Math.random()*.5,col:col[i%3],s:.07+Math.random()*.05,d:.04})}
    this.rings.push({x:tr.tx,y:tr.ty-.45,t:.2,m:.2,c:col[1],r:tr.kill?1.1:.7,d:.04});this.snd(tr.kill?"kill":"hit",tr.tx,tr.ty);if(!tr.kill){const d=Math.max(.4,BAL.hitStun+.15);this.stuns.push({u:tgt||null,x:tr.tx,y:tr.ty,t:d,m:d,p:Math.random()*6.3})}} // stun sparkles
   if(tr.kill){this.hold(tr.last?BAL.lastKillT:BAL.hitStopT,tr.last?.12:BAL.hitStop)}}
  else{const len=Math.hypot(tr.x2-tr.x1,tr.y2-tr.y1);
   if(tr.wall){this.spark(tr.x2,tr.y2,a,"#98a1b0");this.snd("ping",tr.x2,tr.y2)}
   else{let hp=null;for(let s=.4;s<len;s+=.15){const px=tr.x1+cs*s,py=tr.y1+sn*s;if(tile(px,py)==1&&Math.hypot(px-tr.tx,py-tr.ty)<=2.5)hp=[px,py]}if(hp){this.spark(hp[0],hp[1],a,"#bfe6ee");this.snd("ping",hp[0],hp[1])}} // near a half wall: spark + chips
   for(const p of players()){if(Math.hypot(p.x-tr.x1,p.y-tr.y1)<.5)continue;const dx=tr.x2-tr.x1,dy=tr.y2-tr.y1,k=Math.max(0,Math.min(1,((p.x-tr.x1)*dx+(p.y-tr.y1)*dy)/(len*len||1))),dd=Math.hypot(p.x-(tr.x1+dx*k),p.y-(tr.y1+dy*k));if(dd<1.2){this.snd("whizz",p.x,p.y);break}}}}, // near-miss whizz
 upd(dt){for(const p of this.parts){if(p.d>0){p.d-=dt;continue}p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=9*dt;if(p.z<0){p.z=0;if(Math.abs(p.vz)>.6&&(p.bnc|0)<3){p.vz*=-.35;p.bnc=(p.bnc|0)+1;p.vx*=.5;p.vy*=.5}else{p.vz=0;p.vx=p.vy=0}}}
  this.parts=this.parts.filter(p=>p.life>0);for(const r of this.rings){if(r.d>0)r.d-=dt;else r.t-=dt}this.rings=this.rings.filter(r=>r.t>0);
  for(const s of this.stuns)s.t-=dt;this.stuns=this.stuns.filter(s=>s.t>0&&!(s.u&&!s.u.alive));for(const f of this.flashes)f.t-=dt;this.flashes=this.flashes.filter(f=>f.t>0);for(const i in this.tj){this.tj[i].t-=dt;if(this.tj[i].t<=0)delete this.tj[i]}const k=Math.exp(-dt*8);for(const u of units)if(u.kbx){u.kbx*=k;u.kby*=k}}, // kbx/kby = hit nudge
 drawTracers(){for(const t of tracers){if((!t.show&&state!="replay")||t.melee)continue;const age=.35-t.t,hd=Math.min(1,age/.07),tl=Math.min(1,Math.max(0,(age-.09)/.12));if(tl>=1)continue;
  const cs=Math.cos(t.a),sn=Math.sin(t.a),sx=t.x1+cs*.5,sy=t.y1+sn*.5-.45,ex=t.x2,ey=t.y2-.45,dx=ex-sx,dy=ey-sy,x0=sx+dx*tl,y0=sy+dy*tl,x1=sx+dx*hd,y1=sy+dy*hd;if(Math.hypot(x1-x0,y1-y0)<.01)continue;
  const rgb=t.team?"229,56,59":"47,107,255",g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.7,`rgba(${rgb},.8)`);g.addColorStop(1,"rgba(255,255,255,1)");
  ctx.lineCap="round";ctx.globalAlpha=1;ctx.strokeStyle=`rgba(${rgb},.22)`;ctx.lineWidth=t.team?.12:.17;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.strokeStyle=g;ctx.lineWidth=t.team?.045:.065;ctx.stroke();ctx.lineCap="butt"}},
 draw(){ctx.globalAlpha=1;
  for(const f of this.flashes){const k=f.t/f.m,col=f.e?"255,170,150":"255,230,150",R=1.5*k+.5,gr=ctx.createRadialGradient(f.x,f.y+.45,0,f.x,f.y+.45,R);gr.addColorStop(0,`rgba(${col},${.4*k})`);gr.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(f.x,f.y+.45,R,0,7);ctx.fill(); // floor bloom
   const L=k>.55?1:.5,cs=Math.cos(f.a),sn=Math.sin(f.a),px=-sn*.13,py=cs*.13;ctx.fillStyle="#fff3b0";ctx.beginPath();ctx.moveTo(f.x+px,f.y+py);ctx.lineTo(f.x+cs*L*.75,f.y+sn*L*.75);ctx.lineTo(f.x-px,f.y-py);ctx.closePath();ctx.fill();
   for(const s of[-.7,.7]){const aa=f.a+s;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(aa)*L*.35,f.y+Math.sin(aa)*L*.35);ctx.lineTo(f.x+cs*L*.15,f.y+sn*L*.15);ctx.fill()}
   ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(f.x,f.y,.07+.06*k,0,7);ctx.fill()}
  for(const r of this.rings){if(r.d>0)continue;const p=1-r.t/r.m,e=1-Math.pow(1-p,3);ctx.strokeStyle=r.c;ctx.globalAlpha=1-p;ctx.lineWidth=.07*(1-p)+.015;ctx.beginPath();ctx.arc(r.x,r.y,.12+r.r*e,0,7);ctx.stroke();if(p<.35){ctx.fillStyle="#fff";ctx.globalAlpha=1-p/.35;ctx.beginPath();ctx.arc(r.x,r.y,.14*(1-p),0,7);ctx.fill()}}
  for(const s of this.stuns){const k=s.t/s.m,X=s.u?s.u.x+(s.u.kbx||0):s.x,Y=(s.u?s.u.y+(s.u.kby||0):s.y)-(s.u&&s.u.crouch?.95:1.2);ctx.globalAlpha=Math.min(1,k*2.5);
   for(let i=0;i<3;i++){const a=s.p+(1-k)*s.m*16+i*2.094,px=X+Math.cos(a)*.3,py=Y+Math.sin(a)*.1,z=.06+.03*Math.sin(a);ctx.fillStyle=i%2?"#fff":"#ffe066";ctx.beginPath();ctx.moveTo(px,py-z*1.6);ctx.lineTo(px+z*.6,py);ctx.lineTo(px,py+z*1.6);ctx.lineTo(px-z*.6,py);ctx.closePath();ctx.fill();ctx.fillRect(px-z*1.6,py-z*.25,z*3.2,z*.5)}} // orbiting sparkles over stunned units
  for(const p of this.parts){if(p.d>0)continue;ctx.globalAlpha=p.cas?Math.min(1,p.life):Math.min(1,p.life*3);ctx.fillStyle=p.col;ctx.fillRect(p.x-p.s/2,p.y-p.z-p.s/2,p.s,p.s)}ctx.globalAlpha=1}};

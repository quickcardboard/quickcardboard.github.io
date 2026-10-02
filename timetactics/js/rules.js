/* ===== RULES: vision, accuracy, combat ===== */
const ang=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),norm=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
const half=u=>.6;
const EM=u=>(ET[u.type]||{}).melee;
const rng=u=>{const q=UT[u.type||"soldier"],r=u.mode=="wait"&&q.waitRange?q.waitRange:u.mode=="run"&&q.runRange?q.runRange:q.range;return u.smk?BAL.blindRange+(r-BAL.blindRange)*(1-Math.min(1,u.smk.t/BAL.smokeFade)):r};
function los(u,t){const d=Math.hypot(t.x-u.x,t.y-u.y),n=Math.ceil(d/.2),ux=Math.floor(u.x),uy=Math.floor(u.y),tx=Math.floor(t.x),ty=Math.floor(t.y);
 for(let i=1;i<n;i++){const px=u.x+(t.x-u.x)*i/n,py=u.y+(t.y-u.y)*i/n,k=tile(px,py);if(k==2)return false;
  if(k==1){const cx=Math.floor(px),cy=Math.floor(py);if(!(cx==ux&&cy==uy)&&!(cx==tx&&cy==ty)&&(u.crouch||(t.crouch&&d>5)))return false} // crouched viewers can't see past half walls; crouched targets hidden behind them beyond 5 tiles
  for(const s of smokes)if(s!==u.smk&&s!==t.smk&&Math.hypot(px-s.x,py-s.y)<s.r*.8)return false}return true}
const smokeHit=(u,x,y)=>smokes.some(s=>s!==u.smk&&Math.hypot(x-s.x,y-s.y)<s.r*.8),stopT=(u,x,y,ns)=>{const k=tile(x,y);return k==2||(u.crouch&&k==1)||(!ns&&smokeHit(u,x,y))};
function halfCover(u,t){const d=Math.hypot(t.x-u.x,t.y-u.y),n=Math.ceil(d/.2);   // half wall between us AND within ~1 tile of the target
 for(let i=1;i<n;i++){const px=u.x+(t.x-u.x)*i/n,py=u.y+(t.y-u.y)*i/n;if(tile(px,py)==1&&Math.hypot(px-t.x,py-t.y)<=1.3&&!(Math.floor(px)==Math.floor(t.x)&&Math.floor(py)==Math.floor(t.y)))return true}return false}
function accuracy(u,t,d){if(EM(u))return 1;const ut=UT[u.type];let a=((u.team?BAL.baseEnemy:u.mode=="wait"?BAL.baseWait:BAL.baseWalk)+(u.crouch?BAL.crouchShooter:0))*ut.acc;
 a*=1-BAL.distFalloff*d/ut.range;
 if(Math.hypot(t.vx,t.vy)>.05){const dx=(t.x-u.x)/d,dy=(t.y-u.y)/d,vr=Math.abs(t.vx*dx+t.vy*dy),vl=Math.abs(t.vx*dy-t.vy*dx);a*=Math.max(BAL.minMove,1-(BAL.moveRadial*vr+BAL.moveLateral*vl)/2)}
 if(t.crouch)a*=BAL.crouchTarget;
 if(!t.crouch&&halfCover(u,t))a*=BAL.halfCover;
 if(t.smk&&t.smk!==u.smk)a*=BAL.smokeOut;
 return Math.max(.03,Math.min(.95,a))}
function canSee(u,t){if(u.team==1&&t.team==0&&t.y>=ZY)return false;const d=Math.hypot(t.x-u.x,t.y-u.y),same=u.smk&&u.smk===t.smk;
 if(d>(same?rng({type:u.type,mode:u.mode,smk:null}):rng(u)))return false;if(Math.abs(norm(ang(u,t)-u.face))>half(u))return false;return los(u,t)}
const inCone=(u,x,y)=>Math.hypot(x-u.x,y-u.y)<rng(u)&&Math.abs(norm(ang(u,{x,y})-u.face))<half(u);
const rank=u=>(u.mode=="wait"?0:2)+(u.crouch?0:1);
function fire(u,t,d){u.cd=(u.team?BAL.cdEnemy:BAL.cdPlayer)+Math.random()*.1;u.flash=EM(u)?0:.15;
 const hit=Math.random()<accuracy(u,t,d),a=ang(u,t)+(hit?0:(Math.random()-.5)*.25),L0=hit?d:d+2,cl=hit?null:fx.clip(u.x,u.y,a,L0),L=cl?cl.L:L0;
 const tr={id:++fx.tid,a,team:u.team,melee:!!EM(u),wall:!!(cl&&cl.wall),tv:!t.team||!!t.vis,x1:u.x,y1:u.y,x2:u.x+Math.cos(a)*L,y2:u.y+Math.sin(a)*L,t:.35,c:u.team?"#e5383b":"#2f6bff",hit,tx:t.x,ty:t.y,show:!EM(u)&&(!u.team||u.vis||!t.team)};tracers.push(tr);
 if(hit){t.hit=.6;t.kbx=Math.cos(a)*BAL.knock;t.kby=Math.sin(a)*BAL.knock;t.cd=Math.max(t.cd,BAL.hitStun);t.hp-=UT[u.type].dmg;if(t.hp<=0){t.alive=false;t.ca=Math.random()*6;t.dth=0;tr.kill=1}}
 if(tr.kill)tr.last=!units.some(q=>q.alive&&q.team==t.team&&!q.obj);fx.shot(tr,t);
 if(t.alive){const fresh=t.alert<=0;t.want=ang(t,u);t.alert=1.5;if(fresh)t.stun=inCone(t,u.x,u.y)?0:BAL.hitReact;if(!t.team&&t.mode!="run")t.aim=t.want;
  if(t.team&&!t.tgt&&t.state!="engage"&&t.state!="evade"){t.state="search";t.lost=0;t.last=[u.x,u.y];t.path=path(t.x,t.y,u.x,u.y,1)||[]}}}
function hostAI(u,dt){u.aim=null;u.repath-=dt;const f=u.fol;if(!f||!f.alive){u.fol=null;u.path=[];return}if(Math.hypot(f.x-u.x,f.y-u.y)<1){u.path=[];return}if(u.repath<=0||!u.path.length){u.path=path(u.x,u.y,f.x,f.y)||[];u.repath=.4}}
function objState(){const ob=LV?LV.objective:"eliminate",e=units.some(u=>u.team&&u.alive);if(!players().length)return -1;
 if(ob=="protect"){const c=units.find(u=>u.type=="core");if(!c||!c.alive)return -1;return objT>=(LV.secs||30)||(LV.enemies.length&&!e)?1:0}
 if(ob=="hostage"){const hs=units.filter(u=>u.host);if(hs.some(h=>!h.alive))return -1;return LV.exit&&hs.length&&hs.every(h=>Math.hypot(h.x-LV.exit.x,h.y-LV.exit.y)<1.2)?1:0}
 if(ob=="reach")return LV.exit&&players().some(q=>Math.hypot(q.x-LV.exit.x,q.y-LV.exit.y)<1)?1:0;
 if(ob=="collect")return loot.filter(i=>i.got).length>=(LV.n||loot.length)?1:0;
 return e?0:1}
function objText(){if(state=="menu"||state=="replay")return"";const ob=LV?LV.objective:"eliminate";if(ob=="collect")return"ITEMS "+loot.filter(i=>i.got).length+"/"+(LV.n||loot.length);if(ob=="protect")return"HOLD "+Math.max(0,Math.ceil((LV.secs||30)-objT))+"s";
 if(ob=="hostage"){const hs=units.filter(u=>u.host);return"RESCUE "+hs.filter(h=>h.alive&&LV.exit&&Math.hypot(h.x-LV.exit.x,h.y-LV.exit.y)<1.2).length+"/"+hs.length}return ob=="reach"?"REACH EXIT":""}
function evadeSpot(u,att){let best=null,bs=1e9;   // pick the reachable spot seen by the fewest shooters (hidden > crouch-in-cover), nearest first
 for(let a=0;a<6.28;a+=.52)for(const r of[1.5,3,4.5]){const x=u.x+Math.cos(a)*r,y=u.y+Math.sin(a)*r;if(y>=ZY||!wk(x,y)||!seg(u.x,u.y,x,y))continue;
  const v=att.filter(p=>Math.hypot(p.x-x,p.y-y)<9&&los(p,{x,y,crouch:true,smk:null})).length,sc=v*10+r;if(sc<bs){bs=sc;best=[x,y,v]}}return best}
function ai(u,dt){u.repath-=dt;let tg=null,bd=99;for(const p of foes())if(canSee(u,p)){const d=Math.hypot(p.x-u.x,p.y-u.y);if(d<bd){bd=d;tg=p}}   // nearest visible target
 u.tgt=tg;
 const att=players().filter(p=>p.mode!="run"&&canSee(p,u));   // players currently able to shoot me
 if(att.length>=2&&!EM(u))u.hold=2.5;                                  // 2+ shooters: evade; 1 shooter: stay aggressive
 if(u.hold>0){u.hold-=dt;u.state="evade";if(att.length&&u.repath<=0){const b=evadeSpot(u,att);u.repath=.6;if(b){u.path=[[b[0],b[1]]];u.crouch=b[2]>0}else{u.path=[];u.crouch=true}}return}
 if(u.crouch)u.crouch=false;
 if(tg){u.state="engage";u.last=[tg.x,tg.y];u.lost=0;u.alert=0;if(bd>(EM(u)?.6:5)){if(u.repath<=0||!u.path.length){u.path=path(u.x,u.y,tg.x,tg.y,1)||[];u.repath=.5}}else u.path=[];return}
 if(u.state=="engage"){u.state="search";u.lost=0;u.path=u.last?path(u.x,u.y,u.last[0],u.last[1],1)||[]:[]}
 if(u.state=="search"){if(!u.path.length){u.lost+=dt;if(u.lost>3){u.state="patrol";let bi=0,bb=1e9;u.route.forEach((p,i)=>{const d=Math.hypot(p[0]-u.x,p[1]-u.y);if(d<bb){bb=d;bi=i}});u.ri=bi+1;u.path=path(u.x,u.y,u.route[bi][0],u.route[bi][1],1)||[]}}return}
 if(!u.path.length){if(u.route.length<2)return;u.path=[u.route[u.ri%u.route.length]];u.ri++}}
function update(dt){
 for(const u of units){if(!u.alive){u.dth=(u.dth||0)+dt;continue}u.cd-=dt;u.rt-=dt;if(u.mode=="run")u.hasT=0;u.alert-=dt;u.flash-=dt;u.hit-=dt;u.vx=u.vy=0;
  u.smk=smokes.filter(s=>Math.hypot(u.x-s.x,u.y-s.y)<s.r).sort((a,b)=>b.t-a.t)[0]||null;
  if(u.team)ai(u,dt);else if(u.host)hostAI(u,dt);
  if(u.path.length){const p=u.path[0],dx=p[0]-u.x,dy=p[1]-u.y,d=Math.hypot(dx,dy);
   const sp=(u.team?(u.state=="engage"?ET[u.type].engSpd:ET[u.type].spd):u.mode=="run"?4:u.crouch?1:2)*UT[u.type].spd,st=sp*dt;u.mv=Math.atan2(dy,dx);u.ph+=st*5;u.vx=dx/d*sp;u.vy=dy/d*sp;
   if(d<=st){u.x=p[0];u.y=p[1];u.path.shift();if(!u.team&&!u.path.length){const rn=u.mode=="run";u.mode="wait";if(rn||u.aim==null)u.aim=u.mv} /* auto overwatch: walk->aim dir, run->move dir */}else{u.x+=dx/d*st;u.y+=dy/d*st}}
  if(u.alert>0&&u.want!=null){u.stun-=dt;if(u.stun<=0){const df=norm(u.want-u.face),s=BAL.turnRate*dt;u.face+=Math.abs(df)<s?df:Math.sign(df)*s}}else if(u.alert<=0){const want=u.team?(u.tgt?ang(u,u.tgt):u.mv):u.mode=="run"?u.mv:(u.aim!=null?u.aim:u.mv),df=norm(want-u.face),s=9*dt;u.face+=Math.abs(df)<s?df:Math.sign(df)*s}}
 // shooting: units are processed in priority order (overwatch-crouch > overwatch > walk-crouch > walk); a kill lands instantly so a dead unit never fires later in the same tick
 units.filter(u=>u.alive&&!u.obj&&u.mode!="run"&&!(u.y>=ZY&&!u.team)).sort((a,b)=>rank(a)-rank(b)).forEach(u=>{if(!u.alive)return;let b=null,bd=99;
  for(const t of units)if(t.alive&&t.team!=u.team&&canSee(u,t)){const d=Math.hypot(t.x-u.x,t.y-u.y);if(d<bd){bd=d;b=t}}
  if(!b||(EM(u)&&bd>ET[u.type].reach)){u.hasT=0;return}if(!u.hasT){u.hasT=1;u.rt=EM(u)?0:(rank(u)+1)*BAL.reactStep}   // reaction time: better-priority stances react faster
  if(u.cd<=0&&u.rt<=0)fire(u,b,bd)});
 for(const g of gren){g.t+=dt;if(g.t>=.6){g.done=1;fx.smoke(g.tx,g.ty);smokes.push({x:g.tx,y:g.ty,r:.2,gr:.2,t:BAL.smokeTime})}}gren=gren.filter(g=>!g.done);
 for(const s of smokes){s.t-=dt;s.gr=Math.min(BAL.smokeR,s.gr+dt*5);s.r=Math.min(s.gr,BAL.smokeR*Math.min(1,s.t/BAL.smokeFade))}smokes=smokes.filter(s=>s.t>0);
 for(const t of tracers)t.t-=dt;tracers=tracers.filter(t=>t.t>0);
 rec.push(snapRec(dt));
 const e=units.filter(u=>u.team&&u.alive).length,p=players().length;objT+=dt;for(const i of loot)if(!i.got&&players().some(q=>Math.hypot(q.x-i.x,q.y-i.y)<.8)){i.got=1;fx.pickup(i.x,i.y)}
 if(endT==null){const st=objState();if(st){endT=1.5;endR=st}} // delay before result screen (sim seconds)
 if(endT!=null){endT-=dt;if(endT<=0)end(endR>0?"won":"lost")}}
const snapRec=dt=>({dt,u:units.map(u=>[u.x,u.y,u.face,u.alive,u.hp,u.crouch,u.mode,u.path.length,u.ph,u.flash,u.hit,u.team,u.ca,u.state,u.mhp,u.type,u.obj]),s:smokes.map(s=>({...s})),t:tracers.map(t=>({...t})),g:gren.map(g=>({...g}))});
function rframe(f){units=f.u.map(a=>({x:a[0],y:a[1],face:a[2],alive:a[3],hp:a[4],crouch:a[5],mode:a[6],path:a[7]?[0]:[],ph:a[8],flash:a[9],hit:a[10],team:a[11],ca:a[12],state:a[13],mhp:a[14],smk:null,vis:true,ghost:null,mv:0,type:a[15],obj:a[16]}));smokes=f.s;tracers=f.t;gren=f.g}

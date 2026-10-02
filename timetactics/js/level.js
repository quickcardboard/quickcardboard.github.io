/* ===== LEVEL ===== */
let W=16,H=24,ZY=20,T=[],reach,floorC,exC,vxC,faC,fbC,ex,vx,fa,fb;const FS=12,PX=24,EXT={1:8,2:15,3:15,4:15};
const rnd=n=>Math.floor(Math.random()*n),$=id=>document.getElementById(id);
const tile=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y);if(ix<0||iy<0||ix>=W||iy>=H)return 2;const k=T[iy*W+ix];if(k<3)return k;return k==3?(Math.abs(y-iy-.5)<.125?2:0):(Math.abs(x-ix-.5)<.125?2:0)}; // 3=quarter wall horizontal, 4=vertical
const cvs=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
function wallTile(top,face,edge,ext){const c=cvs(PX,PX+ext),g=c.getContext("2d"),h=PX+ext;g.fillStyle=top;g.fillRect(0,0,PX,PX);g.fillStyle="#ffffff88";g.fillRect(2,2,PX-4,1);g.fillStyle=face;g.fillRect(0,PX,PX,ext);
 g.fillStyle="#0002";for(let y=PX+4;y<h-1;y+=5)g.fillRect(1,y,PX-2,1);g.fillRect(PX/2,PX+1,1,ext-1);g.fillStyle="#0000000d";for(let i=0;i<6;i++)g.fillRect(3+i*4,5+(i*7)%13,2,2);
 g.fillStyle=edge;g.fillRect(0,0,PX,1);g.fillRect(0,0,1,h);g.fillRect(PX-1,0,1,h);g.fillRect(0,h-1,PX,1);g.fillRect(0,PX-1,PX,1);return c}
const TS={1:wallTile("#bfe6ee","#6fa5b3","#3f6f7c",8),2:wallTile("#f4f6fa","#98a1b0","#4b5468",15)};
function thinTile(v){const e=15,c=cvs(PX,PX+e),g=c.getContext("2d"),x0=v?9:0,y0=v?0:9,w=v?6:PX,h=v?PX:6;g.fillStyle="#f4f6fa";g.fillRect(x0,y0,w,h);g.fillStyle="#98a1b0";g.fillRect(x0,y0+h,w,e);g.fillStyle="#4b5468";g.fillRect(x0,y0,w,1);g.fillRect(x0,y0,1,h+e);g.fillRect(x0+w-1,y0,1,h+e);g.fillRect(x0,y0+h+e-1,w,1);g.fillRect(x0,y0+h-1,w,1);return c}
TS[3]=thinTile(0);TS[4]=thinTile(1);
function genLevel(w,h,dn){W=w;H=h;ZY=H-4;T=new Array(W*H).fill(0);const mid=W>>1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x==0||y==0||x==W-1||y==H-1||(y==ZY-1&&Math.abs(x-mid)>1))T[y*W+x]=2;
 for(let i=0,n=Math.floor(W*(ZY-4)*dn);i<n;i++){const ty=Math.random()<.55?2:1,bw=1+rnd(3),bh=1+rnd(2),x0=1+rnd(W-2),y0=1+rnd(Math.max(1,ZY-4));
  for(let yy=0;yy<bh;yy++)for(let xx=0;xx<bw;xx++){const X=x0+xx,Y=y0+yy;if(X<W-1&&Y>=1&&Y<=ZY-4)T[Y*W+X]=ty}}
 reach=new Uint8Array(W*H);const q=[(ZY-2)*W+mid];reach[q[0]]=1;
 for(let i=0;i<q.length;i++){const c=q[i],cx=c%W,cy=(c/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<1||ny<1||nx>=W-1||ny>ZY-2)continue;const n=ny*W+nx;if(T[n]||reach[n])continue;reach[n]=1;q.push(n)}}
 for(let y=1;y<=ZY-2;y++)for(let x=1;x<W-1;x++)if(!T[y*W+x]&&!reach[y*W+x])T[y*W+x]=2;
 buildLevel()}
function buildLevel(){exC=cvs(W*FS,H*FS);vxC=cvs(W*FS,H*FS);faC=cvs(W*FS,H*FS);fbC=cvs(W*FS,H*FS);ex=exC.getContext("2d");vx=vxC.getContext("2d");fa=faC.getContext("2d");fb=fbC.getContext("2d");
 floorC=cvs(W*PX,H*PX);const f=floorC.getContext("2d");f.fillStyle="#f6f7fa";f.fillRect(0,0,W*PX,H*PX);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){f.fillStyle="#e4e8ee";f.fillRect(x*PX,y*PX,PX,1);f.fillRect(x*PX,y*PX,1,PX);if((x*7+y*13)%5==0){f.fillStyle="#edf0f5";f.fillRect(x*PX+8,y*PX+9,2,2);f.fillRect(x*PX+15,y*PX+4,1,1)}}
 const sc=cvs(W*PX,H*PX),s2=sc.getContext("2d");s2.fillStyle="#5a6478";for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=T[y*W+x];if(k)s2.fillRect(x*PX,y*PX,PX+(EXT[k]*.7|0),PX+(EXT[k]*.6|0))}f.globalAlpha=.3;f.drawImage(sc,0,0);f.globalAlpha=1;
 if(ZY<H-1){f.fillStyle="rgba(47,107,255,.1)";f.fillRect(PX,ZY*PX,(W-2)*PX,(H-1-ZY)*PX);f.fillStyle="rgba(47,107,255,.35)";for(let x=1;x<W-1;x+=2)f.fillRect(x*PX,ZY*PX,PX,3)}}
const D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const wk=(x,y)=>tile(x-.28,y-.28)==0&&tile(x+.28,y-.28)==0&&tile(x-.28,y+.28)==0&&tile(x+.28,y+.28)==0;
const seg=(a,b,c,d)=>{const n=Math.ceil(Math.hypot(c-a,d-b)/.12);for(let i=1;i<=n;i++)if(!wk(a+(c-a)*i/n,b+(d-b)*i/n))return false;return true};
function snap(x,y){if(wk(x,y))return[x,y];let best=null,bd=9;for(let dx=-.8;dx<=.8;dx+=.08)for(let dy=-.8;dy<=.8;dy+=.08)if(wk(x+dx,y+dy)){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=[x+dx,y+dy]}}return best||[x,y]}
function path(sx,sy,gx,gy,en){if(!wk(gx,gy)||(en&&gy>=ZY))return null;const s0=Math.floor(sy)*W+Math.floor(sx),goal=Math.floor(gy)*W+Math.floor(gx);
 const pv=new Int16Array(W*H).fill(-2),q=[s0];pv[s0]=-1;
 for(let i=0;i<q.length;i++){const c=q[i];if(c==goal)break;const cx=c%W,cy=c/W|0;
  for(const[dx,dy]of D){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(pv[n]!=-2||T[n]||(en&&ny>=ZY))continue;if(dx&&dy&&(T[cy*W+nx]||T[ny*W+cx]))continue;pv[n]=c;q.push(n)}}
 if(pv[goal]==-2)return null;const p=[];for(let c=goal;c!=-1;c=pv[c])p.unshift([c%W+.5,(c/W|0)+.5]);p.shift();p.push([gx,gy]);
 const o=[];let cx=sx,cy=sy,i=0;while(i<p.length){let j=p.length-1;while(j>i&&!seg(cx,cy,p[j][0],p[j][1]))j--;o.push(p[j]);cx=p[j][0];cy=p[j][1];i=j+1}return o}
const mk=(team,x,y,hp)=>({team,type:"soldier",x,y,hp,mhp:hp,pc:null,mode:"wait",crouch:false,path:[],aim:null,face:-Math.PI/2,cd:Math.random()*.4,alert:0,gren:2,mv:-Math.PI/2,vx:0,vy:0,route:null,ri:0,alive:true,smk:null,ph:0,flash:0,hit:0,state:"patrol",lost:0,repath:0,tgt:null,last:null,ghost:null,vis:false,ca:0,hold:0,hasT:0,rt:0,stun:0,want:null});

function spawnObj(){if(LV.objective=="protect"&&LV.target){const c=mk(0,LV.target.x,LV.target.y,LV.target.hp||10);c.obj=1;c.type="core";units.push(c)}
 if(LV.objective=="hostage")(LV.hostages||[]).forEach(h=>{const c=mk(0,h.x,h.y,h.hp||2);c.obj=1;c.host=1;c.type="civ";units.push(c)})}
/* ===== CUSTOM LEVELS (files made by tools/leveldesigner.html) ===== */
let LV=null; // active custom level, null = random level
function loadLevel(L){LV=L;W=L.w;H=L.h;ZY=L.zy==null?H:L.zy;T=Array.from(L.tiles);reach=new Uint8Array(W*H).fill(1);buildLevel()}
function spawnEn(d){const E=ET[d.type]||ET.rifle,e=mk(1,d.x,d.y,E.hp);e.type=ET[d.type]?d.type:"rifle";e.mode="walk";e.face=e.mv=d.face||0;
 const P=[[d.x,d.y]].concat((d.path||[]).map(p=>[p[0],p[1]])),r=[];
 if(P.length>1){if(d.loop=="pingpong")for(let i=P.length-2;i>0;i--)P.push(P[i]);P.push(P[0]);
  for(let i=0;i<P.length-1;i++){const q=path(P[i][0],P[i][1],P[i+1][0],P[i+1][1],1);r.push(...(q||[P[i+1]]))}}
 e.route=r.length?r:[[d.x,d.y]];units.push(e)} // 1-point route = stationary guard

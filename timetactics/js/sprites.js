/* ===== SPRITES (32px pixel art, generated in code) ===== */
const SP={},SZ=32;
function spr(team,pose,fr,dir,white,typ){const key=team+pose+fr+dir+(white?"w":"")+(typ||"");if(SP[key])return SP[key];
 const cv=cvs(SZ,SZ),c=cv.getContext("2d"),mon=typ=="melee",civ=typ=="civ",P=civ?{b:"#f2c14e",d:"#b8862a",h:"#7a5a1a"}:mon?{b:"#ff6a3d",d:"#b0280f",h:"#5c1208"}:team?{b:"#e5383b",d:"#9b1f23",h:"#7a1518"}:{b:"#2f6bff",d:"#1e47b8",h:"#16338a"},KK="#2b3040",SK="#f1f3f7";
 const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const a=dir*Math.PI/4,cx=Math.cos(a),cy=Math.sin(a),front=cy>.3,back=cy<-.3,side=Math.abs(cx)>.3;
 if(pose.startsWith("dead")){const v=+pose[4]||0,X=(x,w)=>cx<0?SZ-x-w:x;
 if(v==0){R(X(6,16),21,16,6,P.d);R(X(6,16),21,16,2,P.b);R(X(22,6),20,6,6,P.h);R(X(24,3),22,3,3,SK);R(X(2,5),22,5,3,KK);R(X(12,12),27,12,2,KK)}
 else if(v==1){R(X(4,20),23,20,5,P.d);R(X(4,20),23,20,2,P.b);R(X(23,5),22,5,5,P.h);R(X(0,6),26,6,2,KK);R(X(8,3),19,3,5,P.h);R(X(14,3),27,3,3,P.h)} // face down, arms out
 else if(v==2){R(X(7,15),22,15,5,P.b);R(X(7,15),26,15,2,P.d);R(X(22,6),21,6,6,P.h);R(X(23,4),22,3,3,SK);R(X(2,6),24,6,2,P.h);R(X(4,5),19,5,2,P.h);R(X(11,10),19,10,2,KK)} // on back
 else{R(10,17,10,9,P.b);R(10,17,10,2,P.d);R(9,25,13,3,P.h);R(12,11,7,6,P.h);R(13,13,4,2,SK);R(19,20,8,2,KK)}} // slumped sitting
 else{const cr=pose[0]=="c",mv=/walk|run/.test(pose),run=pose=="run",bob=mv&&fr%2?-1:0,st=[0,1,0,-1][fr],sw=st*(run?3:2),lh=cr?4:8,fy=28,ty=fy-lh-9+bob+(cr?1:0);
  for(const q of[-1,1]){const dx=mv&&side&&!front&&!back?q*sw:0,lift=mv&&!dx&&q*st>0?2:0;R(16+q*2-1+dx,fy-lh-lift,3,lh,P.h);R(16+q*2-1+dx,fy-1-lift,3,1,KK)}
  const sx=16+(side?(cx>0?2:-2):0),sy=ty+3,L=run?7:10;
  const gun=()=>{if(mon||civ)return;for(let i=0;i<=L;i++)R(sx+cx*i,sy+cy*i*.6+(run?i*.3:0),2,2,KK);R(sx-1,sy-1,3,3,P.d)};
  if(back)gun();R(12,ty,8,9,P.b);R(12,ty+6,8,3,P.d);if(front)R(14,ty+2,4,2,P.d);if(back)R(13,ty+1,6,6,P.d);
  const hy=ty-6;R(13,hy,6,6,P.h);if(mon){R(12,hy-2,2,3,P.d);R(18,hy-2,2,3,P.d);R(11,ty+2,2,6,P.d);R(19,ty+2,2,6,P.d)}if(!back)R(front?14:(cx>0?16:13),hy+2,front&&!side?4:3,3,SK);if(!back)gun()}
 const id=c.getImageData(0,0,SZ,SZ),d=id.data,o=new Uint8ClampedArray(d);
 for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const i=(y*SZ+x)*4;if(d[i+3])continue;if((x>0&&d[i-1])||(x<SZ-1&&d[i+7])||(y>0&&d[i-SZ*4+3])||(y<SZ-1&&d[i+SZ*4+3])){o[i]=20;o[i+1]=24;o[i+2]=40;o[i+3]=255}}
 c.putImageData(new ImageData(o,SZ,SZ),0,0);if(white){c.globalCompositeOperation="source-atop";c.globalAlpha=.85;c.fillStyle="#fff";c.fillRect(0,0,SZ,SZ)}
 return SP[key]=cv}
const SS=SZ/PX;
function drawChar(u){ctx.imageSmoothingEnabled=false;
 if(!u.alive&&u.type=="core"){ctx.fillStyle="#46d9b055";ctx.fillRect(u.x-.3,u.y-.1,.6,.12);return}
 if(!u.alive){const k=u.dth==null?1:Math.min(1,u.dth/.4),dr=Math.cos(u.ca*7)<0?4:0;ctx.globalAlpha=k<1?k*k:1;ctx.drawImage(spr(u.team,"dead"+(Math.floor(u.ca)%4),0,dr,0,u.type),u.x-SS/2,u.y-.95,SS,SS);ctx.globalAlpha=1;
  if(k<1){const e=1-(1-k)*(1-k);ctx.save();ctx.translate(u.x+(u.kbx||0),u.y+(u.kby||0));ctx.rotate(e*1.4*(dr?-1:1));ctx.globalAlpha=1-k*.6;ctx.drawImage(spr(u.team,"idle",0,((Math.round(u.face/(Math.PI/4))%8)+8)%8,0,u.type),-SS/2,.05-28/PX,SS,SS);ctx.restore();ctx.globalAlpha=1} // fall animation before the corpse pose
  return}
 const mv=u.path.length>0,run=u.mode=="run"&&mv,pose=run?"run":(u.crouch?"c":"")+(mv?"walk":"idle"),fr=mv?Math.floor(u.ph*.8)%4:0,dir=((Math.round(u.face/(Math.PI/4))%8)+8)%8,rc=u.flash>0?.04:0,fl=u.hit>0&&Math.floor(u.hit*16)%2;
 ctx.fillStyle="#0002";ctx.beginPath();ctx.ellipse(u.x+.08,u.y+.05,.32,.2,0,0,7);ctx.fill();
 if(u.type=="core")drawCore(u,fl);else{const kx=u.kbx||0,ky=u.kby||0;ctx.save();ctx.translate(u.x+kx,u.y+ky);ctx.rotate(kx*.9);ctx.drawImage(spr(u.team,pose,fr,dir,fl,u.type),-SS/2-Math.cos(u.face)*rc,.05-28/PX-Math.sin(u.face)*rc,SS,SS);ctx.restore()} // hit stagger: nudge + lean

 if(u==sel){ctx.strokeStyle="#2f6bff";ctx.lineWidth=.06;ctx.setLineDash([.15,.1]);ctx.beginPath();ctx.arc(u.x,u.y,Math.min(.6,22/cam.s),0,7);ctx.stroke();ctx.setLineDash([])}
 const top=u.y-(u.crouch?.95:1.25),mh=Math.min(u.mhp||3,10);
 for(let i=0;i<mh;i++){ctx.fillStyle=i<u.hp?(u.team?"#e5383b":"#2f6bff"):"#c5cbd4";ctx.fillRect(u.x-mh*.1+i*.2,top,.16,.1)}
 if(u.team&&u.state=="engage"){ctx.fillStyle="#e5383b";ctx.font="bold .5px sans-serif";ctx.textAlign="center";ctx.fillText("!",u.x,top-.08)}}

function drawCore(u,fl){const p=.5+.5*Math.sin(Date.now()/300),c=u.y-.55,X=u.x;ctx.strokeStyle="rgba(70,217,176,"+(.25+.25*p)+")";ctx.lineWidth=.06;ctx.beginPath();ctx.arc(X,u.y,.55+.1*p,0,7);ctx.stroke();
 ctx.fillStyle=fl?"#fff":"#46d9b0";ctx.beginPath();ctx.moveTo(X,c-.5);ctx.lineTo(X+.3,c);ctx.lineTo(X,c+.45);ctx.lineTo(X-.3,c);ctx.closePath();ctx.fill();
 ctx.fillStyle=fl?"#fff":"#2a9d6f";ctx.beginPath();ctx.moveTo(X,c-.5);ctx.lineTo(X+.3,c);ctx.lineTo(X,c+.45);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#16584a";ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(X,c-.5);ctx.lineTo(X+.3,c);ctx.lineTo(X,c+.45);ctx.lineTo(X-.3,c);ctx.closePath();ctx.stroke()}

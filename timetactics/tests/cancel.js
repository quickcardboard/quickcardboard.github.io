const vm=require('vm'),fs=require('fs');
const proxy=()=>new Proxy(function(){},{get:(t,k)=>k==='getImageData'?(()=>({data:new Uint8ClampedArray(32*32*4)})):k==='createRadialGradient'?(()=>({addColorStop(){}})):k==='canvas'?{}:proxy(),set:()=>true,apply:()=>proxy()});
const els={};const au=new Proxy({sampleRate:44100,currentTime:0,state:'running',createBuffer:()=>({getChannelData:()=>new Float32Array(44100)})},{get:(t,k)=>k in t?t[k]:()=>proxy()});const el=()=>({style:{},children:[],value:"5",checked:false,textContent:"",innerHTML:"",getContext:()=>proxy(),setPointerCapture(){},classList:{toggle(){},add(){},remove(){}},getBoundingClientRect:()=>({left:50,right:350,top:700,bottom:780}),addEventListener(){},appendChild(){},value:"16x16"});
const doc={getElementById:id=>els[id]||(els[id]=Object.assign(el(),{value:id.startsWith('t_')?'':id=="c_size"?"16x16":id=="c_den"?".05":"5"})),createElement:()=>el()};
const ctx=vm.createContext({document:doc,innerWidth:390,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},ImageData:function(d,w,h){this.data=d},Math,console,location:{search:""},window:{AudioContext:function(){return au}},Date,localStorage:{getItem:()=>null},setTimeout,clearTimeout,Uint8Array,Int16Array,Uint8ClampedArray,Array,JSON,Set});
const order="balance enemies level state input rules flow sprites render fx main".split(" ");
for(const n of order){try{vm.runInContext(fs.readFileSync('../js/'+n+'.js','utf8'),ctx,{filename:n+'.js'})}catch(e){console.log("LOAD FAIL",n,e.stack.split("\n").slice(0,3).join("|"));process.exit(1)}}
const run=s=>vm.runInContext(s,ctx);

const T=`(function(){const out=[];deploy();setPause(true);const u=players()[0];
const ev=(x,y)=>({pointerId:1,clientX:x,clientY:y,preventDefault(){}});
function order(cmdName,endX,endY){sel=u;cmd=cmdName;menu();const g0=u.gren;const p=w2s(u.x+2,u.y-3);cv.onpointerdown(ev(p[0],p[1]));cv.onpointermove(ev(p[0]+10,p[1]+10));cv.onpointermove(ev(endX,endY));const hot=drag&&drag.cx;cv.onpointerup(ev(endX,endY));return {hot,gren:g0-u.gren,cmd,stillDrag:!!drag}}
const a=order("throw",200,740);out.push("throw released over CANCEL: hot="+a.hot+" thrown="+a.gren+" cmd="+cmd);
const b=order("throw",200,300);out.push("throw released elsewhere: thrown="+b.gren);
const hostile=players().length;const c=order("walk",200,740);out.push("walk cancel: path="+u.path.length);
out.push("run rng="+rng({type:"soldier",mode:"run"})+" half="+half({mode:"run"})+" wait rng="+rng({type:"soldier",mode:"wait"})+" walk rng="+rng({type:"soldier",mode:"walk"}));
// stun/knockback
const e=units.find(q=>q.team);for(let i=0;i<60&&!(u.kbx);i++){e.cd=0;u.cd=0;fire(e,u,3)}out.push("after hit (if hit) cd="+u.cd.toFixed(2)+" kb="+(u.kbx||0).toFixed(2)+" hp="+u.hp);
// replay after loss
players().forEach(q=>q.alive=false);setPause(false);update(.025);for(let i=0;i<80;i++)update(.025);out.push("state "+state+" replayBtnDisplay="+$("or").style.display);
return out.join(" || ")})()`;
try{console.log(run(T))}catch(e){console.log("RUNTIME FAIL",e.stack.split("\n").slice(0,6).join("\n"))}

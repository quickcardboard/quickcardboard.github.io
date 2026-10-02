const vm=require('vm'),fs=require('fs');
const proxy=()=>new Proxy(function(){},{get:(t,k)=>k==='getImageData'?(()=>({data:new Uint8ClampedArray(32*32*4)})):k==='createRadialGradient'?(()=>({addColorStop(){}})):k==='canvas'?{}:proxy(),set:()=>true,apply:()=>proxy()});
const els={};const au=new Proxy({sampleRate:44100,currentTime:0,state:'running',createBuffer:()=>({getChannelData:()=>new Float32Array(44100)})},{get:(t,k)=>k in t?t[k]:()=>proxy()});const el=()=>({style:{},children:[],value:"5",checked:false,textContent:"",innerHTML:"",getContext:()=>proxy(),setPointerCapture(){},addEventListener(){},appendChild(){},value:"16x16"});
const doc={getElementById:id=>els[id]||(els[id]=Object.assign(el(),{value:id.startsWith('t_')?'':id=="c_size"?"16x16":id=="c_den"?".05":"5"})),createElement:()=>el()};
const ctx=vm.createContext({document:doc,innerWidth:390,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},ImageData:function(d,w,h){this.data=d},Math,console,location:{search:""},window:{AudioContext:function(){return au}},Date,localStorage:{getItem:()=>null},setTimeout,clearTimeout,Uint8Array,Int16Array,Uint8ClampedArray,Array,JSON,Set});
const order="balance enemies level state input rules flow sprites render fx main".split(" ");
for(const n of order){try{vm.runInContext(fs.readFileSync('../js/'+n+'.js','utf8'),ctx,{filename:n+'.js'})}catch(e){console.log("LOAD FAIL",n,e.stack.split("\n").slice(0,3).join("|"));process.exit(1)}}
const run=s=>vm.runInContext(s,ctx);

const lv=n=>JSON.parse(fs.readFileSync('../levels/'+n+'.json','utf8'));
globalThis.LVS={};for(const n of ['sample_collect','sample_protect','sample_hostage','sample_warehouse'])LVS[n]=lv(n);
ctx.LVS=LVS;
const T=`(function(){const out=[];
function go(n,setup,steps){CUST=LVS[n];$("c_lv").checked=true;deploy();setup&&setup();let bad=0,i=0;for(;i<steps&&state=="play";i++){update(.025);updVis();draw();for(const u of units)if(isNaN(u.x)||isNaN(u.y))bad++}
 return n+": state="+state+" steps="+i+" NaN="+bad+" parts="+fx.parts.length+" objT="+objT.toFixed(1)+" text="+objText()}
// collect: walk soldiers onto 2 items
out.push(go('sample_collect',()=>{const p=players();p[0].x=LV.items[0].x;p[0].y=LV.items[0].y;p[1].x=LV.items[1].x;p[1].y=LV.items[1].y},400));
out.push("collected "+loot.filter(i=>i.got).length);
// protect: soldiers wait; see timer / core
out.push(go('sample_protect',()=>{players().forEach(p=>{p.mode="wait";p.aim=-1.57})},6000));
out.push("core alive "+units.find(u=>u.type=="core").alive+" hp "+units.find(u=>u.type=="core").hp);
// hostage: kill enemies, follow, lead to exit
out.push(go('sample_hostage',()=>{units.filter(u=>u.team).forEach(u=>{u.alive=false});const h=units.find(u=>u.host),p=players()[0];h.fol=p;h.x=p.x-2;h.y=p.y-2;
  p.path=path(p.x,p.y,3.5,4)||[];p.mode="walk"},60));
const h=units.find(u=>u.host);out.push("hostage follows? dist to p0 "+Math.hypot(h.x-players()[0].x,h.y-players()[0].y).toFixed(1)+" path "+h.path.length);
CUST=LVS.sample_hostage;deploy();units.filter(u=>u.team).forEach(u=>u.alive=false);const hh=units.find(u=>u.host),pp=players()[0];hh.fol=pp;pp.mode="walk";pp.path=path(pp.x,pp.y,3.5,4)||[];
for(let i=0;i<1500;i++){update(.025);if(pp.path.length==0&&!pp.go){pp.go=1;hh.x=pp.x;hh.y=pp.y;pp.path=path(pp.x,pp.y,8.5,13.8)||[]}if(state!="play")break}
out.push("hostage lead result "+state+" "+objText());
// fx smoke test with live enemies for the warehouse
out.push(go('sample_warehouse',()=>{players().forEach((p,i)=>{p.y=11.2;p.mode="wait";p.aim=-1.57})},3000)+" stop="+fx.stop.toFixed(2));
return out.join(" || ")})()`;
try{console.log(run(T))}catch(e){console.log("RUNTIME FAIL",e.stack.split("\n").slice(0,6).join("\n"))}

const vm=require('vm'),fs=require('fs');
const proxy=()=>new Proxy(function(){},{get:(t,k)=>k==='getImageData'?(()=>({data:new Uint8ClampedArray(32*32*4)})):k==='createRadialGradient'?(()=>({addColorStop(){}})):k==='canvas'?{}:proxy(),set:()=>true,apply:()=>proxy()});
const els={};const au=new Proxy({sampleRate:44100,currentTime:0,state:'running',createBuffer:()=>({getChannelData:()=>new Float32Array(44100)})},{get:(t,k)=>k in t?t[k]:()=>proxy()});const el=()=>({style:{},children:[],value:"5",checked:false,textContent:"",innerHTML:"",getContext:()=>proxy(),setPointerCapture(){},addEventListener(){},appendChild(){},value:"16x16"});
const doc={getElementById:id=>els[id]||(els[id]=Object.assign(el(),{value:id.startsWith('t_')?'':id=="c_size"?"16x16":id=="c_den"?".05":"5"})),createElement:()=>el()};
const ctx=vm.createContext({document:doc,innerWidth:390,innerHeight:800,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(){},ImageData:function(d,w,h){this.data=d},Math,console,location:{search:""},window:{AudioContext:function(){return au}},Date,localStorage:{getItem:()=>null},setTimeout,clearTimeout,Uint8Array,Int16Array,Uint8ClampedArray,Array,JSON,Set});
const order="balance enemies level state input rules flow sprites render fx main".split(" ");
for(const n of order){try{vm.runInContext(fs.readFileSync('../js/'+n+'.js','utf8'),ctx,{filename:n+'.js'})}catch(e){console.log("LOAD FAIL",n,e.stack.split("\n").slice(0,3).join("|"));process.exit(1)}}
const run=s=>vm.runInContext(s,ctx);
const test=`(function(){const out=[];CUST=${fs.readFileSync('../levels/sample_warehouse.json','utf8')};$("c_lv").checked=true;deploy();
const m=units.find(u=>u.type=="melee");out.push("melee hp "+m.hp+" mhp "+m.mhp+" routeLen "+m.route.length);
let hpLog=[];let bad=0,firstEngage=-1,minD=99,pcTest=0;
players().forEach(p=>{p.pc=true});setPause(false);out.push("crouch applied "+players().every(p=>p.crouch));
const p0=players()[0];p0.x=8.5;p0.y=11.5;p0.mode="wait";p0.aim=-1.57;p0.face=-1.57;m.face=1.57;
for(let i=0;i<4000&&state=="play";i++){
 update(.025);updVis();draw();
 for(const u of units)if(isNaN(u.x)||isNaN(u.y)||isNaN(u.face))bad++;
 if(m.alive&&m.state=="engage"&&firstEngage<0)firstEngage=i;
 if(i%20==0&&hpLog.length<12)hpLog.push(m.alive?"m:"+m.state:"mdead"+"/p0hp"+p0.hp);if(m.alive)for(const p of players())minD=Math.min(minD,Math.hypot(p.x-m.x,p.y-m.y));
}
out.push("NaN "+bad+" engageAt "+firstEngage+" minDist "+minD.toFixed(2)+" state "+state+" alive p "+players().length+" e "+units.filter(u=>u.team&&u.alive).length+" endT "+endT);
const pr=players()[0]||{};out.push(hpLog.join(","));out.push("wait range "+(pr.mode?rng(pr):"n/a"));
return out.join(" ; ")})()`;
try{console.log(run(test))}catch(e){console.log("RUNTIME FAIL",e.stack.split("\n").slice(0,5).join("\n"))}

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
const T=`(function(){CUST=LVS.sample_warehouse;$("c_lv").checked=true;deploy();players().forEach(p=>{p.y=11.2;p.mode="wait";p.aim=-1.57});
let k=0;for(;k<3000&&state=="play";k++){update(.025);if(k==1500)units.filter(u=>u.team&&u.alive).forEach(u=>{u.x=8.5;u.y=9.5;u.face=1.57})}
const kills=rec.filter(f=>f.t.some(t=>t.kill)).length;
res="won";state="won";$("or").onclick();let t0=0,shots=0,mxs=0;
for(let i=0;i<3000;i++){t0+=16;frame(t0);mxs=Math.max(mxs,cam.s);if(state!="replay")break}
return "sim steps "+k+" recFrames "+rec.length+" killFrames "+kills+" replay ended i="+rp.i+" fx.rid="+fx.rid+" maxCamScale "+mxs.toFixed(1)})()`;
try{console.log(run(T))}catch(e){console.log("RUNTIME FAIL",e.stack.split("\n").slice(0,6).join("\n"))}

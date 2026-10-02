
CFG={en:5,eh:5,sq:3,sh:3,fog:false};genLevel(16,16,.05);init();fitCam();
$("tune").innerHTML=TUNE.map(([k,l])=>`<label for="t_${k}">${l}</label><input id="t_${k}" type="number" step="0.01" value="${BAL[k]}">`).join("");
$("rst").onclick=()=>TUNE.forEach(([k])=>$("t_"+k).value=DEF[k]);
$("mb").onclick=()=>{if(state!="play")return;state="menu";$("ov").style.display="flex";$("cfg").style.display="";$("ot").textContent="Game paused. Resume, or start a new game with the settings below.";$("ob").textContent="NEW GAME";$("orz").style.display="";$("or").style.display="none";$("om").style.display="none"};
$("orz").onclick=()=>{state="play";$("ov").style.display="none"};
requestAnimationFrame(frame);

try{if(location.search.includes("test")){CUST=JSON.parse(localStorage.getItem("tt_test"));$("c_lv").checked=true;$("ln").textContent=CUST.name;deploy()}}catch(x){}
$("sb").onclick=()=>{fx.unlock();fx.muted=!fx.muted;$("sb").textContent=fx.muted?"🔇":"🔊"};

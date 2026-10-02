let CUST=null;
/* ===== OVERLAYS / FLOW ===== */
function showEnd(){$("ov").style.display="flex";$("cfg").style.display="none";$("pp").style.display="";$("rx").style.display="none";
 $("ot").innerHTML=res=="won"?"<b style='font-size:20px'>MISSION COMPLETE</b>":"<b style='font-size:20px;color:#e5383b'>SQUAD LOST</b>";
 $("ob").textContent="PLAY AGAIN";$("orz").style.display="none";$("or").style.display="";$("om").style.display=""}
function end(r){res=r;state=r;setPause(false);showEnd()}
function deploy(){fx.unlock();const[w,h]=$("c_size").value.split("x").map(Number),n=(id,d)=>Math.max(1,parseInt($(id).value)||d);
 CFG={en:n("c_en",5),eh:n("c_eh",5),sq:n("c_sq",3),sh:n("c_sh",3),fog:$("c_fog").checked};TUNE.forEach(([k])=>{const v=parseFloat($("t_"+k).value);if(!isNaN(v))BAL[k]=v});LV=null;if(CUST&&$("c_lv").checked)loadLevel(CUST);else genLevel(w,h,parseFloat($("c_den").value));init();fitCam();$("orz").style.display="none";$("ov").style.display="none";state="play"}
$("ob").onclick=deploy;
$("om").onclick=()=>{$("cfg").style.display="";$("ot").textContent="Pause (❚❚) to plan orders. Tap a soldier, pick a command. Drag to pan, pinch to zoom.";$("ob").textContent="DEPLOY";$("or").style.display="none";$("om").style.display="none";$("orz").style.display="none";state="menu"};
$("or").onclick=()=>{state="replay";rp={i:0,acc:0};fx.reset();fx.rid=0;$("ov").style.display="none";$("pp").style.display="none";$("rx").style.display="block";sel=null;menu()};
$("rx").onclick=()=>{state=res;units=[];showEnd()};

$("lf").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const L=JSON.parse(t);if(L.format!="tt-level")throw 0;CUST=L;$("c_lv").checked=true;$("ln").textContent=L.name}catch(x){$("ln").textContent="invalid file"}})};

/* ===== ENEMY TYPES (level designer reads this file too; add new enemies here) =====
 hp, spd (patrol), engSpd (chasing), range (vision), melee:true + reach (tiles) for melee attackers */
const ET={
 rifle:{name:"Rifleman",desc:"Assault rifle, patrols, shoots on sight.",hp:5,spd:1.5,engSpd:2,range:9},
 melee:{name:"Melee Monster",desc:"Speed 4, attacks at 1 tile, 100% accuracy, 1 HP. Charges the nearest soldier.",hp:1,spd:4,engSpd:4,range:9,melee:true,reach:1}
};
if(typeof UT!=="undefined")for(const k in ET)UT[k]={acc:1,range:ET[k].range,dmg:1,spd:1};

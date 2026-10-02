# Time Tactics
See **HANDOFF.md** for how to run, structure, rules, file formats and next steps.

Open `index.html` (no build, no server needed). Scripts are plain classic scripts sharing globals, loaded in this order:
`balance` (tunables, UT) → `enemies` (ET: enemy types) → `level` (tiles, pathing, level loader, spawnEn) → `state` (init, camera, pause, command ring) → `input` → `rules` (vision, accuracy, AI, update) → `flow` (menus, deploy) → `sprites` → `render` → `fx` → `main`.
`tools/leveldesigner.html` → exports `*.json` (format `tt-level`). Load it in the game menu (Level file) or use Play-test.
`tools/storydesigner.html` → loads level files, exports `*.story.json` (format `tt-story`: nodes, links, dialogue, rewards, embedded levels). A story *player* is not built yet.
**New enemy:** add an entry to `ET` in `js/enemies.js` (hp, spd, engSpd, range, melee/reach). Both the game and level designer pick it up; special behaviour goes in `ai()`/`fire()` in `rules.js` (see `EM()` for the melee example).
**Tiles:** 0 floor, 1 half wall, 2 full wall, 3 quarter wall horizontal, 4 quarter wall vertical (thin, position-based collision in `tile()`).
**Level JSON:** `{format,v,name,w,h,zy(safe zone start row, =h for none),tiles[w*h],spawns[{x,y}],enemies[{type,x,y,face,loop:"loop"|"pingpong",path[[x,y]]}],objective:"eliminate"|"reach",exit{x,y}}`
Status: logic runs headlessly (`node tests/headless.js`: no NaN, monster chase, crouch-on-play, overwatch range verified). Still not played in a real browser: touch input and rendering are unchecked.

## Combat feel (js/fx.js)
`fx.shot(tracer)` is the single entry point (live `fire()` and replay both call it): synthesized WebAudio sounds (pitch-varied, distance-attenuated/dulled), hit-stop slow-mo on kills (longer on the last kill), muzzle flash + floor bloom (drawn above fog), travelling tracers, hit chips/rings/knockback, spark+ping on misses near half walls and walls, shell casings, near-miss whizz, fall-down death animation, replay slow-mo + "best moment" camera. Tunables in `BAL` and the menu tuning panel: `vol, hitStop, hitStopT, lastKillT, fxAmt`.
## Objectives (level JSON `objective`)
`eliminate` | `reach` (exit) | `collect` (`items[]`, `n` needed, 0=all) | `protect` (`target{x,y,hp}` kept outside the safe zone, `secs` of game time, also won if all enemies die) | `hostage` (`hostages[{x,y,hp}]` + `exit`; select hostage while paused -> FOLLOW -> tap a soldier). Samples in `levels/`.
Tests: `cd tests && node objectives.js` (all objectives), `node replay.js`, `node headless.js`.

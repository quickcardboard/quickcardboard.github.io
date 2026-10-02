# Time Tactics – Handoff

Real-time tactical squad game (Frozen Synapse style), mobile portrait, pausable planning. Vanilla HTML/CSS/JS, **no build step, no dependencies**. Design intent: `Time_Tactics_GDD.md` (original GDD, kept in the project).

## Run it
- **Desktop:** serve the folder (`python3 -m http.server 8000` in the project root) and open `http://localhost:8000`. Opening `index.html` by double-click works on desktop Chrome/Firefox but NOT reliably on phones.
- **Phone, same Wi-Fi:** same server, open `http://<computer-LAN-IP>:8000`. Android USB: `adb reverse tcp:8000 tcp:8000` + `chrome://inspect` for console/perf.
- **Single file for sharing/phones:** `python3 tools/build.py` -> `dist/time-tactics-single.html` (inlines css + js in the order of the `<script>` tags in `index.html`).
- Phones cache scripts hard: hard-refresh or use a private tab after edits.
- **Tests (Node, no browser):** `cd tests && node cancel.js` (cancel, run range, stun, loss), `node objectives.js` (all objective types, NaN checks, fx), `node replay.js` (replay + camera), `node headless.js` (melee, crouch-on-play, overwatch range). They stub canvas/audio, so they catch logic/runtime errors only, not visuals or sound.

## Status (read first)
- Logic is exercised headlessly. **Never played in a real browser or on a phone.** Unverified: touch input, command ring placement, real rendering (orange smoke/cone fade, tracers, flashes), audio, performance, the designer tools' pointer UX.
- The offscreen cone layer is full-screen per frame; check frame rate on a mid-range phone first.

## Layout
```
index.html            shell + HUD/menu DOM; script order matters (classic scripts, shared globals)
css/game.css
js/balance.js         BAL (tunables), DEF, TUNE (menu-editable list), UT (unit stats: soldier, civ, core + enemies from ET)
js/enemies.js         ET: enemy type table (hp, spd, engSpd, range, melee/reach). Also read by tools/leveldesigner.html
js/level.js           genLevel (random), buildLevel (cached floor/shadows), loadLevel, tile(), path(), mk(), spawnEn(), spawnObj()
js/state.js           globals, init(), camera, pause/stance commit, command ring (menu())
js/input.js           pointer/pan/pinch, pickChar (whole-sprite hit test), order drag, commit()
js/rules.js           los, accuracy, canSee, fire(), ai(), hostAI(), objState()/objText(), update(), snapRec/rframe
js/flow.js            overlays, deploy(), replay start/exit, custom level file loading (CUST)
js/sprites.js         code-generated 32px pixel sprites (soldier/monster/civ, 4 corpse poses), drawChar, drawCore
js/render.js          cones (offscreen layer + smoke erase), fog, draw(), frame()
js/fx.js              all combat juice (see below)
js/main.js            bootstrap, ?test loader, sound toggle
tools/leveldesigner.html   level editor -> tt-level JSON
tools/storydesigner.html   story graph editor -> tt-story JSON
tools/build.py        single-file bundler
levels/*.json         sample levels (warehouse, collect, protect, hostage)
tests/*.js            headless harnesses
```

## Core rules as implemented
- **Time:** sim runs at 0.5x real time (`update(dt*.5*ts)`, `ts` = hit-stop scale). Pause unlimited (GDD limit removed). Orders only while paused.
- **Stance:** crouch/stand is **pending** (`u.pc`, label shows `*`) and applies only when play resumes (`setPause(false)`). Issuing Run clears crouch the same way.
- **Cancel:** while an order is being targeted a big red CANCEL button replaces the pause button; tap it, or drag the pointer onto it and release (also aborts a smoke throw after aiming). No tooltips.
- **Hits:** knockback `BAL.knock` (visual nudge + lean, slower recovery), `BAL.hitStun` delays the victim's next shot, `BAL.hitReact` (0.5 s) delays turning toward an unseen shooter. All in the tuning panel.
- **Commands:** Walk (tap dest, drag = aim), Wait/overwatch (drag = aim), Run (no shooting, narrow cone), Crouch/Stand, Smoke (2 per soldier, range 7). Hostage: FOLLOW only.
- **After a move** soldiers auto-enter overwatch: facing aim (walk) or movement direction (run).
- **Vision:** cone ~69° for walk/wait/run (run no longer narrower), range 9, **overwatch 11** (`waitRange`), **run 7** (`runRange`). Full walls block; crouched viewer can't see past half walls; crouched target behind half wall visible only within 5 tiles; smoke blocks sight (blinded range 1.5, recovers as smoke fades; 7 s life).
- **Accuracy** = (base + crouch bonus) x distance x target movement x target crouched x half-wall cover x smoke, clamped 3–95%. Base: wait 80%, walk 50%, enemy 70%. Melee = always 100%. Note distance falloff still uses range 9, so overwatch shots at 10–11 tiles drop below the x0.5 floor (~x0.39).
- **Combat timing:** hitscan, 1 dmg; fire delay 0.5 s player / 0.65 s enemy; reaction before first shot = (stance tier+1) x 0.15 s (0 for melee); being shot from outside cone: 0.25 s freeze, turn, then reaction. Priority crouched-wait > wait > crouched-walk > walk decides firing order within a tick (not accuracy).
- **Targeting:** nearest visible enemy, re-evaluated per shot (balance work expected).
- **Enemies:** `rifle` patrol -> engage (close to <=5 cells) -> search 3 s -> patrol; evades when 2+ soldiers see it. `melee` (speed 4, 1 HP, reach 1, 100% acc) charges nearest foe, never evades. Foes include hostage/core units. 1-waypoint route = stationary guard. Random levels spawn rifles only.
- **Quarter walls:** tile types 3 (horizontal) / 4 (vertical), thin (0.25) position-based collision in `tile()`. Pathfinding BFS treats the whole cell as blocked (conservative), string-pull uses precise checks.
- **Safe zone:** rows `zy..H-1`; enemies can't enter/target inside, soldiers can't fire inside. `zy=H` = none. Keep protect targets/hostages outside it.
- **Objectives** (`LV.objective`): eliminate, reach, collect (`items`, `n`), protect (`target`, `secs` game-seconds = 2x real, also won if all enemies die), hostage (`hostages` + `exit`; hostage follows a tapped soldier, win when all within 1.2 of exit, lose if one dies). 1.5 s sim delay before result screen.
- **Spawn:** random levels cluster the squad ~1.1 apart at the safe-zone center (2 rows above 6). Custom levels use `spawns`.
- **Fog of war:** optional menu toggle (default off); uses `ctx.filter` blur (weak on old Safari).
- **Replay:** after a win, per-step snapshots; replays tracers through `fx.shot` (same effects), slow-mo on kills; camera is player-controlled (pan/zoom, no auto-zoom); available after a loss too. Does not record loot/hostage follow lines.

## Combat feel (js/fx.js)
`fx.shot(tracer)` is the single entry point (live `fire()` + replay). WebAudio synth (shot/eshot/hit/kill/claw/smoke/whizz/ping/pick; pitch variance; distance volume + lowpass; 14-voice/0.25 s cap; first tap unlocks audio; HUD 🔊 toggle), hit-stop slow-mo (`hitStop`, `hitStopT`, `lastKillT`), muzzle flash + floor bloom above fog, travelling tracers, chips/rings/knockback+lean, wall sparks + tile flinch, casings, near-miss whizz, fall-down death anim (`u.dth`), hit stagger + orbiting stun sparkles (`fx.stuns`). Tunables: `BAL.vol, hitStop, hitStopT, lastKillT, fxAmt` (also in the menu tuning panel). Deliberately excluded by design: floating damage, screen shake, zoom punch, vignette, haptics, last-stand cue, kill feedback line, hit-chance readout, overwatch trigger cue.

## File formats
- **Level** `{format:"tt-level",v:1,name,w,h,zy,tiles[w*h],spawns[{x,y}],enemies[{type,x,y,face(rad),loop:"loop"|"pingpong",path[[x,y]]}],objective,exit{x,y},items[],n,target{x,y,hp},secs,hostages[{x,y,hp}]}` — tiles: 0 floor, 1 half, 2 full, 3 quarter-H, 4 quarter-V. Enemy `type` must exist in `ET`.
- **Story** `{format:"tt-story",v:1,name,start,levels{name:levelJSON},nodes[{id,type,title,x,y,levelId,text,dialogue[{speaker,text}],reward{credits,xp,points,recruit,item},next[ids]}]}`. Node types: start, level, boss, cutscene, event, training, recruit, revive, end. **No story player exists yet.**
- Play-test: designer writes `localStorage.tt_test` and opens `../index.html?test` (needs same-origin; falls back to export + load via menu).

## Adding content
- **Enemy:** add to `ET` (`js/enemies.js`); level designer picks it up automatically. Custom behaviour: `ai()` / `fire()` in `rules.js` (see `EM()` melee hooks); sprite variant: `spr(... typ)` in `sprites.js`.
- **Objective:** add to `objState()`/`objText()` (`rules.js`), spawn in `spawnObj()` (`level.js`), a tool + `sync()` warning in the level designer.
- **Soldier/gun types:** extend `UT`, `accuracy`, `fire`; loadout screen should set `u.type`.

## Known gaps / risks
- Friendly fire and bullet-vs-cover geometry beyond LOS/half-wall checks are not modeled. Half walls block walking (no vaulting).
- Replay stores a snapshot every step (memory on long games). Random levels can be lopsided.
- Level designer: no undo, no multi-select; story designer: no edge/choice labels, no node duplication; both untested on touch.
- `CFG.eh` (enemy HP) applies to random levels' rifles only; custom levels use `ET` hp.
- Enemy `ET.range` and `UT` are separate from the menu tuning panel.

## Backlog (hooks exist, nothing built)
Loadout screen (unit, weapons, special items, throwables); story player + meta progression (training, recruiting, reviving, squad management, level-select map, boss fights, dialogue/cutscene screens); more enemy types; healing items / other throwables; footstep noise (`noises[]` read by `ai`); rewind N seconds; "tall" characters; enemy respawn/reinforcements (protect objective hook); per-node choices in story designer.

## Suggested next steps
1. Play on a phone (see Run it), log bugs; first check frame rate and the command ring/margins.
2. Tune combat feel via the menu tuning panel, then bake values into `BAL`.
3. Decide targeting rules (weakest / most dangerous / focus fire) and distance-falloff at overwatch range.
4. Build the loadout screen, then the story player against `tt-story` files.

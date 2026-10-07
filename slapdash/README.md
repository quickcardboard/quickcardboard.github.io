# Slapdash — minimal 4-player pixel multiplayer prototype

A deliberately small side-scrolling platform fighter:
- 2D pixel-art-style presentation
- Up to 4 players in one Colyseus room
- A/D or arrow keys to move
- W / Up / Space to jump
- Stomping another player from above scores 1 point
- Victims respawn after 1 second
- Server-authoritative movement, collision, scoring, and respawns
- No art pipeline required: the prototype draws its own rectangles

## 1. Run locally

Requirements:
- Node.js LTS
- npm

From the project folder:

```bash
npm install
npm start
```

Open:

```text
http://localhost:2567
```

Open the URL in 2–4 browser windows/tabs to test multiplayer.

For development with automatic server restarts:

```bash
npm run dev
```

## 2. What is authoritative?

The server owns:
- player positions
- velocity
- gravity
- platform collision
- stomps
- scores
- deaths
- 1-second respawns

The browser only sends input intent. This is important for multiplayer because a client should not be trusted to tell the server “I hit that player.”

## 3. Project structure

```text
slapdash_multiplayer/
├── package.json
├── README.md
├── server/
│   ├── index.js
│   └── room.js
└── public/
    └── index.html
```

## 4. Free deployment: recommended path

Use GitHub + Render.

1. Create a GitHub repository.
2. Upload this entire folder.
3. In Render, create a **Web Service** from the GitHub repository.
4. Build command:
   ```text
   npm install
   ```
5. Start command:
   ```text
   npm start
   ```
6. Choose the **Free** instance.
7. Render will give you an `onrender.com` URL.
8. Open that URL in multiple browser windows to test.

The prototype intentionally serves the game and WebSocket server from the same origin. That means the browser automatically connects to the correct `https://...onrender.com` address without a separate server URL.

### Important free-tier behavior

Render's free web services spin down after 15 minutes without inbound traffic and can take about a minute to wake again. This is fine for a hobby prototype but can make the first connection feel slow after inactivity.

## 5. Alternative: split frontend and backend

Once the prototype is stable, you can put the static client on Cloudflare Pages and leave only the Colyseus server on Render.

In that version:
- Cloudflare Pages serves `index.html` and game assets.
- Render hosts the WebSocket/Colyseus server.
- The client changes:
  ```js
  const client = new Client("https://YOUR-RENDER-SERVICE.onrender.com");
  ```

For the first prototype, I recommend keeping them together. It removes CORS and deployment complexity.

## 6. Next development steps

### Phase 1 — make the core fun
- Add a round timer (e.g. 90 seconds).
- Add a first-to-10 score condition.
- Add a visible scoreboard.
- Add a small hit/death effect.
- Add camera shake on a successful stomp.
- Add spawn protection for ~0.5 seconds.
- Prevent a player from repeatedly stomping the same target in one physics tick.

### Phase 2 — improve the feel
Add:
- client-side prediction for the local player
- server reconciliation
- interpolation for remote players
- coyote time
- jump buffering
- acceleration/deceleration rather than instant horizontal speed
- variable jump height
- stomp bounce

The Colyseus documentation has a Phaser multiplayer tutorial covering interpolation, client prediction, and fixed tick-rate simulation.

### Phase 3 — make the game identifiable
Choose one strong hook rather than adding lots of mechanics. Good candidates:
- shrinking arena
- moving platforms
- wall-jumps
- temporary bounce pads
- destructible platforms
- one-use dash
- hazard zones
- a crown/king-of-the-hill objective

### Phase 4 — polish
Replace the procedural rectangles with:
- 16×16 or 24×24 player sprites
- 16×16 environment tiles
- 2–3 frame idle animation
- 4–6 frame run animation
- 4 frame jump/fall animation
- one short stomp effect
- tiny sound effects

Keep the pixel art grid fixed. Do not scale individual sprites independently; scale the entire game viewport.

## 7. Multiplayer architecture

The intended production flow is:

```text
Player A browser ─┐
Player B browser ─┼── WebSocket ──> Colyseus Room
Player C browser ─┤                    │
Player D browser ─┘                    │
                                      ▼
                           authoritative game state
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
              positions/scores                    deaths/respawns
```

The server should remain authoritative for anything that affects competitive outcomes.

## 8. A good first playtest

Put four people in the same room and play a 90-second match.

Do not add power-ups yet.

Watch for:
- Is jumping predictable?
- Can players reliably land a stomp?
- Does the one-second respawn feel too short/long?
- Is the camera too zoomed in/out?
- Does the player understand why they died?
- Does chasing someone feel more interesting than simply waiting on a platform?
- Is there enough verticality to create interesting stomp opportunities?

Those answers should drive the next mechanics.

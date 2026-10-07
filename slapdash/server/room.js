import { Room, Client } from "colyseus";
import { schema, t } from "@colyseus/schema";

const PLAYER_W = 26;
const PLAYER_H = 34;
const WORLD_W = 4200;
const WORLD_H = 700;
const GROUND_Y = 620;

const GRAVITY = 1550;
const MOVE_SPEED = 270;
const JUMP_SPEED = 610;
const MAX_FALL = 900;

const SPAWNS = [
  { x: 180, y: 520 },
  { x: 520, y: 520 },
  { x: 900, y: 520 },
  { x: 1260, y: 520 }
];

// Platforms are x/y/w/h rectangles. y is the top edge.
const PLATFORMS = [
  { x: 0, y: 620, w: 4200, h: 80 },
  { x: 360, y: 500, w: 230, h: 22 },
  { x: 760, y: 430, w: 220, h: 22 },
  { x: 1120, y: 520, w: 260, h: 22 },
  { x: 1510, y: 450, w: 250, h: 22 },
  { x: 1880, y: 535, w: 260, h: 22 },
  { x: 2250, y: 405, w: 230, h: 22 },
  { x: 2580, y: 500, w: 290, h: 22 },
  { x: 3030, y: 430, w: 240, h: 22 },
  { x: 3380, y: 520, w: 300, h: 22 },
  { x: 3780, y: 455, w: 240, h: 22 }
];

export const Player = schema({
  x: t.number(),
  y: t.number(),
  vx: t.number(),
  vy: t.number(),
  score: t.number(),
  color: t.string(),
  alive: t.boolean()
}, "Player");

export const GameState = schema({
  players: t.map(Player),
  worldWidth: t.number(),
  worldHeight: t.number()
}, "GameState");

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function overlapX(a, b) {
  return a.x < b.x + PLAYER_W && a.x + PLAYER_W > b.x;
}

function rectOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + PLAYER_W > b.x &&
    a.y < b.y + b.h &&
    a.y + PLAYER_H > b.y
  );
}

export class GameRoom extends Room {
  maxClients = 4;
  patchRate = 50;

  onCreate() {
    this.setState(new GameState({
      worldWidth: WORLD_W,
      worldHeight: WORLD_H
    }));

    this.inputs = new Map();
    this.respawnTimers = new Map();

    this.onMessage("input", (client, input = {}) => {
      const current = this.inputs.get(client.sessionId);
      if (!current) return;

      current.left = !!input.left;
      current.right = !!input.right;
      current.jump = !!input.jump;
    });

    this.setSimulationInterval((dt) => this.update(Math.min(dt, 50)), 1000 / 60);
  }

  onJoin(client) {
    const index = this.state.players.size % SPAWNS.length;
    const spawn = SPAWNS[index];

    this.state.players.set(client.sessionId, new Player({
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      score: 0,
      color: ["#ff5f56", "#4da3ff", "#ffd166", "#b57cff"][index],
      alive: true
    }));

    this.inputs.set(client.sessionId, { left: false, right: false, jump: false });
  }

  onLeave(client) {
    this.inputs.delete(client.sessionId);
    this.respawnTimers.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
  }

  update(dtMs) {
    const dt = dtMs / 1000;
    const now = Date.now();

    // Respawns.
    for (const [id, respawnAt] of this.respawnTimers) {
      if (now >= respawnAt) {
        const p = this.state.players.get(id);
        if (p) {
          const spawn = SPAWNS[Array.from(this.state.players.keys()).indexOf(id) % SPAWNS.length];
          p.x = spawn.x;
          p.y = spawn.y;
          p.vx = 0;
          p.vy = 0;
          p.alive = true;
          this.respawnTimers.delete(id);
        }
      }
    }

    // Physics.
    for (const [id, p] of this.state.players) {
      if (!p.alive) continue;

      const input = this.inputs.get(id);
      if (!input) continue;

      const oldBottom = p.y + PLAYER_H;
      const oldVy = p.vy;

      if (input.left === input.right) {
        p.vx *= Math.pow(0.0005, dt);
      } else {
        p.vx = input.right ? MOVE_SPEED : -MOVE_SPEED;
      }

      // Jump only when standing on a platform.
      if (input.jump && this.isGrounded(p)) {
        p.vy = -JUMP_SPEED;
      }

      p.vy = clamp(p.vy + GRAVITY * dt, -JUMP_SPEED, MAX_FALL);

      const nextX = clamp(p.x + p.vx * dt, 0, WORLD_W - PLAYER_W);
      let nextY = p.y + p.vy * dt;

      // Horizontal position.
      p.x = nextX;

      // Vertical platform collision: only resolve downward.
      if (p.vy >= 0) {
        let landingY = null;
        for (const platform of PLATFORMS) {
          const nextBottom = nextY + PLAYER_H;
          const horizontallyOver = p.x + PLAYER_W > platform.x && p.x < platform.x + platform.w;
          const crossedTop = oldBottom <= platform.y && nextBottom >= platform.y;
          if (horizontallyOver && crossedTop) {
            if (landingY === null || platform.y < landingY) landingY = platform.y;
          }
        }
        if (landingY !== null) {
          nextY = landingY - PLAYER_H;
          p.vy = 0;
        }
      }

      p.y = nextY;

      // Fell off the world.
      if (p.y > WORLD_H + 100) {
        this.eliminate(id, null);
        continue;
      }

      // Stomp detection.
      for (const [victimId, victim] of this.state.players) {
        if (victimId === id || !victim.alive) continue;

        const attacker = { x: p.x, y: p.y, w: PLAYER_W, h: PLAYER_H };
        const target = { x: victim.x, y: victim.y, w: PLAYER_W, h: PLAYER_H };

        const descending = oldVy > 0;
        const crossedHead = oldBottom <= victim.y + 8 && p.y + PLAYER_H >= victim.y;
        const sideOverlap = overlapX(attacker, target);

        if (descending && crossedHead && sideOverlap) {
          p.score += 1;
          p.vy = -JUMP_SPEED * 0.72;
          this.eliminate(victimId, id);
        }
      }
    }
  }

  isGrounded(p) {
    const feet = p.y + PLAYER_H;
    return PLATFORMS.some(platform => {
      const nearTop = Math.abs(feet - platform.y) < 4;
      const over = p.x + PLAYER_W > platform.x && p.x < platform.x + platform.w;
      return nearTop && over;
    });
  }

  eliminate(victimId, killerId) {
    const victim = this.state.players.get(victimId);
    if (!victim || !victim.alive) return;

    victim.alive = false;
    victim.vx = 0;
    victim.vy = 0;
    this.respawnTimers.set(victimId, Date.now() + 1000);
  }
}

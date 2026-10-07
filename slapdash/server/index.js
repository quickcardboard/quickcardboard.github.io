import { defineServer, defineRoom } from "colyseus";
import { GameRoom } from "./room.js";
import { createReadStream } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT || 2567);
const publicDir = path.resolve("public");

const server = defineServer({
  rooms: {
    slapdash: defineRoom(GameRoom),
  },
  express: (app) => {
    app.get("/health", (_req, res) => {
      res.json({ ok: true, game: "Slapdash", players: 4 });
    });

    app.get("/", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });

    app.use((req, res, next) => {
      if (req.method !== "GET") return next();
      const safePath = path.normalize(req.path).replace(/^(\.\.[/\\])+/, "");
      const file = path.join(publicDir, safePath);
      if (file.startsWith(publicDir) && !req.path.endsWith("/")) {
        res.sendFile(file, (err) => {
          if (err) next();
        });
      } else {
        next();
      }
    });
  }
});

server.listen(PORT);
console.log(`Slapdash server listening on ${PORT}`);

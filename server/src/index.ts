import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./sockets";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

initSocket(io);

httpServer.listen(env.port, () => {
  console.log(`BuildTrack server running on port ${env.port}`);
});

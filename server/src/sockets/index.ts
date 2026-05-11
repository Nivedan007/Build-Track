import { Server } from "socket.io";

let io: Server;

export const initSocket = (socketServer: Server) => {
  io = socketServer;

  io.on("connection", (socket) => {
    socket.on("join:project", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
  });
};

export const notifyProjectUpdate = (projectId: string, payload: unknown) => {
  if (!io) return;
  io.to(`project:${projectId}`).emit("project:update", payload);
};

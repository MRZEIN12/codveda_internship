let io = null;

function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*", // fine for local learning; tighten in production
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Bidirectional connection
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Optional: client can join a personal room later (user-specific notifications)
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };

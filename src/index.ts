import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT || 8080;

// Create a basic HTTP server (required by Render)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running");
});

// Attach WebSocket server to the HTTP server
const ws = new WebSocketServer({ server });

let userCount = 0;

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

ws.on("connection", (socket) => {
  userCount++;
  console.log("User connected #" + userCount);

  socket.on("message", (event) => {
    const parsedMessage = JSON.parse(event.toString());

    if (parsedMessage.type === "join") {
      console.log("User joined room " + parsedMessage.payload.roomId);
      allSockets.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      console.log("User sent a message");

      const currentUserRoom = allSockets.find((x) => x.socket === socket)?.room;

      const socketInRoom = allSockets.filter(
        (user) => user.room === currentUserRoom && user.socket !== socket
      );

      socketInRoom.forEach((user) => {
        user.socket.send(parsedMessage.payload.message);
      });
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((user) => user.socket !== socket);
    console.log("User disconnected");
  });
});

// Start the HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import { WebSocketServer, WebSocket } from "ws";

const ws = new WebSocketServer({ port: 8080 });
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const ws = new ws_1.WebSocketServer({ port: 8080 });
let userCount = 0;
let allSockets = [];
ws.on("connection", (socket) => {
    userCount++;
    console.log("User connected #" + userCount);
    socket.on("message", (event) => {
        var _a;
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
            const currentUserRoom = (_a = allSockets.find((x) => x.socket === socket)) === null || _a === void 0 ? void 0 : _a.room;
            const socketInRoom = allSockets.filter((user) => user.room === currentUserRoom && user.socket !== socket);
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

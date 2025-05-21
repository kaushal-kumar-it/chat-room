"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const PORT = process.env.PORT || 8080;
// Create a basic HTTP server (required by Render)
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200);
    res.end("WebSocket server is running");
});
// Attach WebSocket server to the HTTP server
const ws = new ws_1.WebSocketServer({ server });
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
// Start the HTTP + WebSocket server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

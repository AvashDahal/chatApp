import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

let socketsConnected = new Set();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socketsConnected.add(socket.id);
    io.emit('clients-total', socketsConnected.size);

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        socketsConnected.delete(socket.id);
        io.emit('clients-total', socketsConnected.size);
    });

    socket.on('message', (data) => {
        console.log(data);
        socket.broadcast.emit('chat-message', data);
    });
    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

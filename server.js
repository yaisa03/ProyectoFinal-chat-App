const { uuid } = require('uuidv4');

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.emit('current-user', socket.id);

    socket.on('join-room', (data) => {
        socket.join(data.currentRoom);
        console.log(`user with id: ${socket.id} and username: ${data.currentUsername} joined room ${data.currentRoom}`);
    })

    let createdRoom = uuid().slice(0,-13);
    socket.emit('create-room', createdRoom);

    socket.on('send-message', (message) => {
        socket.to(message.room).emit('receive-message', { ...message, userId: socket.id });/* {message:message, userId:socket.id} */
    })

    /* socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', data.userTyping);
    }) */

    socket.on('disconect', () => {
        console.log('a user disconnected', socket.id);
    })
});

server.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});

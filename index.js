const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { addUser, removeUser, getUser, getUsersInRoom, setUserIsTyping } = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const router = require('./router');
app.use(router);

const time = require('moment');


io.on('connection', (socket) => {
   console.log(`Socket  ${socket.id} is connected`);

   socket.on('userJoin', ({name, room}, callback) => {
       const {error, user} = addUser({id: socket.id, name, room});
       const messageTime = time().format('HH:mm');

       if (error) return callback(error);
       socket.join(room);

       socket.emit('message', {user: 'admin', text: `Howdy ${user.name}`, time: messageTime});
       socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined the room`, time: messageTime});

       io.to(user.room).emit('updateUsers', getUsersInRoom(user.room));

       console.log(`${name} has joined room ${room}`);
       callback();
   });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);


        //dev stuff - catch the pesky error on react restart
        if (!user) return console.log('For whatever fucking reason the bloody user dissapeared');


        const messageTime = time().format('HH:mm');

        io.to(user.room).emit('message', {user: user.name, text: message, time: messageTime});

        callback();
    });


    socket.on('typing', (typing) => {

        const userId = socket.id;
        // set the user status in user array to isTyping and return the modified user
        const user = setUserIsTyping(userId, typing);

        io.to(user.room).emit('updateUsers', getUsersInRoom(user.room));
    });


    socket.on('updateMessages', (messages) => {
        const user = getUser(socket.id);
        socket.to(user.room).broadcast.emit('updateMessages', messages);
    });


   socket.on('disconnect', () => {
       console.log(`Socket  ${socket.id} disconnected`);
       const user = removeUser(socket.id);

       //dev stuff - catch the pesky error on react restart
       if (!user) return console.log('For whatever fucking reason the bloody user dissapeared while disconnecting');

       //console.log(`User ${user.name} fetched`);
       io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left the room`});
       io.to(user.room).emit('updateUsers', getUsersInRoom(user.room));
   })
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`The server is up on port ${PORT}`);
});

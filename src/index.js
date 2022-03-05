const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words')
const { genrateMessages, genrateLocation } = require('./utils/messages')
const { getUser, removeUser, getUsersInRoom, addUser } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


// let count = 0;
const str = 'Welcome to my world';
//code runs when a client get connected
io.on('connection', (socket) => {
    console.log('New Web Socket Connection');

    //listening to client to join a room request
    socket.on('join', ({ username, room }, callback) => {
        //adding function call add user
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        //emit output to client
        socket.emit('clientMessage', genrateMessages('Admin', str));
        //boradcast to everyone when new user gets connected
        socket.broadcast.to(user.room).emit('clientMessage', genrateMessages('Admin', `${user.username} has joined!`));

        //sening users info in a room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    //listeaning to the client input
    socket.on('sendMessage', (message, callback) => {
        //calling get user to get users data
        const user = getUser(socket.id)

        //checking for bad words
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('No bad Words plzz')
        }
        //send message to all connected clients
        io.to(user.room).emit('clientMessage', genrateMessages(user.username, message));
        callback()
    })

    //listening to server location
    socket.on('sendLocation', (coords, callback) => {
        //get usder info
        const user = getUser(socket.id)

        //sending location to all connected clients
        io.to(user.room).emit('locationMessage', genrateLocation(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
        //callback is for acknowledgement
        callback()

    })
    //code run when user gets disconnected
    socket.on('disconnect', () => {
        //function call when user disconncted
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('clientMessage', genrateMessages('Admin', `${user.username} has left`))

            //sening users info in a room
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

    // socket.emit('updatedCount', count);

    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('updatedCount', count);
    //     io.emit('updatedCount', count);
    // })
})


server.listen(port, () => {
    console.log(`server is up  on port ${port}`);
})
var express = require('express');
var app = express();
var http = require('http').createServer(app);
const PORT = process.env.PORT || 3000;

var webroot = __dirname + '/client/index.html';

app.use('/', express.static(webroot));
var server = http.listen(PORT);

var users = [];

var io = require('socket.io').listen(server);

var currentConnections = {};
io.sockets.on('connection', function (socket) {

    socket.emit('welcome', {
        text: 'Welcome to Agario'
    });

    socket.on('data', function (someData) {

        socket.broadcast.emit('update', {
            x: someData.x,
            y: someData.y,
            name: someData.name,
            id: socket.id
        });
    });
    var clientIp = socket.request.connection.remoteAddress;

    console.log('socket connected from ' + clientIp);

    socket.on('user', function (data) {
        console.log(data.name + ' connected');
        data.x = -500;
        data.y = -500;
        data.id = socket.id;

        users.push(data);

        console.log('users : ' + users.length);
        socket.emit('start', users);
        socket.broadcast.emit('otherUserConnect', data);
    });

    socket.on('disconnect', function () {
        if (!socket.user) {
            return;
        }
        if (users.indexOf(socket.user) > -1) {
            console.log(socket.user + ' disconnected');
            users.splice(users.indexOf(socket.user), 1);
            socket.broadcast.emit('otherUserDisconnect', {
                name: currentConnections[socket.id].name
            });
        }
        delete currentConnections[socket.id];
    });
});

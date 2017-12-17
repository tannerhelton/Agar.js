var mainUser = '';
var users = [];
var socket = io();
var user;

function setup() {
    socket.on('connect', function () {
        $('#error').hide();
        $('#error').html('');
        $('#noerror').show();
    });

    socket.io.on('connect_error', function (err) {
        $('#error').html(err + '<br>Chat server offline');
        $('#error').show();
        $('#noerror').hide();
    });

    socket.on('start', function (data) {
        users = data;
    });

    socket.on('welcome', function (data) {
        printOut(data.text);
    });

    socket.on('otherUserConnect', function (data) {
        printOut(data + ' connected');
        users.push(data);
    });
    socket.on('otherUserDisconnect', function (data) {
        printOut(data.name);
        for (var i = users.length - 1; i >= 0; --i) {
            if (users[i].id == data.id) {
                users.splice(i, 1);
            }
        }
    });

    $('#user-save').click(function () {
        var username = $('#user-name');
        var txt = username.val().trim();
        if (txt.length > 0) {
            name = txt;
            username.prop('disabled', true);
            $(this).hide();
            $('#controls').show();
            $('#message').prop('disabled', false);
            $('#restart').prop('disabled', false);
            user = name;
            mainUser = user;
            socket.emit('user', {
                name: user
            });
        }
    });


    $('#restart').click(function () {
        location.reload();
    });

    function printOut(msg) {
        $('<div/>').text(msg).appendTo('#log');
    }

    socket.on('update', function (stuff) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == stuff.id) {
                users[i].x = stuff.x;
                users[i].name = stuff.name;
                users[i].y = stuff.y;
            }
        }
    });

    createCanvas(800, 600);
}

function draw() {

    background(200);
    socket.emit('data', {
        x: mouseX,
        y: mouseY
    });
    noStroke();
    fill('black');
    textSize(32);
    ellipse(mouseX, mouseY, 15, 15);

    if (users.length >= 1) {
        for (var i = 0; i < users.length; i++) {
            //text(users[i].name, users[i].x, users[i].y - 25);
            ellipse(users[i].x, users[i].y, 15, 15);
        }
    }
}

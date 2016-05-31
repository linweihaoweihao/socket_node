/**
 * Created by linweihao on 16/4/19.
 */
var models = require('../lib/models')
    , User = models.user()
module.exports = function (server) {
    console.log('x...')
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {

        //console.log('connection...')
        //socket.on('login', function () {
        //
        //})
        //setInterval(setdata, 1000)
        //function setdata() {
        //    console.log(new Date().getTime())
        //    socket.emit('new message', {
        //        username: "sss",
        //        message: new Date().getTime()
        //    });
        //}

        socket.on('join room', function () {
            socket.join('some room');
            //socket.to('some room').emit('some event')
        })

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function (data) {
            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: socket.username,
                message: data
            });
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add user', function (username) {
            if (addedUser) return;

            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            socket.emit('login', {
                numUsers: numUsers
            });
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            if (addedUser) {
                --numUsers;

                // echo globally that this client has left
                socket.broadcast.emit('user left', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });
    });

}

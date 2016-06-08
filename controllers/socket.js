/**
 * Created by linweihao on 16/4/19.
 */
var models = require('../lib/models')
    , User = models.user()
    , Room = models.room()
    , session = require('express-session')
    , RedisStore = require('connect-redis')(session)
    , Account = require('./account')
    , sessionMiddleware = session({
        cookie: {maxAge: (1000 * 3600)},
        store: new RedisStore({client: require('redis').createClient(6379, '127.0.0.1')}), // XXX redis server config
        secret: "keyboard",
        resave: false,
        saveUninitialized: true
    }), Promise = require('bluebird')

module.exports = function (server) {
    //console.log('x...')
    var io = require('socket.io')(server);

    io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    io.of('/chat').on('connection', function (socket) {
        //console.log('connection...' )
        console.log('connection...' + JSON.stringify(socket.request.session))
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
        function init() {
            if (socket.request.session.userId) {
                let id = socket.request.session.userId
                socket.join('server_' + id)
                return User.QfindOne({_id: id}, {friends: 1})
                    .then(function (doc) {
                        let promises = []
                        if (doc.friends.length === 0) {
                            return
                        }
                        doc.friends.forEach(function (friend_id) {
                            console.log(id, friend_id)
                            promises.push(Room.QfindOneAndUpdateByRoom([id, friend_id]).then(function (room) {
                                socket.join(room._id)
                            }))
                        })
                        return Promise.all(promises)
                    })
            }
        }

        function serverSend(type, _id, message) {
            socket.to('server_' + _id).emit({type: type, message: message})
        }

        init()
        var addedUser = false
            , numUsers = 0

        socket.on('join', function (data) {
            if (socket.request.session.userId) {
                let _id = socket.request.session.userId
                    , friend_id = data._id
                User.Qcount({_id: _id, friends: friend_id})
                    .then(function (count) {
                        if (count > 0) {
                            return Room.QfindOneAndUpdateByRoom([_id, friend_id])
                        }
                    }).then(function (room) {
                        if (room) {
                            socket.join(room._id)
                        }
                    })
            }
        })

        socket.on('new join', function (data) {
            if (socket.request.session.userId) {
                let _id = socket.request.session.userId
                    , friend_id = data.friend_id
                User.Qcount({_id: _id, friends: friend_id})
                    .then(function (count) {
                        if (count > 0) {
                            return Room.QfindOneAndUpdateByRoom([_id, friend_id])
                        }
                    }).then(function (room) {
                        if (room) {
                            socket.join(room._id)
                            serverSend('join', friend_id, {_id: _id})
                        }
                    })

            }
        })

        socket.on('server', function (data) {
            if (socket.request.session.userId) {
                switch (data.type) {
                    case "addfriend":
                        return
                    case "" :
                        return
                }
            }
        })

        // when the client emits 'new message', this listens and executes
        socket.on('message', function (data) {
            //{friend_id:friend_id,message:message}
            // we tell the client to execute 'new message'
            if (socket.request.session.userId) {
                console.log('message')
                let friendId = data.friend_id
                    , _id = socket.request.session.userId
                return Room.QfindRoomByFriends([friendId, _id])
                    .then(function (room) {
                        socket.to(room._id).emit('new message', {
                            username: _id,
                            message: data.message
                        });
                    })
            }
        });

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function (data) {
            // we tell the client to execute 'new message'
            if (socket.request.session.userId) {
                console.log('new message')
                socket.broadcast.emit('new message', {
                    username: socket.username,
                    message: data
                });
            }
        });

        // when the client emits 'add user', this listens and executes
        socket.on('add friend', function (data) {
           // {friend_id:friend_id}
            if (socket.request.session.userId) {
                console.log('add user')
                let friend_id = data.friend_id

                socket.emit('login', {
                    numUsers: numUsers
                });
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: socket.username,
                    numUsers: numUsers
                });
            }
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            if (socket.request.session.userId) {
                console.log('disconnect')
                socket.request.session.destroy()
                // echo globally that this client has left
                //socket.broadcast.emit('user left', {
                //    username: socket.username,
                //    numUsers: numUsers
                //});
            }
        });
    });

}

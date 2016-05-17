/**
 * Created by linweihao on 16/4/19.
 */
module.exports = function (server) {
    console.log('x...')
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        console.log('connection...')
        socket.on('login', function () {

        })
        setInterval(setdata, 1000)
        function setdata() {
            console.log(new Date().getTime())
            socket.emit('new message', {
                username: "sss",
                message: new Date().getTime()
            });
        }
    })
}

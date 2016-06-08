/**
 * Created by linweihao on 16/5/31.
 */
var Socket = require('./socket')
module.exports = function(router){
    router.get("/d", function(req, res, next){
        Socket.ddd()
        res.send("hello")
    })
    router.get("/s", function(req, res, next){
        req.session.iii = "tt"
        res.send("hello")
    })
    var account = require('./account.js')
    router.get('/register', account.register)
    router.get('/login', account.login)
    router.post('/appLogin', account.registerAndLogin)

    function isLogin (req, res, next){
        if(req.session.islogin){
            next()
        }else{
            res.send({err: true, message: "no login", code: 400})
        }
    }
}
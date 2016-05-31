/**
 * Created by linweihao on 16/5/31.
 */
module.exports = function(router){
    router.get("/", function(req, res, next){
        res.send("hello")
    })
    var account = require('./account.js')
    router.post('/register', account.register)
    router.post('/login', account.login)
    router.post('/appLogin', account.registerAndLogin)

    function isLogin (req, res, next){
        if(req.session.islogin){
            next()
        }else{
            res.send({err: true, message: "no login", code: 400})
        }
    }
}
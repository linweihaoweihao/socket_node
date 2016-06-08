/**
 * Created by linweihao on 15/9/16.
 */

var Promise = require('bluebird'),
    md5 = require('blueimp-md5').md5,
    Models = require('../lib/models.js'),
    User = Models.user(),
    config = require('../config.js').Config

exports.register = function (req, res, next) {
    var name = req.query.name
        , password = req.query.password

    Promise.resolve().then(function () {
        if (!name) {
            return Promise.reject({code: 400, message: '用户名为空！'})
        }
        return User.QfindOne({name: name})
    }).then(function (user) {
        if (user) {
            return Promise.reject({code: 400, message: '该名字已注册过！'})
        } else {
            return User.Qadd(name, password)
        }
    }).then(function (doc) {
        if (doc) {
            res.send({err: false, code: 200, message: '注册成功！'})
        }
    }).catch(function (err) {
        console.trace(err)
        res.send({err: true, message: err.message, code: err.code})
    })
}

exports.login = function (req, res, next) {
    var name = req.query.name
        , password = req.query.password
        , options = {}
        , userId

    Promise.resolve().then(function () {
        if (!name) {
            return Promise.reject({code: 400, message: '用户名为空！'})
        }
        return User.QfindOne({name: name})
    }).then(function (user) {
        if (!user) {
            return Promise.reject({code: 400, message: '用户不存在!'})
        }
        if (password != user.password) {
            return Promise.reject({code: 400, message: '密码错误！'})
        }
        delete user.password
        options.user = user
        userId = user._id.toString()
        req.session.userId = userId
        req.session.islogin = true
        return User.QfindFriends(user.friends)
    }).then(function (friends) {
        options.user.friends = friends
        return res.send({err: false, code: 200, message: options})
    }).catch(function (err) {
        console.trace(err)
        res.send({err: true, message: err.message, code: err.code})
    })
}

exports.registerAndLogin = function (req, res, next) {
    var name = req.query.name
        , password = md5(req.query.password)
        , nick = req.query.nick
        , sex = req.query.sex
        , avatar = req.query.avatar
        , platformName = req.query.platforName
        , platformId = req.query.platformId
        , options = {}
        , userId

    if (sex === "男") {
        sex = 0
    }
    if (sex === "女") {
        sex = 1
    }

    Promise.resolve().then(function () {
        if (!name) {
            return Promise.reject({code: 400, message: '用户名为空！'})
        }
        return User.QfindOne({name: name})
    }).then(function (user) {
        if (user) {
            if (password === user.password) {
                user = JSON.parse(JSON.stringify(user))
                delete user.password
                options.user = user
                options.code = 202
                userId = user._id.toString()
                req.session.userId = userId
                req.session.islogin = true
                return User.QfindFriends(user.friends)
                    .then(function (friends) {
                        user.friends = friends
                    })
            } else {
                return Promise.reject({code: 400, message: '密码错误！'})
            }
        } else {
            return User.QaddFromApp(name, password, nick, sex, avatar, platformName, platformId)
                .then(function (doc) {
                    doc = JSON.parse(JSON.stringify(doc))
                    userId = doc._id.toString()
                    delete doc.password
                    options.user = doc
                    req.session.userId = userId
                    req.session.islogin = true
                    options.collections = []
                    options.code = 201
                    return doc
                })
        }
    }).then(function () {
        return res.send({err: false, code: 200, message: options})
    }).catch(function (err) {
        console.trace(err)
        res.send({err: true, message: err.message, code: err.code})
    })
}

exports.islogin = function (req, res, next) {
    if (req.session.islogin) {
        next()
    } else {
        res.send({err: true, message: "未登录！不可操作", code: 400})
    }
}

exports.getFriends = function (req, res, next) {
    var id = req.query.id
    if(!req.session.userId){
        res.send({err: true, code: 404, message: "未登录"})
    }
    return User.QfindOne({_id: id}, {friends: 1})
        .then(function (doc) {
            return User.QfindFriends(doc.friends)
        }).then(function (friends) {
            res.send({err: false, code: 200, message: friends})
        })
}

exports.addFriend = function (req, res, next) {
    var id = req.query.id
        , friend_id = req.query.f_id
    if (id && friend_id) {
        return User.QaddFriend(id, friend_id)
            .then(function () {
                res.send({err: false, code: 200, message: "success"})
            })
    } else {
        res.send({err: true, message: "fail", code: 400})
    }
}

exports.deleteFriend = function (req, res, next) {
    var id = req.query.id
        , friend_id = req.query.f_id
    if (id && friend_id) {
        return User.QdeleFriend(id, friend_id)
            .then(function () {
                res.send({err: false, code: 200, message: "success"})
            })
    } else {
        res.send({err: true, message: "fail", code: 400})
    }
}

exports.initFriend = function () {

}

exports.showUser = function (req, res) {
    return User.Qfind()
        .then(function (dcos) {
            res.send({dos: JSON.stringify(dcos)})
        })
}

exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        if(err){
            console.trace(err)
            res.send({err: true, message: "fail", code: 400})
        }else{
            res.send({err: false, code: 200, message: "success"})
        }

    })
}

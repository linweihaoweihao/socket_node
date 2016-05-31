/**
 * Created by linweihao on 15/9/16.
 */

var Promise = require('bluebird'),
    md5 = require('blueimp-md5').md5,
    Models = require('../lib/models.js'),
    User = Models.user(),
    config = require('../config.js').Config

exports.register = function (req, res, next) {
    var name = req.body.name
        , password = md5(req.body.password)

    Promise.resolve().then(function () {
        if(!name){
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
    var name = req.body.name
        , password = md5(req.body.password)
        , options = {}
        , userId

    Promise.resolve().then(function () {
        if(!name){
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
        return res.send({err: false, code: 200, message: options})
    }).catch(function (err) {
        console.trace(err)
        res.send({err: true, message: err.message, code: err.code})
    })
}

exports.registerAndLogin = function (req, res, next) {
    var name = req.body.name
        , password = md5(req.body.password)
        , nick = req.body.nick
        , sex = req.body.sex
        , avatar = req.body.avatar
        , platformName = req.body.platforName
        , platformId = req.body.platformId
        , options = {}
        , userId

    if(sex === "男"){
        sex = 0
    }
    if(sex === "女"){
        sex = 1
    }

    Promise.resolve().then(function () {
        if(!name){
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
                return true
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

exports.showUser = function(req, res){
   return User.Qfind()
        .then(function(dcos){
            res.send({dos:JSON.stringify(dcos)})
        })
}

/**
 * Created by linweihao on 15/5/11.
 */
var mongoose = require('mongoose')
    , Promise = require('bluebird')
    , Config = require('../config').Config
var User = mongoose.Schema({
    uid: {type: Number},
    name: {type: String, unique: true},
    password: {type: String},
    nick: {type: String},
    sex: {type: Number},
    role: {type: Number},
    alipay: {type: String},//支付宝
    phone: {type: Number},
    avatar: {type: String},
    platformName: {type: String},
    platformId: {type: String},
    friends: {type: Array},
    time: {type: Date}
});

User.index({name: 1})

User.statics.Qadd = function (name, password) {
    var options = {name: name, password: password, time: new Date()}
    options.role = Config.role.trail
    return this.Qsave(options)
}

User.statics.QaddFromApp = function (name, password, nick, sex, avatar, platformName, platformId) {
    var options = {
        name: name,
        password: password,
        nick: nick,
        sex: sex,
        avatar: avatar,
        platformName: platformName,
        platformId: platformId
    }
    options.role = Config.role.trail
    return this.Qsave(options)
}

User.statics.Qsave = function (options) {
    var thisModel = this
    options = options || {}
    return new Promise(function (resolve, reject, notify) {
        thisModel(options).save(function (err, doc) {
            if (err) {
                reject(err)
            } else {
                resolve(doc)
            }
        })
    })
}


User.statics.Qfind = function (query, sort, skip, limit) {
    query = query || {}
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.find(query).sort(sort).skip(skip).limit(limit).exec(function (err, docs) {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })
}

User.statics.QfindOne = function (query) {
    query = query || {}
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.findOne(query, function (err, doc) {
            if (err) {
                reject(err)
            } else {
                resolve(doc)
            }
        })
    })
}


User.statics.Qcount = function (query) {
    query = query || {}
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.count(query).exec(function (err, count) {
            if (err) {
                reject(err)
            } else {
                resolve(count)
            }
        })
    })
}


User.statics.QfindOneAndUpdate = function (query, update, options) {
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.findOneAndUpdate(query, update, options, function (err, doc) {
            if (err) {
                reject(err)
            } else {
                resolve(doc)
            }
        })
    })
}


User.statics.Qupdate = function (query, doc, options) {
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.update(query, doc, options, function (err, numberAffected, raw) {
            if (err) {
                reject(err)
            } else {
                resolve([numberAffected, raw])
            }
        })
    })
}

User.statics.QaddFriend = function (id, friend_id) {
    var query = {_id: id, friends: friend_id}
        , doc = {$push: {friends: friend_id}}
        , thisModel = this

    return new Promise(function (resolve, reject, notify) {
        return thisModel.QfindOne(query)
            .then(function (d) {
                if (d) {
                    return resolve("已添加")
                }
                return resolve(thisModel.QfindOneAndUpdate({_id: id}, doc))
            })
    })
}

User.statics.QdeleCollection = function (id, friend_id) {
    return this.QfindOneAndUpdate({_id: id}, {$pull: {friends: friend_id}})
}

module.exports = User;
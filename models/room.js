/**
 * Created by linweihao on 16/6/1.
 */
var mongoose = require('mongoose')
    , Promise = require('bluebird')
    , Config = require('../config').Config
var Room = mongoose.Schema({
    friends: {type: Array},
    time: {type: Date}
});

Room.index({friends: 1})

Room.statics.Qadd = function (friends) {
    var options = {friends: friends}
    return this.Qsave(options)
}

Room.statics.Qsave = function (options) {
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


Room.statics.Qfind = function (query, sort, skip, limit, projection) {
    query = query || {}
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.find(query, projection).sort(sort).skip(skip).limit(limit).exec(function (err, docs) {
            if (err) {
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })
}

Room.statics.QfindOne = function (query, projection) {
    query = query || {}
    var thisModel = this
    return new Promise(function (resolve, reject, notify) {
        thisModel.findOne(query, projection, function (err, doc) {
            if (err) {
                reject(err)
            } else {
                resolve(doc)
            }
        })
    })
}


Room.statics.Qcount = function (query) {
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


Room.statics.QfindOneAndUpdate = function (query, update, options) {
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


Room.statics.Qupdate = function (query, doc, options) {
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

Room.statics.QaddFriend = function (id, friend_id) {
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


Room.statics.QdeleFriend = function (id, friend_id) {
    return this.QfindOneAndUpdate({_id: id}, {$pull: {friends: friend_id}})
}

Room.statics.QfindRoomByFriends = function (friend_ids) {
    return this.QfindOne({friends: {$in: friend_ids}}, {_id: 1})
}

Room.statics.QfindOneAndUpdateByRoom = function (friend_ids) {
    var query = {friends: {$in: friend_ids}}
        , doc = {friends: friend_ids, time: new Date()}
        , thisModel = this
    return this.QfindOneAndUpdate(query, doc, {upsert: true})
        .then(function (room) {
            if (!room) {
                return thisModel.QfindOne({friends: {$in: friend_ids}}, {_id: 1})
            }
            return room
        })
}

Room.statics.QfindIsBelong = function (_id, UserId) {
    return this.QfindOne({_id: _id}, {_id: 1})
}


module.exports = Room;

/**
 * Created by linweihao on 15/9/29.
 */
var mongoose = require('mongoose')
    , DataDB = null
    , CommonDB = null
    , config = require('../config.js').Config

function getCommonConnection() {
    if (!CommonDB) {
        CommonDB = mongoose.createConnection(config.mongo + '/common')

    }
    return CommonDB
}

function getCommonModel(model, file, isSingle) {
    var modelCon = getCommonConnection().models[model]
    if (modelCon) {
        return modelCon
    }
    if (isSingle) {
        getCommonConnection().model(model, require(file))
    } else {
        getCommonConnection().model(model, require(file)(model))
    }

    return getCommonConnection().models[model]
}

exports.user = function () {
    return getCommonModel('user', '../models/user', true)
}


function getDataConnection() {
    if (!DataDB) {
        DataDB = mongoose.createConnection(config.mongo + '/data')
    }
    return DataDB
}

function getDataModel(model, file, isSingle) {
    var modelCon = getDataConnection().models[model]
    if (modelCon) {
        return modelCon
    }
    if (isSingle) {
        getDataConnection().model(model, require(file))
    } else {
        getDataConnection().model(model, require(file)(model))
    }

    return getDataConnection().models[model]
}

//exports.collocation = function () {
//    return getDataModel('collocation', '../models/collocation', true)
//}

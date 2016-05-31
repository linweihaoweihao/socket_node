/**
 * Created by linweihao on 15/9/9.
 */
var Path = require('path')
    , moment = require('moment')
    , date = moment().format('YYYY-MM-DD')

exports.Config = {

     mongo: "mongodb://115.159.147.132:27017"
    , logConfig: {
        "appenders": [
            {
                "type": "clustered",
                "appenders": [
                    {
                        "type": "dateFile",
                        "filename": "./log/access",
                        //"filename": "./log/" + date + "-access.log",
                        "pattern": "-yyyy-MM-dd.log",
                        "maxLogSize": 10240,
                        "alwaysIncludePattern": true,
                        "category": "http"
                    },
                    {
                        "type": "dateFile",
                        "filename": "./log/app",
                        //"filename": "./log/" + date + "-app.log",
                        "pattern": "-yyyy-MM-dd.log",
                        "maxLogSize": 10240,
                        "alwaysIncludePattern": true,
                        "numBackups": 3,
                        "category": "http"
                    },
                    {
                        "type": "logLevelFilter",
                        "level": "ERROR",
                        "appender": {
                            "type": "dateFile",
                            "filename": "./log/errors",
                            "pattern": "-yyyy-MM-dd.log",
                            "maxLogSize": 10240,
                            "alwaysIncludePattern": true
                            //"filename": "./log/" + date + "-errors.log"
                        }
                    }
                ]
            }
        ]
        , replaceConsole: true
    }
    , smallImg: "_180x180.jpg"
    , bigImg: "_360x360.jpg"
}
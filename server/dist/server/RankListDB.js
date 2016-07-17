"use strict";
const COLLECTION_NAME = 'WeeklyScoreList';
const COLLECTION_INDEX = { week: -1, score: -1, _id: -1 }; //需要创建的索引(_id放在最后，使得即使分数相同也会有一个固定的排序)
var db;
var WeeklyScoreListCollection;
/**将时间转换成表示星期的字符串 */
function toWeekString(t) {
    var d = new Date(t);
    var day = d.getDay(); //0 == 星期天
    var minusDay = 0;
    if (day == 0) {
        minusDay = 7;
    }
    else {
        minusDay = day - 1;
    }
    d.setDate(d.getDate() - minusDay); //日期是可以非法的。Date会自动调整到合理的位置的
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
exports.toWeekString = toWeekString;
function write(key, time, weekHighScore) {
    if (!WeeklyScoreListCollection)
        return;
    var week = toWeekString(time);
    var _id = key + '|' + week;
    var doc = {
        _id: _id,
        key: key,
        week: week,
        score: weekHighScore
    };
    WeeklyScoreListCollection.replaceOne({ _id: _id }, doc, { upsert: true }, function (err, ret) {
        if (err) {
            console.warn(err);
            console.warn('写入周排行失败,doc=', doc);
            return;
        }
        console.log('write ok');
    });
}
exports.write = write;
/**
 * 获取排名位置
 * result请自行+1，第一名result==0
 */
function getRankPosition(key, time, weekHighScore, callback) {
    if (!WeeklyScoreListCollection) {
        process.nextTick(() => {
            callback(new Error('WeeklyScoreListCollection还没有初始化完成'), 0);
        });
        return;
    }
    var week = toWeekString(time);
    WeeklyScoreListCollection.count({ week: week, score: { $gt: weekHighScore } }, function (err, result) {
        if (err) {
            console.warn(err);
        }
        callback(err, result);
    });
}
exports.getRankPosition = getRankPosition;
/**
 * 获取排名列表
 */
function getRankList(callback) {
    if (!WeeklyScoreListCollection) {
        process.nextTick(() => callback(new Error("WeeklyScoreListCollection还没有初始化完成"), null));
        return;
    }
    var week = toWeekString(Date.now());
    WeeklyScoreListCollection
        .find({ week: week }, { key: 1, score: 1 })
        .sort({ score: -1, _id: -1 })
        .limit(10)
        .toArray(function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        var keys = result.map(obj => obj.key);
        db.collection('ball_users')
            .find({ _id: { $in: keys } }, { key: 1, nickname: 1, faceurl: 1 })
            .toArray(function (err, users) {
            if (err) {
                callback(err, null);
                return;
            }
            var users_object = {};
            for (var user of users) {
                users_object[user.key] = user;
            }
            for (var i = 0; i < result.length; ++i) {
                if (result[i]) {
                    var user = users_object[result[i].key];
                    if (user) {
                        result[i].nickname = user.nickname;
                        result[i].faceurl = user.faceurl;
                    }
                }
            }
            callback(null, result);
        });
    });
}
exports.getRankList = getRankList;
function ensureCollection(name) {
    return new Promise(function (resolve, reject) {
        db.collection(name, (err, coll) => {
            if (err) {
                reject(err);
                return;
            }
            db.createCollection(name).then(coll => {
                coll['ensureIndex'](COLLECTION_INDEX, null, (err, result) => {
                    if (err) {
                        console.error('创建index失败');
                        reject(err);
                        return;
                    }
                    resolve(coll);
                });
            }).catch(reject);
        });
    });
}
function init(_db) {
    db = _db;
    ensureCollection(COLLECTION_NAME).then(coll => {
        console.log('初始化排名榜成功');
        WeeklyScoreListCollection = coll;
    }).catch(err => {
        console.log('初始化数据库排名表失败', err);
        process.exit(1);
    });
}
exports.init = init;
global['RankListDB'] = module.exports;

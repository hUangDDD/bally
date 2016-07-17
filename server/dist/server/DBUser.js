"use strict";
///<reference path="typings/tsd.d.ts"/>
const assert = require("assert");
const RankListDB = require("./RankListDB");
var easyM = require("easy-mongo");
let mongo_str = require("yargs").argv.mongo;
var dbp = new easyM.DbProvider();
let g_db = null;
let g_AllDBObject = {};
exports.MAX_FRIEND_COUNT = 50;
if (!mongo_str) {
    mongo_str = 'mongodb://127.0.0.1/db';
}
if (mongo_str.substr(0, 7) !== 'mongodb') {
    mongo_str = 'mongodb' + mongo_str;
}
console.log('连接数据库:', mongo_str);
dbp.init(mongo_str, {
    exists: [{
            'ball_users': {
                index: 'nickname'
            }
        }]
}, function (err, db) {
    if (err) {
        console.error('数据库初始化失败');
        process.exit(100);
        return;
    }
    console.log('数据库初始化成功');
    g_db = db;
    RankListDB.init(db.db);
    global['db'] = db;
});
function searchUser(name) {
    if (!g_db)
        Promise.reject(new Error('数据库还没有初始化完成'));
    let keywords = '\\()[].*+?/^$|=';
    let re_name = '^';
    for (let i = 0; i < name.length; ++i) {
        let c = name[i];
        if (keywords.indexOf(c) >= 0) {
            re_name += '\\' + c;
        }
        else {
            re_name += c;
        }
    }
    return g_db.ball_users.find({ nickname: { '$regex': re_name } }, { _id: 1, nickname: 1, faceurl: 1 }).limit(100).toArray();
}
exports.searchUser = searchUser;
function getUserByNickname(nickname) {
    return g_db.ball_users.findOne({ nickname: nickname });
}
exports.getUserByNickname = getUserByNickname;
function getUser(key, create) {
    let obj = g_AllDBObject[key];
    if (obj) {
        if (obj instanceof Promise)
            return obj;
        initUser(obj);
        return Promise.resolve(obj);
    }
    obj = new Promise(function (resolve, reject) {
        if (!g_db) {
            g_AllDBObject[key] = null;
            reject(new Error('数据库还没有初始化完成'));
            return;
        }
        easyM.createDbJson(g_db, { col: dbp.ball_users, key: key, alwayscreate: create }, (err, obj) => {
            if (err) {
                console.error(`createDbJson error, key=${key}`, err);
                g_AllDBObject[key] = null;
                reject(err);
                return;
            }
            assert(obj);
            g_AllDBObject[key] = obj;
            obj.key = key;
            global['lastuser'] = obj;
            initUser(obj);
            resolve(obj);
        });
    });
    g_AllDBObject[key] = obj;
    return obj;
}
exports.getUser = getUser;
function addDefaultPet(user, idx) {
    if (!user.pets[idx]) {
        user.pets[idx] = {
            id: idx,
            level: 1,
            exp: 0,
            skillLv: 1,
            skillExp: 0,
            lockedLv: 5
        };
    }
}
//todo: 可能用来修复db中坏掉的宠物数据
function fixPet(i, obj) {
    if (!obj)
        return;
    //如果 obj[name]不是数字，或没有大于val， 则设置成val
    let fixNumber = (obj, name, val) => {
        if (typeof obj[name] !== 'number' || !(obj[name] >= val))
            obj[name] = val;
    };
    if (obj.id !== i)
        obj.id = i;
    fixNumber(obj, 'level', 1);
    fixNumber(obj, 'exp', 0);
    fixNumber(obj, 'skillLv', 1);
    fixNumber(obj, 'skillExp', 0);
    fixNumber(obj, 'lockedLv', 5);
}
//其实就是用来修复和初始化db数据的
function initUser(user) {
    //setNumber: 如果obj[name]不是数字，则设置成默认值val
    let setNumber = (obj, name, val) => { if (typeof obj[name] !== 'number')
        obj[name] = val; };
    setNumber(user, 'coin', 0);
    setNumber(user, 'diamond', 0);
    setNumber(user, 'heart', 5);
    setNumber(user, 'nextHeartTime', 0);
    setNumber(user, 'currentPet', 0);
    setNumber(user, 'nextMailId', 0);
    setNumber(user, 'maxCombo', 0);
    setNumber(user, 'maxLink', 0);
    setNumber(user, 'totalKill', 0);
    setNumber(user, 'sendHeartCount', 0);
    setNumber(user, 'sendHeartCountTime', 0);
    if (!Array.isArray(user.pets))
        user.pets = [];
    for (let i = 0; i < 1; ++i) {
        addDefaultPet(user, i);
    }
    for (let i = 0; i < user.pets.length; ++i) {
        let pet = user.pets[i];
        if (pet)
            fixPet(i, pet);
    }
    //修复一下，当前选中的宠物
    if (!user.pets[user.currentPet]) {
        user.currentPet = 0;
    }
    //mails
    if (!Array.isArray(user.mails)) {
        user.mails = [];
    }
    if (!Array.isArray(user.friends)) {
        user.friends = [];
    }
    if (typeof user.eventTags !== 'object') {
        user.eventTags = {};
    }
}
exports.initUser = initUser;

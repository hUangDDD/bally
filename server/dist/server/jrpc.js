"use strict";
let jrpclib = require('jrpc-client');
let jrpc = null;
let ss = require("yargs").argv.ss;
exports.PRODUCT_NAME = "BallyBallyCrash!";
exports.PLATFORM_ID = 0;
exports.SERVER_ID = 0;
if (ss) {
    jrpc = new jrpclib();
    console.log('开始连接统计服务器：' + ss);
    jrpc.on('connected', () => {
        console.log('成功连接统计服务器');
    });
    jrpc.on('error', (e) => {
        console.error('统计服务器错误', e);
    });
    jrpc.connect(ss);
}
function serverData(ip, port) {
    call("serverdata", {
        productName: exports.PRODUCT_NAME, $: {
            upsert: {
                c: { platformID: exports.PLATFORM_ID, serverID: exports.SERVER_ID }, set: {
                    clusterID: exports.PLATFORM_ID + '_' + exports.SERVER_ID, data: {
                        ip: ip,
                        port: port
                    }, time: new Date()
                }
            }
        }
    });
}
exports.serverData = serverData;
//type JRPC_NAMES = "onlineCount"|"recharge"|"userin"|"userkickstartevent"|"serverdata";
function call(name, obj) {
    if (jrpc) {
        jrpc.call(name, obj);
    }
}
exports.call = call;
function gameStart(usertype, key, gameid, heart, useCoin, pet) {
    call('game', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        userID: key,
        gameid: gameid,
        time: new Date(),
        type: 'start',
        obj: {
            heart: heart,
            useCoin: useCoin,
            pet: pet
        }
    });
}
exports.gameStart = gameStart;
function gameCancel(usertype, key, id, positive) {
    call('game', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        userID: key,
        gameid: id,
        time: new Date(),
        type: 'cancel',
        obj: {
            positive: positive //玩家主动取消游戏
        }
    });
}
exports.gameCancel = gameCancel;
function gameEnd(usertype, key, id, result) {
    call('game', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        userID: key,
        gameid: id,
        time: new Date(),
        type: 'end',
        obj: result
    });
}
exports.gameEnd = gameEnd;
function userin(usertype, userid, userAgent) {
    call('userin', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        userID: userid,
        accID: userid,
        name: userid,
        time: new Date(),
        agent: userAgent,
    });
}
exports.userin = userin;
function userreg(usertype, userid, url, parentUser, userAgent) {
    call('userkickstartevent', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        userID: userid,
        accID: userid,
        name: userid,
        kickoffEventID: 'regCharacter',
        comesfrom: parentUser,
        time: new Date(),
        agent: userAgent
    });
}
exports.userreg = userreg;
function userreg_after_1_minute(usertype, userid, url, parentUser, userAgent) {
    call('userkickstartevent', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        userID: userid,
        accID: userid,
        name: userid,
        kickoffEventID: 'createCharacter',
        comesfrom: parentUser,
        time: new Date(),
        agent: userAgent
    });
}
exports.userreg_after_1_minute = userreg_after_1_minute;
function userout(usertype, userid, duration) {
    call('userout', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverid: exports.SERVER_ID,
        time: new Date(),
        accID: userid,
        userID: userid,
        name: userid,
        duration: duration,
    });
}
exports.userout = userout;
function recharge(order, userid, amount, value, nick) {
    call("recharge", {
        productName: exports.PRODUCT_NAME,
        platformID: exports.PLATFORM_ID,
        serverID: exports.SERVER_ID,
        order: order,
        userID: userid,
        accID: userid,
        amount: amount,
        value: value,
        stat: 'no stat is success',
        time: new Date(),
        name: nick,
        total: 0,
    });
}
exports.recharge = recharge;
function weeklyTaskEnd(user, task) {
    let taskid = task.desc;
    call("task", {
        productName: exports.PRODUCT_NAME,
        platformID: user.dbuser.usertype,
        serverID: exports.SERVER_ID,
        time: new Date(),
        account: user.key,
        name: user.dbuser.nickname,
        accID: user.key,
        userID: user.key,
        taskid: taskid,
    });
}
exports.weeklyTaskEnd = weeklyTaskEnd;
exports.CONSUME_TYPE_GAME_ITEM = 1000;
exports.CONSUME_TYPE_UNLOCK_PET = 100;
exports.CONSUME_TYPE_BUY_GIFT = 2000;
exports.CONSUME_TYPE_BUY_HEART = 101;
exports.CONSUME_TYPE_BUY_COIN = 102;
exports.CONSUME_TYPE_GAME_OTHER = 103;
function consumedataEx(usertype, userid, nick, type, amount, productCount, total, msg) {
    let rmb = 0;
    let free = 0;
    if ([exports.CONSUME_TYPE_BUY_HEART, exports.CONSUME_TYPE_BUY_COIN, , exports.CONSUME_TYPE_GAME_OTHER].indexOf(type) >= 0) {
        rmb = amount;
    }
    else {
        free = amount;
    }
    call('consumedata', {
        productName: exports.PRODUCT_NAME,
        platformID: usertype,
        serverID: exports.SERVER_ID,
        time: new Date(),
        name: nick || userid,
        accID: userid,
        userID: userid,
        type: type,
        free: free,
        rmb: rmb,
        count: productCount,
        value: msg,
        total: total
    });
}
exports.consumedataEx = consumedataEx;
/*
export function consumedata(userid, iscoin, amount, msg, total, nick?)
{
    call('consumedata', {
        productName: PRODUCT_NAME,
        platformID: PLATFORM_ID,
        serverID: SERVER_ID,
        time: new Date(),
        name: nick || userid,
        accID: userid,
        userID: userid,
        type: 0,
        free: iscoin ? 1 : 0,
        rmb: amount,
        count: 0,
        value: msg,
        total: total
    });
}

export function buyCoin(userid, diamond, coin, oldDiamond)
{
    call('consumedata', {
        productName: PRODUCT_NAME,
        platformID: PLATFORM_ID,
        serverID: SERVER_ID,
        time: new Date(),
        name: userid,
        accID: userid,
        userID: userid,
        type: 0,
        free: 0,
        rmb: diamond,
        count: coin,
        value: `话费${diamond}钻石购买${coin}金币`,
        total: oldDiamond
    });
}
*/
function onlinecount(count) {
    call('onlinecount', {
        productName: exports.PRODUCT_NAME,
        platformID: exports.PLATFORM_ID,
        serverID: exports.SERVER_ID,
        time: new Date(),
        count: count
    });
}
exports.onlinecount = onlinecount;

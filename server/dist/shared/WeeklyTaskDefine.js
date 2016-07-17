"use strict";
exports.ALL_WEEKLY_TASK_TYPE = [
    "gameCombo",
    "gameExp",
    "gameCoin",
    "gameBomb",
    "gameSkill",
    "gameScore",
    "gameLink",
    "gameBall",
    "gameExpBomb",
    "gameTimeBomb",
    "gameCoinBomb",
    "gameScoreBomb",
    "gameBallX",
    "totalExpBomb",
    "totalTimeBomb",
    "totalCoinBomb",
    "totalScoreBomb",
    "totalBall",
    "totalExp",
    "totalBomb",
    "totalScore",
    "totalBallX",
    "totalSkillX",
];
//分裂WeeklyTaskType，使得它更容易使用
//例如 "gameExpBomb" => ["game", "expBomb"]
function splitWeeklyTaskType(type, param) {
    let prefix;
    let tail;
    if (type.substr(0, 4) === 'game') {
        prefix = 'game';
        tail = type.substr(4);
    }
    else if (type.substr(0, 5) === 'total') {
        prefix = 'total';
        tail = type.substr(5);
    }
    else {
        return null;
    }
    if (tail.length > 0) {
        tail = tail[0].toLowerCase() + tail.substr(1);
    }
    if (tail === 'ballX') {
        tail = 'ball' + param;
    }
    else if (tail === 'skillX') {
        tail = 'skill' + param;
    }
    return [prefix, tail];
}
exports.splitWeeklyTaskType = splitWeeklyTaskType;
var TASK_SETS;
function getCurrentWeeklyTaskSet() {
    let now = Date.now();
    if (TASK_SETS) {
        for (let t of TASK_SETS) {
            if (now >= t.from && now <= t.to)
                return t;
        }
    }
    return null;
}
exports.getCurrentWeeklyTaskSet = getCurrentWeeklyTaskSet;
//这是一个标准的模板
const TASK_LIST1 = [
    { type: "gameCombo", maxCount: 20, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "连击达到20次" },
    { type: "gameExp", maxCount: 40, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局获得40经验" },
    { type: "gameCoin", maxCount: 120, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局获得120金币" },
    { type: "gameBomb", maxCount: 4, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局触发4个炸弹" },
    { type: "gameSkill", maxCount: 2, failCount: 3, prizeType: "coin", prizeCount: 500, desc: "单局触发技能2次" },
    { type: "gameScore", maxCount: 200000, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据获得200000分' },
    { type: 'gameLink', maxCount: 12, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单局连接12个果冻' },
    { type: 'gameBall', maxCount: 230, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单局消除230个果冻' },
    { type: 'gameExpBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个经验炸弹' },
    { type: 'gameTimeBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个时间炸弹' },
    { type: 'gameCoinBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个金币炸弹' },
    { type: 'gameScoreBomb', maxCount: 1, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据触发1个分数炸弹' },
    { type: 'totalExpBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个经验炸弹' },
    { type: 'totalTimeBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个时间炸弹' },
    { type: 'totalCoinBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个金币炸弹' },
    { type: 'totalScoreBomb', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发6个分数炸弹' },
    { type: 'totalBall', maxCount: 1500, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计消除1500个果冻' },
    { type: 'totalExp', maxCount: 240, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计获得240经验' },
    { type: 'totalBomb', maxCount: 24, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发24个爆炸点' },
    { type: 'totalScore', maxCount: 300000, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计获得300000分' },
    { type: 'totalBallX', maxCount: 300, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计消除{果冻X}300个' },
    { type: 'totalSkillX', maxCount: 6, failCount: 0, prizeType: 'coin', prizeCount: 500, desc: '累计触发{果冻X}技能6次' },
    { type: 'gameBallX', maxCount: 50, failCount: 3, prizeType: 'coin', prizeCount: 500, desc: '单据消除{果冻X}50个' },
];
var TASK_LIB; /* = [
    null,
    { type: "gameCombo", maxCount: 20, failCount: 3, desc: "连击达到20次" }
    , { type: "gameExp", maxCount: 40, failCount: 3, desc: "单局获得40经验" }
    , { type: "gameCoin", maxCount: 120, failCount: 3, desc: "单局获得120金币" }
    , { type: "gameBomb", maxCount: 4, failCount: 3, desc: "单局触发4个炸弹" }
    , { type: "gameSkill", maxCount: 2, failCount: 3, desc: "单局触发技能2次" }
    , { type: "gameScore", maxCount: 200000, failCount: 3, desc: "单据获得200000分" }
    , { type: 'gameLink', maxCount: 12, failCount: 3, desc: "单局连接12个果冻" }
    , { type: 'gameBall', maxCount: 230, failCount: 3, desc: "单局消除230个果冻" }
    , { type: 'gameExpBomb', maxCount: 1, failCount: 3, desc: "单据触发1个经验炸弹" }
    , { type: 'gameTimeBomb', maxCount: 1, failCount: 3, desc: "单据触发1个时间炸弹" }
    , { type: 'gameCoinBomb', maxCount: 1, failCount: 3, desc: "单据触发1个金币炸弹" }
    , { type: 'gameScoreBomb', maxCount: 1, failCount: 3, desc: "单据触发1个分数炸弹" }
    , { type: 'totalExpBomb', maxCount: 6, failCount: 0, desc: "累计触发6个经验炸弹" }
    , { type: 'totalTimeBomb', maxCount: 6, failCount: 0, desc: "累计触发6个时间炸弹" }
    , { type: 'totalCoinBomb', maxCount: 6, failCount: 0, desc: "累计触发6个金币炸弹" }
    , { type: 'totalScoreBomb', maxCount: 6, failCount: 0, desc: "累计触发6个分数炸弹" }
    , { type: 'totalBall', maxCount: 1500, failCount: 0, desc: "累计消除1500个果冻" }
    , { type: 'totalExp', maxCount: 240, failCount: 0, desc: "累计获得240经验" }
    , { type: 'totalBomb', maxCount: 24, failCount: 0, desc: "累计触发24个爆炸点" }
    , { type: 'totalScore', maxCount: 300000, failCount: 0, desc: "累计获得300000分" }
    , { type: 'totalBallX', maxCount: 300, failCount: 0, desc: "累计消除\"{果冻X}\"300个" }
    , { type: 'totalSkillX', maxCount: 6, failCount: 0, desc: "累计触发\"{果冻X}\"技能6次" }
    , { type: 'gameBallX', maxCount: 50, failCount: 3, desc: "单据消除\"{果冻X}\"50个" }
    , { type: "gameCombo", maxCount: 60, failCount: 5, desc: "连击达到60次" }
    , { type: "gameExp", maxCount: 60, failCount: 5, desc: "单局获得60经验" }
    , { type: "gameCoin", maxCount: 180, failCount: 5, desc: "单局获得180金币" }
    , { type: "gameBomb", maxCount: 6, failCount: 5, desc: "单局触发6个炸弹" }
    , { type: "gameSkill", maxCount: 3, failCount: 5, desc: "单局触发技能3次" }
    , { type: "gameScore", maxCount: 600000, failCount: 5, desc: "单据获得600000分" }
    , { type: 'gameLink', maxCount: 18, failCount: 5, desc: "单局连接18个果冻" }
    , { type: 'gameBall', maxCount: 280, failCount: 5, desc: "单局消除280个果冻" }
    , { type: 'gameExpBomb', maxCount: 2, failCount: 5, desc: "单据触发2个经验炸弹" }
    , { type: 'gameTimeBomb', maxCount: 2, failCount: 5, desc: "单据触发2个时间炸弹" }
    , { type: 'gameCoinBomb', maxCount: 2, failCount: 5, desc: "单据触发2个金币炸弹" }
    , { type: 'gameScoreBomb', maxCount: 2, failCount: 5, desc: "单据触发2个分数炸弹" }
    , { type: 'totalExpBomb', maxCount: 9, failCount: 0, desc: "累计触发9个经验炸弹" }
    , { type: 'totalTimeBomb', maxCount: 9, failCount: 0, desc: "累计触发9个时间炸弹" }
    , { type: 'totalCoinBomb', maxCount: 9, failCount: 0, desc: "累计触发9个金币炸弹" }
    , { type: 'totalScoreBomb', maxCount: 9, failCount: 0, desc: "累计触发9个分数炸弹" }
    , { type: 'totalBall', maxCount: 2250, failCount: 0, desc: "累计消除2250个果冻" }
    , { type: 'totalExp', maxCount: 360, failCount: 0, desc: "累计获得360经验" }
    , { type: 'totalBomb', maxCount: 36, failCount: 0, desc: "累计触发36个爆炸点" }
    , { type: 'totalScore', maxCount: 450000, failCount: 0, desc: "累计获得450000分" }
    , { type: 'totalBallX', maxCount: 450, failCount: 0, desc: "累计消除\"{果冻X}\"450个" }
    , { type: 'totalSkillX', maxCount: 9, failCount: 0, desc: "累计触发\"{果冻X}\"技能9次" }
    , { type: 'gameBallX', maxCount: 60, failCount: 5, desc: "单据消除\"{果冻X}\"60个" }
    , { type: "gameCombo", maxCount: 80, failCount: 0, desc: "连击达到80次" }
    , { type: "gameExp", maxCount: 90, failCount: 0, desc: "单局获得90经验" }
    , { type: "gameCoin", maxCount: 270, failCount: 0, desc: "单局获得270金币" }
    , { type: "gameBomb", maxCount: 9, failCount: 0, desc: "单局触发9个炸弹" }
    , { type: "gameSkill", maxCount: 4, failCount: 0, desc: "单局触发技能4次" }
    , { type: "gameScore", maxCount: 1000000, failCount: 0, desc: "单据获得1000000分" }
    , { type: 'gameLink', maxCount: 25, failCount: 0, desc: "单局连接25个果冻" }
    , { type: 'gameBall', maxCount: 360, failCount: 0, desc: "单局消除360个果冻" }
    , { type: 'gameExpBomb', maxCount: 3, failCount: 0, desc: "单据触发3个经验炸弹" }
    , { type: 'gameTimeBomb', maxCount: 3, failCount: 0, desc: "单据触发3个时间炸弹" }
    , { type: 'gameCoinBomb', maxCount: 3, failCount: 0, desc: "单据触发3个金币炸弹" }
    , { type: 'gameScoreBomb', maxCount: 3, failCount: 0, desc: "单据触发3个分数炸弹" }
    , { type: 'totalExpBomb', maxCount: 15, failCount: 0, desc: "累计触发15个经验炸弹" }
    , { type: 'totalTimeBomb', maxCount: 15, failCount: 0, desc: "累计触发15个时间炸弹" }
    , { type: 'totalCoinBomb', maxCount: 15, failCount: 0, desc: "累计触发15个金币炸弹" }
    , { type: 'totalScoreBomb', maxCount: 15, failCount: 0, desc: "累计触发15个分数炸弹" }
    , { type: 'totalBall', maxCount: 3600, failCount: 0, desc: "累计消除3600个果冻" }
    , { type: 'totalExp', maxCount: 800, failCount: 0, desc: "累计获得800经验" }
    , { type: 'totalBomb', maxCount: 54, failCount: 0, desc: "累计触发54个爆炸点" }
    , { type: 'totalScore', maxCount: 10000000, failCount: 0, desc: "累计获得10000000分" }
    , { type: 'totalBallX', maxCount: 800, failCount: 0, desc: "累计消除\"{果冻X}\"800个" }
    , { type: 'totalSkillX', maxCount: 15, failCount: 0, desc: "累计触发\"{果冻X}\"技能15次" }
    , { type: 'gameBallX', maxCount: 90, failCount: 0, desc: "单据消除\"{果冻X}\"90个" }
    , { type: "gameCombo", maxCount: 120, failCount: 0, desc: "连击达到120次" }
    , { type: "gameExp", maxCount: 120, failCount: 0, desc: "单局获得120经验" }
    , { type: "gameCoin", maxCount: 400, failCount: 0, desc: "单局获得400金币" }
    , { type: "gameBomb", maxCount: 13, failCount: 0, desc: "单局触发13个炸弹" }
    , { type: "gameSkill", maxCount: 6, failCount: 0, desc: "单局触发技能6次" }
    , { type: "gameScore", maxCount: 1500000, failCount: 0, desc: "单据获得1500000分" }
    , { type: 'gameLink', maxCount: 32, failCount: 0, desc: "单局连接32个果冻" }
    , { type: 'gameBall', maxCount: 500, failCount: 0, desc: "单局消除500个果冻" }
    , { type: 'gameExpBomb', maxCount: 3, failCount: 0, desc: "单据触发3个经验炸弹" }
    , { type: 'gameTimeBomb', maxCount: 3, failCount: 0, desc: "单据触发3个时间炸弹" }
    , { type: 'gameCoinBomb', maxCount: 3, failCount: 0, desc: "单据触发3个金币炸弹" }
    , { type: 'gameScoreBomb', maxCount: 3, failCount: 0, desc: "单据触发3个分数炸弹" }
    , { type: 'totalExpBomb', maxCount: 25, failCount: 0, desc: "累计触发25个经验炸弹" }
    , { type: 'totalTimeBomb', maxCount: 25, failCount: 0, desc: "累计触发25个时间炸弹" }
    , { type: 'totalCoinBomb', maxCount: 25, failCount: 0, desc: "累计触发25个金币炸弹" }
    , { type: 'totalScoreBomb', maxCount: 25, failCount: 0, desc: "累计触发25个分数炸弹" }
    , { type: 'totalBall', maxCount: 5400, failCount: 0, desc: "累计消除5400个果冻" }
    , { type: 'totalExp', maxCount: 1200, failCount: 0, desc: "累计获得1200经验" }
    , { type: 'totalBomb', maxCount: 80, failCount: 0, desc: "累计触发80个爆炸点" }
    , { type: 'totalScore', maxCount: 15000000, failCount: 0, desc: "累计获得15000000分" }
    , { type: 'totalBallX', maxCount: 1200, failCount: 0, desc: "累计消除\"{果冻X}\"1200个" }
    , { type: 'totalSkillX', maxCount: 22.5, failCount: 0, desc: "累计触发\"{果冻X}\"技能22.5次" }
    , { type: 'gameBallX', maxCount: 90, failCount: 0, desc: "单据消除\"{果冻X}\"90个" }
]
*/
function merge(obj1, obj2) {
    let obj3 = {};
    for (let key in obj1)
        obj3[key] = obj1[key];
    for (let key in obj2)
        obj3[key] = obj2[key];
    return obj3;
}
if (typeof process === 'object') {
    var parse = require("csv-parse/lib/sync");
    var iconv = require("iconv-lite");
    var fs = require('fs');
    var assert = require('assert');
    //读取任务模板
    var task_lib_records = parse(iconv.decode(fs.readFileSync(__dirname + '/WeeklyTaskLib.csv'), 'gbk'));
    TASK_LIB = [];
    TASK_LIB.push(null);
    for (let i = 1; i < task_lib_records.length; ++i) {
        var line = task_lib_records[i];
        var type = line[0];
        var count = parseInt(line[1]);
        var failCount = parseInt(line[2]);
        var desc = line[3];
        assert(TASK_LIST1.some(x => x.type === type), `任务类型type一定要有效的,type=${type}`);
        assert(count >= 0, 'count must be number >= 0');
        assert(failCount >= 0 && failCount <= 5, 'failCount must be a number >= 0 && <= 5');
        assert(typeof desc === 'string', 'desc must be a string');
        TASK_LIB.push({ type: type, maxCount: count, failCount: failCount, desc: desc });
    }
    console.log(`读取了${task_lib_records.length - 1}条冒险任务模板`);
    //读取所有任务们
    TASK_SETS = [];
    var currentTaskSet;
    var task_records = parse(iconv.decode(fs.readFileSync(__dirname + '/WeeklyTask.csv'), 'gbk'));
    for (let i = 0; i < task_records.length; ++i) {
        let line = task_records[i];
        if (line[0] === 'id') {
            if (currentTaskSet)
                TASK_SETS.push(currentTaskSet);
            currentTaskSet = {
                id: line[1],
                from: Date.parse(line[3]),
                to: Date.parse(line[5]),
                tasks: []
            };
            assert(currentTaskSet.from >= Date.parse('2000') && currentTaskSet.from <= Date.parse('3000'), 'from 日期必须正确');
            assert(currentTaskSet.to >= Date.parse('2000') && currentTaskSet.to <= Date.parse('3000'), 'from 日期必须正确');
            assert(currentTaskSet.to >= currentTaskSet.from, 'from,to 日期必须正确');
            assert(TASK_SETS.every(x => x.id != currentTaskSet.id), 'id不能有重复的');
        }
        else {
            assert(currentTaskSet);
            let task = TASK_LIB[parseInt(line[0])];
            let prizeObj = {};
            assert(task, '必须是一个有效的任务id');
            if (line[1]) {
                let prizeType = line[1];
                let prizeCount = parseInt(line[2]);
                assert(['coin', 'heart', 'diamond'].indexOf(prizeType) >= 0, '必须是一个有效的奖励类型,type=' + prizeType);
                assert(prizeCount >= 0, '奖励数量必须>=0');
                prizeObj.prizeType = prizeType;
                prizeObj.prizeCount = prizeCount;
            }
            currentTaskSet.tasks.push(merge(task, prizeObj));
        }
    }
    if (currentTaskSet)
        TASK_SETS.push(currentTaskSet);
    console.log('冒险任务：');
    for (let wt of TASK_SETS) {
        console.log(`  id=${wt.id}, ${new Date(wt.from).toLocaleString()} => ${new Date(wt.to).toLocaleString()}, 一共${wt.tasks.length}条任务`);
    }
    exports.initConfig = function (config) {
        config.TASK_SETS = TASK_SETS;
    };
}
else {
    var config = self.__GET_GAME_CONFIG();
    TASK_SETS = config.TASK_SETS;
    if (!TASK_SETS)
        alert('error load weekly task');
}

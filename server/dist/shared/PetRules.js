"use strict";
function getPetLevelUpExp(id, lv) {
    if (lv <= 1)
        return 100;
    if (lv === 2)
        return 200;
    if (lv === 3)
        return 400;
    return 400 + (lv - 3) * 200;
}
exports.getPetLevelUpExp = getPetLevelUpExp;
function getPetSkillLevelUpExp(id, skillLv) {
    if (skillLv <= 1)
        return 1;
    return 1 << (skillLv - 1);
}
exports.getPetSkillLevelUpExp = getPetSkillLevelUpExp;
//返回宠物等级对结算分数的加成
//宠物每增加2级，结算分数增加百分之1.（双数级增加）
function getPetExtraScorePercent(id, lv) {
    if (lv <= 1)
        return 0;
    return (lv >> 1) / 100;
}
exports.getPetExtraScorePercent = getPetExtraScorePercent;
//返回宠物解锁的信息，如果当前等级能够解锁的话
//则返回解锁的金额和解锁的下一级等级
function getPetUnlockData(id, level) {
    let price = [2000, 3000, 4000, 6000, 8000, 10000, 10000, 10000, 10000];
    if (level % 5 === 0 && level > 0 && level < 50) {
        let i = (level / 5 - 1) | 0;
        if (typeof price[i] === 'number') {
            return { price: price[i], nextLevel: level + 5 };
        }
    }
    return null;
}
exports.getPetUnlockData = getPetUnlockData;
exports.PET_MAX_LEVEL = 50;
exports.MAX_PET_COUNT = 27;
if (typeof process === 'object') {
    var parse = require("csv-parse/lib/sync");
    var iconv = require("iconv-lite");
    var fs = require('fs');
    var assert = require('assert');
    var records = parse(iconv.decode(fs.readFileSync(__dirname + '/PetRules.csv'), 'gbk'));
    assert(records.length === exports.MAX_PET_COUNT + 1);
    exports.PET_NAMES = [];
    exports.PET_REAL_COLORS = [];
    exports.PET_BASE_SCORE = [];
    exports.PET_UP_SCORE = [];
    exports.PET_SKILL = [];
    for (let i = 0; i < exports.MAX_PET_COUNT; ++i) {
        let line = records[i + 1];
        exports.PET_NAMES.push(line[0]);
        exports.PET_REAL_COLORS.push(line[1]);
        let skill = parseInt(line[2]);
        let baseScore = parseInt(line[3]);
        let upScore = parseInt(line[4]);
        assert(typeof skill === 'number');
        assert(typeof baseScore === 'number');
        assert(typeof upScore === 'number');
        exports.PET_SKILL.push(skill - 1);
        exports.PET_BASE_SCORE.push(baseScore);
        exports.PET_UP_SCORE.push(upScore);
    }
    exports.initConfig = function (config) {
        config.PET_NAMES = exports.PET_NAMES;
        config.PET_REAL_COLORS = exports.PET_REAL_COLORS;
        config.PET_SKILL = exports.PET_SKILL;
        config.PET_BASE_SCORE = exports.PET_BASE_SCORE;
        config.PET_UP_SCORE = exports.PET_UP_SCORE;
    };
}
else {
    var config = self.__GET_GAME_CONFIG();
    exports.PET_NAMES = config.PET_NAMES;
    exports.PET_REAL_COLORS = config.PET_REAL_COLORS;
    exports.PET_BASE_SCORE = config.PET_BASE_SCORE;
    exports.PET_UP_SCORE = config.PET_UP_SCORE;
    exports.PET_SKILL = config.PET_SKILL;
}

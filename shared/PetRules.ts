export function getPetLevelUpExp(id: number, lv: number)
{
	if (lv <= 1) return 100;
	if (lv === 2) return 200;
	if (lv === 3) return 400;
	return 400 + (lv - 3) * 200;
}

export function getPetSkillLevelUpExp(id: number, skillLv: number) 
{
	if (skillLv <= 1) return 1;

	return 1 << (skillLv - 1);
}

//返回宠物等级对结算分数的加成
//宠物每增加2级，结算分数增加百分之1.（双数级增加）
export function getPetExtraScorePercent(id: number, lv: number) 
{
	if (lv <= 1) return 0;
	return (lv >> 1) / 100;
}

//返回宠物解锁的信息，如果当前等级能够解锁的话
//则返回解锁的金额和解锁的下一级等级
export function getPetUnlockData(id: number, level: number) 
{
	let price = [2000, 3000, 4000, 6000, 8000, 10000, 10000, 10000, 10000];
	if (level % 5 === 0 && level > 0 && level < 50)
	{
		let i = (level / 5 - 1) | 0;
		if (typeof price[i] === 'number')
		{
			return { price: price[i], nextLevel: level + 5 };
		}
	}
	return null;
}

export const PET_MAX_LEVEL = 50;
export const MAX_PET_COUNT = 27;
export var PET_REAL_COLORS: string[]/* = [
	'purple',
	'purple',
	'purple',
	'green',
	'green',
	'green',
	'green',
	'blue',
	'blue',
	'blue',
	'blue',
	'blue',
	'yellow',
	'yellow',
	'yellow',
	'yellow',
	'yellow',
	'red',
	'red',
	'red',
	'red',
	'red',
	'red',
	'red',
	'red',
	'purple',
	'purple',
];*/

export var PET_NAMES: string[]/* = [
	'蛋卷',
	'螃蟹',
	'方块',
	'坚强',
	'泡泡',
	'大眼',
	'菠菜',
	'海洋',
	'二眼',
	'蓝熊',
	'包装袋',
	'救生圈',
	'软绵绵',
	'眼爸爸',
	'爆炸头',
	'莱因',
	'哈特',
	'眼妈妈',
	'哈尼',
	'宝',
	'玫瑰',
	'杜鹃',
	'橙子',
	'水果皮',
	'胖嘟嘟',
	'悠悠',
	'泰坦',
];*/

//注意一下，下面有个map，数字是粘贴过来的，实际应该减1
export var PET_SKILL: number[]/* = [
	5,
	2,
	3,
	4,
	1,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	4,
	15,
	16,
	17,
	18,
	19,
	20,
	21,
	1,
	2,
	15,
	5,
	6,
	7,
].map(x => x - 1);*/
//宠物基础分数
export var PET_BASE_SCORE: number[]/* = [
	51,
	73,
	67,
	59,
	83,
	69,
	69,
	62,
	60,
	70,
	75,
	84,
	87,
	72,
	79,
	78,
	92,
	73,
	85,
	60,
	75,
	78,
	57,
	59,
	54,
	75,
	60,
]*/
//宠物成长分数
export var PET_UP_SCORE: number[]/* = [
	11,
	16,
	13,
	13,
	16,
	12,
	14,
	13,
	11,
	10,
	15,
	18,
	18,
	17,
	16,
	16,
	22,
	16,
	16,
	10,
	16,
	15,
	14,
	13,
	13,
	14,
	13,
]*/

declare var process: any;
declare var require: any;
declare var __dirname: any;
declare var exports: any;
declare var self:any;
if (typeof process === 'object')
{
	var parse = require("csv-parse/lib/sync");
	var iconv = require("iconv-lite");
	var fs = require('fs');
	var assert = require('assert');
	var records = parse(iconv.decode(fs.readFileSync(__dirname + '/PetRules.csv'), 'gbk'));
	assert(records.length === MAX_PET_COUNT + 1);
	PET_NAMES = [];
	PET_REAL_COLORS = [];
	PET_BASE_SCORE = [];
	PET_UP_SCORE = [];
	PET_SKILL = [];
	for (let i = 0; i < MAX_PET_COUNT; ++i)
	{
		let line = records[i + 1];
		PET_NAMES.push(line[0]);
		PET_REAL_COLORS.push(line[1]);
		let skill = parseInt(line[2]);
		let baseScore = parseInt(line[3]);
		let upScore = parseInt(line[4]);
		assert(typeof skill === 'number');
		assert(typeof baseScore === 'number');
		assert(typeof upScore === 'number');
		PET_SKILL.push(skill - 1);
		PET_BASE_SCORE.push(baseScore);
		PET_UP_SCORE.push(upScore);
	}

	exports.initConfig = function (config)
	{
		config.PET_NAMES = PET_NAMES;
		config.PET_REAL_COLORS = PET_REAL_COLORS;
		config.PET_SKILL = PET_SKILL;
		config.PET_BASE_SCORE = PET_BASE_SCORE;
		config.PET_UP_SCORE = PET_UP_SCORE;
	}
}
else
{
	var config = self.__GET_GAME_CONFIG();
	PET_NAMES = config.PET_NAMES;
	PET_REAL_COLORS = config.PET_REAL_COLORS;
	PET_BASE_SCORE = config.PET_BASE_SCORE;
	PET_UP_SCORE = config.PET_UP_SCORE;
	PET_SKILL = config.PET_SKILL;
}
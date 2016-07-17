///<reference path="typings/tsd.d.ts"/>
import assert = require("assert");
import mongodb = require("mongodb");

const COLLECTION_NAME = 'WeeklyScoreList';
const COLLECTION_INDEX = { week: -1, score: -1, _id: -1 }; //需要创建的索引(_id放在最后，使得即使分数相同也会有一个固定的排序)
var db: mongodb.Db;
var WeeklyScoreListCollection: mongodb.Collection;
interface WeeklyScoreObject
{
	_id: string;
	key: string;  //user key
	week: string; //表示是哪个星期
	score: number;
}

/**将时间转换成表示星期的字符串 */
export function toWeekString(t: number)
{
	var d = new Date(t);
	var day = d.getDay();//0 == 星期天
	var minusDay = 0;
	if (day == 0)
	{
		minusDay = 7;
	}
	else
	{
		minusDay = day - 1;
	}
	d.setDate(d.getDate() - minusDay);//日期是可以非法的。Date会自动调整到合理的位置的
	return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function write(key: string, time: number, weekHighScore: number) 
{
	if (!WeeklyScoreListCollection) return;
	var week = toWeekString(time);
	var _id = key + '|' + week;
	var doc: WeeklyScoreObject = {
		_id: _id,
		key: key,
		week: week,
		score: weekHighScore
	};
	WeeklyScoreListCollection.replaceOne({ _id: _id }, doc, { upsert: true }, function (err, ret)
	{
		if (err)
		{
			console.warn(err);
			console.warn('写入周排行失败,doc=', doc);
			return;
		}
		console.log('write ok');
	});
}
/**
 * 获取排名位置
 * result请自行+1，第一名result==0
 */
export function getRankPosition(key: string, time: number, weekHighScore: number, callback: (err: any, result: number) => void) 
{
	if (!WeeklyScoreListCollection)
	{
		process.nextTick(() =>
		{
			callback(new Error('WeeklyScoreListCollection还没有初始化完成'), 0);
		})
		return;
	}
	var week = toWeekString(time);
	WeeklyScoreListCollection.count({ week: week, score: { $gt: weekHighScore } }, function (err, result)
	{
		if (err)
		{
			console.warn(err);
			//这里不要return
		}
		callback(err, result);
	});
}

interface RankListUser
{
	key: string;
	nickname: string;
	faceurl: string;
	score: number;
}
/**
 * 获取排名列表
 */
export function getRankList(callback: (err: any, result: RankListUser[]) => void)
{
	if (!WeeklyScoreListCollection)
	{
		process.nextTick(() => callback(new Error("WeeklyScoreListCollection还没有初始化完成"), null));
		return;
	}
	var week = toWeekString(Date.now());
	WeeklyScoreListCollection
		.find({ week: week }, { key: 1, score: 1 })
		.sort({ score: -1, _id: -1 })
		.limit(10)
		.toArray(function (err, result)
		{
			if (err)
			{
				callback(err, null);
				return;
			}

			var keys = result.map(obj => obj.key);
			db.collection('ball_users')
				.find({ _id: { $in: keys } }, { key: 1, nickname: 1, faceurl: 1 })
				.toArray(function (err, users)
				{
					if (err)
					{
						callback(err, null);
						return;
					}
					var users_object: any = {};
					for (var user of users)
					{
						users_object[user.key] = user;
					}
					for (var i = 0; i < result.length; ++i)
					{
						if (result[i])
						{
							var user = users_object[result[i].key];
							if (user)
							{
								result[i].nickname = user.nickname;
								result[i].faceurl = user.faceurl;
							}
						}
					}
					callback(null, result);
				});
		});
}

function ensureCollection(name)
{
	return new Promise<mongodb.Collection>(function (resolve, reject)
	{
		db.collection(name, (err, coll) =>
		{
			if (err)
			{
				reject(err);
				return;
			}
			db.createCollection(name).then(coll =>
			{
				coll['ensureIndex'](COLLECTION_INDEX, null, (err, result) =>
				{
					if (err)
					{
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

export function init(_db)
{
	db = _db;
	ensureCollection(COLLECTION_NAME).then(coll =>
	{
		console.log('初始化排名榜成功');
		WeeklyScoreListCollection = coll;
	}).catch(err =>
	{
		console.log('初始化数据库排名表失败', err);
		process.exit(1);
	})
}


global['RankListDB'] = module.exports;
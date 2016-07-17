///<reference path="typings/tsd.d.ts"/>
import assert = require("assert");
import mongodb = require("mongodb");
import RankListDB = require("./RankListDB")
var easyM = require("easy-mongo");
let mongo_str = require("yargs").argv.mongo;

var dbp = new easyM.DbProvider();
let g_db: {
	ball_users: mongodb.Collection,
	db: mongodb.Db
} = null;
let g_AllDBObject: {
	[key: string]: Promise<IDBUser> | IDBUser
} = {};
export const MAX_FRIEND_COUNT = 50;

if (!mongo_str)
{
	mongo_str = 'mongodb://127.0.0.1/db';
}

if (mongo_str.substr(0, 7) !== 'mongodb')
{
	mongo_str = 'mongodb' + mongo_str;
}
console.log('连接数据库:', mongo_str);
dbp.init(mongo_str, {
	exists: [{
		'ball_users': {
			index: 'nickname'
		}
	}]
},
	function (err, db)
	{
		if (err)
		{
			console.error('数据库初始化失败');
			process.exit(100);
			return;
		}
		console.log('数据库初始化成功');
		g_db = db;
		RankListDB.init(db.db);
		global['db'] = db;
	});

export function searchUser(name: string)
{
	if (!g_db) Promise.reject(new Error('数据库还没有初始化完成'));
	let keywords = '\\()[].*+?/^$|=';
	let re_name = '^';
	for (let i = 0; i < name.length; ++i)
	{
		let c = name[i];
		if (keywords.indexOf(c) >= 0)
		{
			re_name += '\\' + c;
		}
		else
		{
			re_name += c;
		}
	}

	return g_db.ball_users.find({ nickname: { '$regex': re_name } }, { _id: 1, nickname: 1, faceurl: 1 }).limit(100).toArray();
}

export function getUserByNickname(nickname: string)
{
	return g_db.ball_users.findOne({ nickname: nickname });
}

export function getUser(key: string, create?: boolean): Promise<IDBUser> 
{
	let obj = g_AllDBObject[key];
	if (obj)
	{
		if (obj instanceof Promise) return obj;
		initUser(obj as IDBUser);
		return Promise.resolve(obj);
	}

	obj = new Promise<IDBUser>(function (resolve, reject)
	{
		if (!g_db)
		{
			g_AllDBObject[key] = null;
			reject(new Error('数据库还没有初始化完成'));
			return;
		}
		easyM.createDbJson(g_db, { col: dbp.ball_users, key: key, alwayscreate: create }, (err, obj) =>
		{
			if (err)
			{
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
	return obj as Promise<IDBUser>;
}

export interface IDBPetInfo
{
	id: number;
	level: number;
	exp: number;
	lockedLv: number;//当前等级上限（需要花金币解锁的）
	skillLv: number;
	skillExp: number;
}

export type DBMailType = 'coin' | 'diamond' | 'heart' | 'addFriend';

export interface IDBMail
{
	id: number;
	type: DBMailType;
	count: number;
	text: string;
	time: number;
	fromKey?: string; //如果type是addFriend，则这个是要添加的好友
	fromKeyFace?: string;
}

export interface IDBWeeklyTask
{
	status: "running" | "satisfied" | "end";//running进行中，statisfied完成但是没有领取奖励，end完全结束了
	type: string;
	param?: any;  //可选的任务参数。对于有X的任务X指的就是这个
	count: number;//当前累计了几次了
	maxCount: number;
	fail: number;//当前失败次数
	failCount: number;
	prizeType: string;
	prizeCount: number;
	desc: string;//desc和上面的maxCount，failCount等数据，虽然和配置文件里重复了，但是还是保存一下好了。方便一点.
}

export interface IDBFriend
{
	key: string;
	lastSendHeartTime?: number;
}

export interface IDBUser
{
	key: string;     //[usertype]username
	usertype: string;//可能是custom,qq,wechat等等。
	username: string;
	password: string;
	nickname: string;
	faceurl: string;

	coin: number;
	diamond: number;
	heart: number;        //红心个数
	nextHeartTime: number;//下一个红心的时间。(utc timestamp, Date.now())
	//玩家的宠物
	//数组的小标就是宠物id
	//保存成稀疏数组，空则表示没有这个宠物
	pets: IDBPetInfo[];
	//当前携带的宠物id，id就是下标
	currentPet: number;

	historicalHighScore: number;
	historicalHighScoreDate: number;
	weekHighScore: number;
	weekHighScoreDate: number;
	//邮件
	nextMailId: number;
	mails: IDBMail[];
	//每日任务
	dailyTask: any;       //==null表示没有初始化过，或者今天的任务都已经完成了。
	dailyTaskTime: number;
	todayDailyTask: any[];//每次生成task的时候，会push一个id进入。也就是说，最后一个是当前正在做的任务id（当dailyTask!=null的时候）

	//周任务
	weeklyTaskId: any;    //如果id和服务器当前的任务id不匹配则清空任务信息
	weeklyTasks: IDBWeeklyTask[];

	friends: IDBFriend[];

	//一些游戏历史数据
	maxCombo: number;  //最大连接
	maxLink: number;   //最大连接数量
	totalKill: number; //总共消除果冻数

	//是否玩过了教程，如果没有，则第一次登陆的时候自动开启教程
	tutorial?: boolean;

	//每日登录奖励的时间。在登陆的时候检查一下，如果超过了一天，则发放奖励
	previousEverydayGiftTime?: number;

	//对于只能购买一次的物品，记录下来，使得下一次就不能买了
	boughtItems?: string[];

	sendHeartCount: number;     //为了每天只能送20个红心
	sendHeartCountTime: number; //上面count代表的是哪一天

	recvHeartCount: number;      //为了每天只能收50个，从好友那里发送来的体力
	recvHeartCountTime: number;  //上面count代表的是哪一天

	currentGame: any;

	//用来作各种活动的标记的。比如，收到过某邮件的话，则不再收啦之类的
	eventTags: any;
}

function addDefaultPet(user: IDBUser, idx: number)
{
	if (!user.pets[idx])
	{
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
function fixPet(i: number, obj: IDBPetInfo) 
{
	if (!obj) return;
	//如果 obj[name]不是数字，或没有大于val， 则设置成val
	let fixNumber = (obj, name, val) =>
	{
		if (typeof obj[name] !== 'number' || !(obj[name] >= val))
			obj[name] = val;
	};
	if (obj.id !== i) obj.id = i;
	fixNumber(obj, 'level', 1);
	fixNumber(obj, 'exp', 0);
	fixNumber(obj, 'skillLv', 1);
	fixNumber(obj, 'skillExp', 0);
	fixNumber(obj, 'lockedLv', 5);
}
//其实就是用来修复和初始化db数据的
export function initUser(user: IDBUser) 
{
	//setNumber: 如果obj[name]不是数字，则设置成默认值val
	let setNumber = (obj, name, val) => { if (typeof obj[name] !== 'number') obj[name] = val; };
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
	if (!Array.isArray(user.pets)) user.pets = [];
	for (let i = 0; i < 1; ++i)
	{
		addDefaultPet(user, i);
	}

	for (let i = 0; i < user.pets.length; ++i)
	{
		let pet = user.pets[i];
		if (pet) fixPet(i, pet);
	}
	//修复一下，当前选中的宠物
	if (!user.pets[user.currentPet])
	{
		user.currentPet = 0;
	}

	//mails
	if (!Array.isArray(user.mails))
	{
		user.mails = [];
	}

	if (!Array.isArray(user.friends))
	{
		user.friends = []
	}
	if (typeof user.eventTags !== 'object')
	{
		user.eventTags = {};
	}
}
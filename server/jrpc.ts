import os = require("os");
import {GameUser} from "./GameUser"

let jrpclib = require('jrpc-client');
let jrpc = null;
let ss = require("yargs").argv.ss;

export const PRODUCT_NAME = "BallyBallyCrash!";
export const PLATFORM_ID = 0;
export const SERVER_ID = 0;

if (ss)
{
	jrpc = new jrpclib();
	console.log('开始连接统计服务器：' + ss);
	jrpc.on('connected', () =>
	{
		console.log('成功连接统计服务器');
	});
	jrpc.on('error', (e) =>
	{
		console.error('统计服务器错误', e);
	})
	jrpc.connect(ss);
}

export function serverData(ip, port)
{
	call("serverdata", {
		productName: PRODUCT_NAME, $: {
			upsert: {
				c: { platformID: PLATFORM_ID, serverID: SERVER_ID }, set: {
					clusterID: PLATFORM_ID + '_' + SERVER_ID, data: {
						ip: ip,
						port: port
					}, time: new Date()
				}
			}
		}
	});
}

//type JRPC_NAMES = "onlineCount"|"recharge"|"userin"|"userkickstartevent"|"serverdata";

export function call(name: string, obj: any) 
{
	if (jrpc)
	{
		jrpc.call(name, obj);
	}
}

export function gameStart(usertype: string, key: string, gameid: string, heart: number, useCoin: number, pet: number)
{
	call('game', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
		userID: key,
		gameid: gameid,
		time: new Date(),
		type: 'start',
		obj: {
			heart,
			useCoin,
			pet
		}
	});
}

export function gameCancel(usertype: string, key: string, id: string, positive: boolean) 
{
	call('game', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
		userID: key,
		gameid: id,
		time: new Date(),
		type: 'cancel',
		obj: {
			positive //玩家主动取消游戏
		}
	})
}

export function gameEnd(usertype: string, key: string, id: string, result: any)
{
	call('game', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
		userID: key,
		gameid: id,
		time: new Date(),
		type: 'end',
		obj: result
	});
}

export function userin(usertype: string, userid, userAgent) 
{
	call('userin', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
		userID: userid,
		accID: userid,
		name: userid,
		time: new Date(),
		agent: userAgent,
	});
}


export function userreg(usertype: string, userid, url, parentUser, userAgent)
{
	call('userkickstartevent', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
		userID: userid,
		accID: userid,
		name: userid,
		kickoffEventID: 'regCharacter',
		comesfrom: parentUser,
		time: new Date(),
		agent: userAgent
	});
}

export function userreg_after_1_minute(usertype: string, userid, url, parentUser, userAgent)
{
	call('userkickstartevent', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
		userID: userid,
		accID: userid,
		name: userid,
		kickoffEventID: 'createCharacter',
		comesfrom: parentUser,
		time: new Date(),
		agent: userAgent
	});
}


export function userout(usertype: string, userid, duration)
{
	call('userout', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverid: SERVER_ID,
		time: new Date(),
		accID: userid,
		userID: userid,
		name: userid,
		duration: duration,
	});
}

export function recharge(order, userid, amount, value, nick)
{
	call("recharge", {
		productName: PRODUCT_NAME,
		platformID: PLATFORM_ID,
		serverID: SERVER_ID,
		order,
		userID: userid,
		accID: userid,
		amount,
		value,
		stat: 'no stat is success',
		time: new Date(),
		name: nick,
		total: 0,
	});
}

export function weeklyTaskEnd(user: GameUser, task) 
{
	let taskid = task.desc;
	call("task", {
		productName: PRODUCT_NAME,
		platformID: user.dbuser.usertype,
		serverID: SERVER_ID,
		time: new Date(),
		account: user.key,
		name: user.dbuser.nickname,
		accID: user.key,
		userID: user.key,
		taskid: taskid,
	});
}

export const CONSUME_TYPE_GAME_ITEM = 1000;
export const CONSUME_TYPE_UNLOCK_PET = 100;
export const CONSUME_TYPE_BUY_GIFT = 2000;

export const CONSUME_TYPE_BUY_HEART = 101;
export const CONSUME_TYPE_BUY_COIN = 102;
export const CONSUME_TYPE_GAME_OTHER = 103;

export function consumedataEx(usertype: string, userid: string, nick: string, type: number, amount: number, productCount: number, total: number, msg: string) 
{
	let rmb = 0;
	let free = 0;
	if ([CONSUME_TYPE_BUY_HEART, CONSUME_TYPE_BUY_COIN, , CONSUME_TYPE_GAME_OTHER].indexOf(type) >= 0)
	{
		rmb = amount;
	}
	else
	{
		free = amount;
	}
	call('consumedata', {
		productName: PRODUCT_NAME,
		platformID: usertype,
		serverID: SERVER_ID,
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
export function onlinecount(count)
{
	call('onlinecount', {
		productName: PRODUCT_NAME,
		platformID: PLATFORM_ID,
		serverID: SERVER_ID,
		time: new Date(),
		count: count
	});
}
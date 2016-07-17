//所有和支付有关的东西在这里
///<reference path="typings/tsd.d.ts"/>
import * as fs from "fs"
import express = require('express');
import * as crypto from "crypto"
import * as qs from "querystring"
import * as urllib from "url"
import {GameServer} from "./GameServer"
import {GameUser} from "./GameUser"
import * as jrpc from "./jrpc"
const cashlog_stream = fs.createWriteStream("cashlog.txt", { encoding: "utf8" });
function logPayEnd(req: express.Request)
{
	if (req)
	{
		let str = `[payend][${req.method}]body=${JSON.stringify(req.body)}`;
		cashlog_stream.write(str);
		cashlog_stream.write('\r\n');
		console.info(str);
	}
}

function logPayEndError(req: express.Request, str: string)
{
	cashlog_stream.write('[payend][ERROR]' + str);
	console.error('[payend][ERROR]' + str);
}

function md5(str)
{
	let hh = crypto.createHash('md5');
	hh.update(str, 'utf8');
	return hh.digest('hex');
}



export function generatePaymentUrl(user: GameUser, userkey: string, money: number, info: string, diamond: number, backUrl?: string) 
{
	let req = user && user.socket && user.socket.upgradeReq;
	let callback_url = 'http://h5.1357g.com:29999/payend'
	if (req)
	{
		let origin = req.headers['origin'];
		if (typeof origin === 'string')
		{
			callback_url = origin + '/payend';
		}
	}
	backUrl = backUrl || 'http://h5.1356g.com:29999/'
	let parsedBackUrl = urllib.parse(backUrl);

	let qsObject: any = {
		info: info,
		userkey: userkey,
		username: user.dbuser.nickname,
		money: money,
		spbill_ip: '210.73.218.174',
		url: callback_url,
		backurl: parsedBackUrl.protocol + '//' + parsedBackUrl.host + parsedBackUrl.pathname,
		amount: money,
		autologin: 1,
		diamond: diamond,
		paytype: '支付宝'
	};
	let url = 'http://casher.h5.1357g.com/test.html?' + qs.stringify(qsObject) + '&' + parsedBackUrl.query;
	//console.log('cash::backurl = ' + qsObject.backurl);
	return url;
}

export function pay_end_express_handler(): express.RequestHandler
{
	return (req, resp) =>
	{
		logPayEnd(req);
		let body = req.body;
		if (!body.userkey)
		{
			logPayEndError(req, "userkey missing");
			resp.status(500).end();
			return;
		}

		if (!body.diamond)
		{
			logPayEndError(req, "diamond missing");
			resp.status(500).end();
			return;
		}

		let diamond = parseInt(body.diamond);
		if (!(diamond > 0))
		{
			logPayEndError(req, `invalid diamond = ${body.diamond}`);
			resp.status(500).end();
			return;
		}


		let somekeyMissing = false;
		for (let key of ['diamond', 'money', 'username', 'md5info'])
		{
			if (!body[key])
			{
				logPayEndError(req, `${key} missing`);
				somekeyMissing = true;
			}
		}
		if (somekeyMissing)
		{
			resp.status(500).end();
			return;
		}
		let hash = md5(body.orderid + body.money + body.username + 'nxdxdmd5');
		if (hash != body.md5info)
		{
			logPayEndError(req, "hash error");
			resp.status(500).end();
			return;
		}
		jrpc.recharge(body.orderid, body.userkey, diamond, body.money, body.username);
		console.log(`pay success,diamond = ${diamond}`);
		GameServer.instance.addDiamond(body.userkey, diamond | 0, (err) =>
		{
			if (err)
			{
				logPayEndError(req, '错误添加钻石：' + err);
				return;
			}
		});
	};
}
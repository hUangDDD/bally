///<reference path="typings/tsd.d.ts"/>
import * as express from "express"
import * as crypto from "crypto"
import * as DBUser from "./DBUser"
import {GameServer} from "./GameServer"
var SIGN_KEY = '12fj c94yrm98xnyuet9nfcn dhnj fj g dgkjv hskjhf ';

function calcSign(obj)
{
	var keys = Object.keys(obj);
	keys.sort();
	var s = SIGN_KEY;
	for (let key of keys)
	{
		if (key === 'sign') continue;
		s += key + obj[key];
	}
	return crypto.createHash('md5').update(s, 'utf8').digest('hex');
}

export function query_user_info_handler(): express.RequestHandler
{
	return (req, resp) =>
	{
		let q = req.query;
		if (q.sign !== calcSign(q))
		{
			resp.status(500).end('sign error');
			return;
		}

		function onGetUser(user)
		{
			resp.json({
				success: true,
				user: user
			});
		}

		function onError(e)
		{
			resp.json({
				success: false,
				message: e.message
			});
		}

		var userid = q.userid;
		if (typeof userid === 'string')
		{
			DBUser.getUser(userid, false).then(onGetUser).catch(onError);
			return;
		}
		if (typeof q.nickname === 'string')
		{
			DBUser.getUserByNickname(q.nickname).then(onGetUser).catch(onError);
			return;
		}
		resp.status(500).end('param error');
	}
}

export function add_mail_handler(): express.RequestHandler 
{
	return (req, resp) =>
	{
		let q = req.query;
		if (q.sign !== calcSign(q))
		{
			resp.status(500).end('sign error');
			return;
		}
		let userid = q.userid;
		let type = q.type;
		let count = parseInt(q.count);
		let message = q.message;
		if (typeof userid !== 'string')
		{
			resp.status(500).end('userid error');
			return;
		}

		if (['coin', 'diamond', 'heart'].indexOf(type) < 0)
		{
			resp.status(500).end('type error');
			return;
		}

		if (!(count > 0))
		{
			resp.status(500).end('count error');
			return;
		}
		if (typeof message !== 'string')
		{
			resp.status(500).end('message error');
			return;
		}
		GameServer.instance.addMail(userid, type, count, message, function (err)
		{
			if (!err)
			{
				resp.json({ success: true });
				return;
			}
			resp.json({ success: false, message: err.toString() });
		});
	};
}
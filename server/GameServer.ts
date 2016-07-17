///<reference path="GameMatch.ts"/>

import WebSocket = require("ws");
import assert = require('assert');
import DBUser = require("./DBUser");
import objectutil = require("./objectutil");
import {GameUser, IFriendInfo} from "./GameUser"
import {MatchGameServer} from "./MatchGameServer"
import * as jrpc from "./jrpc"
import * as util from "./util"



type SocketStatus = 'pending' | 'logining' | 'logined' | 'closed';

function parseJson(message)
{
	if (typeof message !== 'string') return undefined;
	try
	{
		return JSON.parse(message);
	}
	catch (e)
	{
		return undefined;
	}
}

export interface MyWebSocket extends WebSocket
{
	_connectionTime: number;
	_socketStatus: SocketStatus;
	_user: IGameUser;
	sendPacket: (obj: any) => void;
}

export interface IGameUser
{
	onMessage(obj: any);
	close();
	socket: MyWebSocket;
	key: string;
}

export class GameServer
{
	_webSocketServer: WebSocket.Server;
	//socket that not logined
	_pendingSocket: WebSocket[] = [];
	_loginedUser: { [key: string]: GameUser } = {};
	_loginedUserCount = 0;
	matchServer: MatchGameServer = new MatchGameServer(this);
	static instance: GameServer;

	constructor(server?)
	{
		GameServer.instance = this;
		global['gs'] = this;
		this._webSocketServer = WebSocket.createServer({ server });
		this._webSocketServer.on('connection', (socket) =>
		{
			global['lastSocket'] = socket;
			let ipport = '';
			if (socket['_socket'])
			{
				if (socket.upgradeReq && socket.upgradeReq.headers)
				{
					ipport = socket.upgradeReq.headers['x-real-ip'] || socket.upgradeReq.headers['x-forwarded-for'] || '';
				}
				if (!ipport)
				{
					ipport = socket['_socket'].remoteAddress + ':' + socket['_socket'].remotePort;
				}
			}
			console.log('someone connect', socket.upgradeReq.url, ipport);

			this._onConnection(socket as MyWebSocket);
		});
		setInterval(() =>
		{
			jrpc.onlinecount(this._loginedUserCount);
		}, 60 * 1000);

		setInterval(() => { this.matchServer.onTimer() }, 1000);
	}

	private _onConnection(socket: MyWebSocket)
	{
		socket['_connectionTime'] = Date.now();
		socket['_socketStatus'] = 'pending';
		socket.on('message', data =>
		{
			this._onMessage(socket, data);
		});
		socket.on('close', (code, message) => { this._onClose(socket, code, message); });
		socket.on('error', (e) => { this._onError(e); });
		socket.sendPacket = obj =>
		{
			this.send(socket, obj);
		}
	}

	private _onMessage(socket: MyWebSocket, message)
	{
		let status = socket._socketStatus;
		switch (status)
		{
			case 'pending':
				socket._socketStatus = 'logining';
				let loginObject = parseJson(message);
				this._handleLoginMessage(socket, loginObject, (success, msgOrKey, user) =>
				{
					if (socket._socketStatus !== 'logining')
					{
						if (user) user.close();
						this.close(socket);
						return;
					}
					if (!success)
					{
						this.send(socket, { cmd: 'login', success: false, msg: msgOrKey });
						this.close(socket);
						console.info(`登陆失败,${msgOrKey}`);
						return;
					}

					if (!(user as GameUser).dbuser.tutorial)
					{
						jrpc.userreg((user as GameUser).dbuser.usertype, msgOrKey, '', loginObject.from, loginObject.agent + "");
						setTimeout(() =>
						{
							if (this._loginedUser[msgOrKey] === user)
							{
								jrpc.userreg_after_1_minute((user as GameUser).dbuser.usertype, msgOrKey, '', loginObject.from, loginObject.agent + "");
							}
						}, 60 * 1000);
					}
					jrpc.userin((user as GameUser).dbuser.usertype, msgOrKey, loginObject.agent + "");
					let key = msgOrKey;
					let loginedUser = this._loginedUser;
					if (key in loginedUser)
					{
						console.log(`${key}重复登陆，踢掉`);
						this.close(loginedUser[key].socket, 4008, '同样的用户登陆了');//4000-4999 Available for use by applications.
					}
					assert(!loginedUser[key]);
					assert(user);
					assert(key === user.key);
					loginedUser[key] = user as GameUser;
					socket._user = user;
					socket._socketStatus = 'logined';
					++this._loginedUserCount;
					console.info(`${key} 登陆成功`);
					(user as GameUser).sendLoginSuccess(loginObject);
				});
				break;
			case 'logining':
				this.close(socket);
				break;
			case 'logined':
				if (socket._user)
				{
					let obj = parseJson(message);
					if (obj === undefined)
					{
						this.close(socket);
						return;
					}
					socket._user.onMessage(obj);
				}
				break;
			case 'closed':
				return;
			default:
				this.close(socket);
				return;
		}
	}

	private _onError(e)
	{
		console.log('SOCKET ERROR:', e);
	}

	private _onClose(socket: MyWebSocket, code, msg)
	{
		console.log('client socket closed.');
		this.close(socket);
	}

	private _handleLoginMessage(socket: MyWebSocket, obj: any, callback: (success: boolean, msgOrKey?: string, user?: IGameUser) => any)
	{
		console.log('handleLoginMessage', obj);
		let callLoginError = (msg) =>
		{
			process.nextTick(() =>
			{
				callback(false, msg);
			});
		};
		if (!obj)
		{
			callLoginError('参数错误');
			return;
		}
		let cmd = obj.cmd;
		if (cmd === 'login')
		{
			if (typeof obj.type === 'string')
			{
				if (!objectutil.checkObjectMemberType(obj, ['enuid', 'face', 'nickname'], 'string'))
				{
					callLoginError('参数错误');
					return;
				}
				let key = '[' + obj.type + ']' + obj.enuid;
				DBUser.getUser(key, true).then(dbuser =>
				{
					dbuser.usertype = obj.type;
					dbuser.nickname = obj.nickname;
					dbuser.faceurl = obj.face;
					process.nextTick(() => { callback(true, key, new GameUser(dbuser, socket, this)) });
				}, err => { callLoginError('数据库错误') });
				return;
			}

			//验证参数
			if (!objectutil.checkObjectMemberType(obj, ['username', 'password'], 'string') ||
				obj.username.length <= 0 || obj.password.length <= 0)
			{
				callLoginError('参数错误');
				return;
			}
			//数据库
			let key = `[custom]` + obj.username;
			DBUser.getUser(key, false).then(dbuser =>
			{
				if (dbuser.password !== obj.password)
				{
					callLoginError('密码错误');
					return;
				}
				dbuser.usertype = 'custom';
				process.nextTick(() => { callback(true, key, new GameUser(dbuser, socket, this)) });
			}, err =>
				{
					callLoginError('该用户不存在');
				});
		}
		else if (cmd === 'register')
		{
			//验证参数
			if (!objectutil.checkObjectMemberType(obj, ['username', 'password'], 'string') ||
				obj.username.length <= 0 || obj.password.length <= 0)
			{
				callLoginError('参数错误');
				return;
			}
			let key = '[custom]' + obj.username;
			DBUser.getUser(key, true).then(dbuser =>
			{
				if (dbuser.username)
				{
					callLoginError('注册失败，该用户已经存在');
					return;
				}
				dbuser.username = obj.username;
				dbuser.nickname = obj.username;
				dbuser.password = obj.password;
				process.nextTick(() => { callback(true, key, new GameUser(dbuser, socket, this)) });
			}, err =>
				{
					callLoginError('数据库错误');
				})
		}
		else
		{
			callLoginError('参数错误cmd');
			return;
		}
	}

	send(socket: MyWebSocket, obj?)
	{
		if (socket._socketStatus === 'closed') return;
		try
		{
			let s = JSON.stringify(obj);
			socket.send(s);
		}
		catch (e)
		{

		}
	}

	close(socket: MyWebSocket, code?, msg?)
	{
		if (!socket) return;
		if (socket._socketStatus === 'closed') return;
		console.log(`someone closed,${socket._user ? socket._user.key : '<unknown>'}`);
		if (socket._user)
		{
			this.matchServer.onLinkLost(socket._user as GameUser);
			socket._user.close();
			if (socket._user === this._loginedUser[socket._user.key])
			{
				jrpc.userout(this._loginedUser[socket._user.key].dbuser.usertype, socket._user.key, Date.now() - (socket._user as GameUser).inTime);
				delete this._loginedUser[socket._user.key];
				--this._loginedUserCount;
			}
		}
		let idx = this._pendingSocket.indexOf(socket)
		if (idx >= 0)
		{
			this._pendingSocket.splice(idx, 1);
		}

		try
		{
			socket.close(code, msg);
		}
		catch (e)
		{
		}
	}

	/**
	 * 输入用户的key，返回用户的分数信息，不会出错，如果出错的话，就是null
	 */
	queryUserScores(userKeys: string[], callback: (users: IFriendInfo[]) => void)
	{
		let wantCount = userKeys.length;
		let ret = new Array(wantCount);
		function check()
		{
			if (wantCount === 0)
			{
				process.nextTick(function ()
				{
					callback(ret);
				})
			}
		}
		function setIt(i, user: DBUser.IDBUser)
		{
			let obj = null;
			if (user)
			{
				obj = {
					key: user.key,
					nickname: user.nickname,
					weekHighScore: user.weekHighScore | 0,
					historicalHighScore: user.historicalHighScore | 0,
					currentPet: user.currentPet | 0,
					faceurl: user.faceurl
				};

				if (typeof user.weekHighScoreDate === 'number')
				{
					let now = new Date();
					if (!isSameWeek(new Date(user.weekHighScoreDate), now))
					{
						obj.weekHighScore = 0;
					}
				}

			}
			ret[i] = obj;
			wantCount--;
			check();
		}
		check();
		//let 是必须的，在这里
		for (let i = 0; i < userKeys.length; ++i)
		{
			if (this._loginedUser[userKeys[i]])
			{
				let u = this._loginedUser[userKeys[i]];
				setIt(i, u.dbuser);
			}
			else
			{
				let succ = user => setIt(i, user);
				let err = e => setIt(i, null);
				DBUser.getUser(userKeys[i], false).then(succ, err);
			}
		}
	}

	addMail(key: string, type: DBUser.DBMailType, count: number, text: string, callback: (err: any) => void, extraData?: any)
	{
		let user = this._loginedUser[key];
		if (user)
		{
			user.addMail(type, count, text, extraData);
			process.nextTick(callback);
			return;
		}

		DBUser.getUser(key, false).then(user =>
		{
			let mail = { id: user.nextMailId, type, count, text, time: Date.now() };
			if (typeof extraData === 'object')
			{
				for (var key in extraData)
				{
					mail[key] = extraData[key];
				}
			}
			util.safePush(user, 'mails', mail);
			++user.nextMailId;
			callback(null);
		}, err => callback(err || new Error("get user error")));
	}

	addDiamond(key: string, amount: number, callback: (err: any) => void)
	{
		let user = this._loginedUser[key];
		if (user)
		{
			user.dbuser.diamond += amount;
			user.sendBasicInfo();
			process.nextTick(callback);
			return;
		}
		DBUser.getUser(key, false).then(user =>
		{
			user.diamond += amount;
			callback(null);
		}, err => callback(err || new Error("get user error")));
	}

	/**
	 * 请求添加好友
	 */
	userRequestAddFriend(me: GameUser, friendKey: string, callback: (success: boolean) => void)
	{
		let nextCallback = (ret) => { if (callback) process.nextTick(() => callback(ret)); };
		if (friendKey === me.key)
		{
			nextCallback(false);
			return;
		}
		//邮箱中是不是已经有请求邮件啦
		let hasAddFriendMail = (db: DBUser.IDBUser, key: string) =>
		{
			return db.mails.some(m =>
				m && m.type === 'addFriend' && m.fromKey === key
			);
		}
		let guser = this._loginedUser[friendKey];
		let text = `${me.dbuser.nickname}请求添加你为好友`;
		//如果在线
		if (guser)
		{
			if (hasAddFriendMail(guser.dbuser, me.key)) //已经有请求了
			{
				nextCallback(false);
			}
			else
			{

				guser.addAddFriendMail(me.key, text, me.dbuser.faceurl);
				nextCallback(true);
			}

		}
		//如果不在线
		else
		{
			DBUser.getUser(friendKey, false).then(user =>
			{
				if (hasAddFriendMail(user, me.key))
				{
					nextCallback(false);
				}
				else
				{
					let mail = { id: user.nextMailId, type: 'addFriend', count: 0, text, time: Date.now(), fromKey: me.key, fromKeyFace: me.dbuser.faceurl };
					util.safePush(user, 'mails', mail);
					++user.nextMailId;
					nextCallback(true);
				}
			}).catch(e =>
			{
				nextCallback(false);
			})
		}
	}

	/**
	 * me 请求添加好友 friendKey
	 * me:      一个在线的玩家GameUser
	 * friend： 在线或离线的玩家，GameUser或DBUser
	 * 在friend的GameUser或DBUser中添加me为好友. 如果friend是在线的，则需要通知客户端好友被删除了
	 */
	requestAddFriend(me: GameUser, friendKey: string, callback: (success: boolean) => void)
	{
		if (me.key === friendKey)
		{
			process.nextTick(() => callback(false));
			return;
		}

		let guser = this._loginedUser[friendKey];
		if (guser)
		{
			process.nextTick(() => callback(true));
			guser._addFriendOnline(me);
		}
		else
		{
			//在friend中添加me.key
			DBUser.getUser(friendKey, false).then(user =>
			{
				let ff = user.friends; //getUser保证了friends一定是数组的
				let hasuser = false;
				for (let f of ff)
				{
					if (f && f.key === me.key)
					{
						hasuser = true;
						break;
					}
				}
				if (!hasuser && ff.length < DBUser.MAX_FRIEND_COUNT)
				{
					ff.push({ key: me.key });

				}
				callback(true);
			}, e => callback(false)
			);
		}
	}
	/**同上，但是是删除好友 */
	requestRemoveFreind(me: GameUser, friendKey: string, callback: (success: boolean) => void)
	{
		if (me.key === friendKey)
		{
			process.nextTick(() => callback(false));
			return;
		}
		let guser = this._loginedUser[friendKey];
		if (guser)
		{
			process.nextTick(() => callback(true));
			guser._removeFriendOnline(me);
		}
		else
		{
			//在friend中把me.key删除
			DBUser.getUser(friendKey, false).then(user =>
			{
				let ff = user.friends;
				for (let i = 0; i < ff.length; ++i)
				{
					if (ff[i].key === me.key)
					{
						ff.splice(i, 1);
						callback(true);
						return;
					}
				}
				callback(false);
			}, e => callback(false));
		}
	}

	getUserForRead(key: string): Promise<DBUser.IDBUser>
	{
		if (this._loginedUser[key])
		{
			return Promise.resolve(this._loginedUser[key].dbuser);
		}
		return DBUser.getUser(key, false);
	}
	kick(user: GameUser, reason)
	{
		this.close(user.socket);
	}
}


//d1,d2 是不是同一个星期的，需要保证d1 < d2
function isSameWeek(d1: Date, d2: Date) 
{
	let t1 = d1.getTime();
	let t2 = d2.getTime();
	//超过了七天，则一定不是同一个星期了
	if (Math.abs(t2 - t1) >= 7 * 24 * 3600 * 1000)
	{
		return false;
	}

	//如果d2 > d1, 则交换一下
	if (t1 > t2)
	{
		let tmp = d2;
		d2 = d1;
		d1 = tmp;
	}
	//getDay() == 0 星期天，所以把星期天变成 7，因为一个星期从星期一开始的
	let day1 = d1.getDay(); if (day1 === 0) day1 = 7;
	let day2 = d2.getDay(); if (day2 === 0) day2 = 7;
	return day1 <= day2;
}
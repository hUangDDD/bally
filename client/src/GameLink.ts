import {GameStage} from "./GameStage"
import {IGameStartInfo} from "./game/Game"
import * as GameItemDefine from "../../shared/GameItemDefine"
import * as LoginUI from "./LoginUI"
import {HallUI} from "./hall/HallUI"
import * as PetRules from "../../shared/PetRules"
import * as DT from "../../shared/DailyTaskDefine"
import * as util from "./util"
import * as share from "./ShareFunctions"
export interface IPetInfo
{
	idx: number;
	skill: number; /**技能等级 */
	skillExp: number;
	skillExpTotal: number;
	level: number;
	maxLevel: number;
	exp: number;
	expTotal: number;
	unlockPrice?: number;
	fake?: boolean;
}

export interface IFriendInfo
{
	key: string;
	nickname: string;
	weekHighScore: number;
	historicalHighScore: number;
	currentPet: number;
	canSendHeart?: boolean;
	faceurl?: string;
}
const MAX_RECONNECT_COUNT = 3;
export class GameLink
{
	static instance: GameLink;

	//basic info
	key = "";
	coin = 0;
	diamond = 0;
	heart = 0;
	nextHeartTime = 0;
	currentPet = -1;
	pets = [];
	weekHighScore = 0;
	historicalHighScore = 0;
	nickname = "";
	faceurl = "";
	boughtItems: string[] = [];
	matchPlayers: any[] = []; //对战模式时，保存了其它玩家的数据，头像什么的
	weekRankPosition = -1;    //周排行
	private _logining = false;
	private _logined = false;
	private _socket: WebSocket;
	private _loginPacket: any;
	private _currentUsername: string;
	private _currentPassword: string;
	private _requestingStartGame = false;
	private _reconnectCount = 0; //重新连接次数
	private _isReconnecting = false;
	//在link中缓存的mail数据
	private _mailCount = 0;
	private _mails: any[];
	private _weeklyTasks: any[];
	private _loginErrorMsg: string;
	private _friendList: IFriendInfo[];
	private _isBuyingGift = false;
	private _isSearchingFriend = false;
	private _weekRankList: any[] = null;
	private _weekRankListQuried = false;
	get friendList() { return this._friendList; }
	get loginType() { return this._loginType; }

	constructor()
	{
		GameLink.instance = this;
		window['link'] = this;
		LoginUI.hide();
		LoginUI.setText("");
		LoginUI.enableInput(true);

		let username = localStorage.getItem('loginpanel.username');
		let password = localStorage.getItem('loginpanel.password');
		if (username) LoginUI.setUsername(username);
		if (password) LoginUI.setPassword(password);

		let onClickButton = (isReg) =>
		{
			let username = LoginUI.getUsername().trim();
			let password = LoginUI.getPassword().trim();
			if (!username)
			{
				//alert('请输入用户名');
				LoginUI.flyTip('请输入用户名');
				return;
			}
			if (!password)
			{
				//alert('请输入密码');
				LoginUI.flyTip('请输入密码');
				return;
			}
			LoginUI.enableInput(false);
			LoginUI.setText('正在登陆中...');
			if (isReg)
				this.register(username, password);
			else
				this.login(username, password);
		};
		LoginUI.onButtonLogin(() =>
		{
			onClickButton(false);
		});
		LoginUI.onButtonRegister(() => onClickButton(true));
	}


	private _loginType = '';
	private _getUserAgent()
	{
		return navigator.userAgent + ',' + navigator.appVersion;
	}
	login(username, password)
	{
		this._loginType = 'custom';
		this._logining = true;
		this._logined = false;
		this._loginPacket = {
			cmd: 'login',
			username: username,
			password: password,
			from: util.getParameterByName('from'),
			agent: this._getUserAgent(),
		};
		this._currentUsername = username;
		this._currentPassword = password;
		this._connect();
	}

	loginLaMa(enu, face, nickname, type?)
	{
		this._loginType = 'lama';
		this._logining = true;
		this._logined = false;
		this._loginPacket = {
			cmd: 'login',
			enuid: enu,
			face: face,
			nickname: nickname,
			type: type || 'lama',
			from: util.getParameterByName('from'),
			agent: this._getUserAgent()
		};
		this._currentUsername = '';
		this._currentPassword = '';
		LoginUI.showInput(false);
		this._connect();
	}

	register(username, password)
	{
		this._logining = true;
		this._loginPacket = {
			cmd: 'register',
			username: username,
			password: password,
			from: util.getParameterByName('from'),
			agent: this._getUserAgent()
		};
		this._currentUsername = username;
		this._currentPassword = password;
		this._connect();
	}

	sendPacket(obj)
	{
		if (!this._socket) return;
		try
		{
			this._socket.send(JSON.stringify(obj));
		}
		catch (e)
		{
			console.error('send', e);
		}
	}
	sendSelectPet(i)
	{
		this.sendPacket({
			cmd: 'selectPet',
			id: i
		});
	}

	private _connect()
	{
		if (this._socket)
		{
			console.error('error,socket alreay created');
			return;
		}
		var host = location.host;
		var hosts = host.split('.');
		if (hosts.length === 4 && isNaN(parseInt(hosts[0])))
		{
			hosts[0] = 'ws';
			host = hosts.join('.');
		}
		let socket = this._socket = new WebSocket('ws://' + host + location.pathname + 'game');
		socket.onopen = e => this._onOpen();
		socket.onclose = e => this._onClose(e);
		socket.onerror = e => this._onError(e);
		socket.onmessage = e => this._onMessage(e);
		this._loginErrorMsg = null;
		this._requestingStartGame = false;
		this._isBuyingGift = false;
		this._mailCount = 0;
		this._mails = null;
		this._isSearchingFriend = false;
		this.weekRankPosition = -1;
		this._weekRankListQuried = false;
	}

	private _reconnect()
	{
		setTimeout(() =>
		{
			this._logining = true;
			this._isReconnecting = true;
			this._connect();
		}, 2000);
	}

	private _onOpen()
	{
		console.info('WebSocket open');
		this.sendPacket(this._loginPacket);
	}

	private _onClose(e: CloseEvent)
	{
		console.info('WebSocket close', e);
		if (this._logining)
		{
			this._logining = false;
			this._onLoginError('和服务器连接失败', e);
		}
		else
		{
			this._onLinkLost(e);
			if (e.reason)
			{
				LoginUI.flyTip('和服务器断开了连接:' + e.reason);
			}
		}
		this._socket = null;
	}

	private _onMessage(e: MessageEvent)
	{
		let obj = JSON.parse(e.data);
		let cmd = obj.cmd;
		console.log('message ' + cmd, e.data);
		if (typeof this['_recv_' + cmd] === 'function')
		{
			this['_recv_' + cmd](obj);
		}
		else
		{
			console.error(`Can't process cmd:${cmd}`);
		}
	}

	private _onError(e: Event)
	{
		console.error('WebSocket error', e);
		/*
		if (this._logining)
		{
			this._logining = false;
			this._onLoginError('服务器断开的连接');
		}
		else
		{
			this._onLinkLost();
		}
		*/
	}

	private _onLoginError(msg, e?: CloseEvent)
	{
		let wantAutoReconnect = false;
		if (this._isReconnecting && (e && e.code !== 1000) && this._reconnectCount < MAX_RECONNECT_COUNT)
		{
			wantAutoReconnect = true;
		}
		if (!wantAutoReconnect)
		{
			this._isReconnecting = false;
			this._reconnectCount = 0;
			LoginUI.show();
			LoginUI.setText('');
			LoginUI.flyTip('登陆失败：' + msg);
			LoginUI.enableInput(true);
			this._loginErrorMsg = msg;
		}
		else
		{
			console.log('登陆失败：但是在进行第' + this._reconnectCount + '次自动重连');
			this._reconnectCount++;
			this._reconnect();
		}
	}

	private _onLoginSuccess(obj)
	{
		console.info('登陆成功', obj);
		LoginUI.hide();
		localStorage.setItem('loginpanel.username', this._currentUsername);
		localStorage.setItem('loginpanel.password', this._currentPassword);
		this._processUserInfo(obj);
		HallUI.instance.hidePaymentMask();
		if (GameStage.instance._currentGame)
		{
			GameStage.instance._currentGame.sendGameResultIfGameOver();
		}
	}

	private _onLinkLost(e?: CloseEvent)
	{
		this._logined = false;
		if (this._socket)
		{
			try { this._socket.close(); } finally { }
			this._socket = null;
		}
		let wantAutoReconnect = true;
		if (e && [1000, 4008].indexOf(e.code) >= 0)
		{
			wantAutoReconnect = false;
		}
		if (this._reconnectCount >= MAX_RECONNECT_COUNT)
		{
			wantAutoReconnect = false;
		}
		HallUI.instance.showMatchingPanel(false);
		if (!wantAutoReconnect)
		{
			this._isReconnecting = false; //自动重连机制已经停止了
			GameStage.instance.closeGame();
			LoginUI.show();
			LoginUI.setText('');
			if (!this._loginErrorMsg) LoginUI.flyTip('和服务器的连接断开了');
			LoginUI.enableInput(true);
		}
		else
		{
			GameStage.instance.closeMatchGame();
			this._isReconnecting = true;
			this._reconnectCount++;
			console.log('正在进行第' + this._reconnectCount + '次，自动重新连接');
			this._reconnect();
		}
	}

	private _recv_login(obj)
	{
		this._logining = false;
		if (obj.success)
		{
			this._logined = true;
			this._isReconnecting = false;
			this._reconnectCount = 0;
			this._onLoginSuccess(obj);
		}
		else
		{
			this._onLoginError(obj.msg);
		}
	}
	private _recv_update(obj)
	{
		this._processUserInfo(obj);
	}

	private _recv_startGameError(obj)
	{
		console.error(`请求开始游戏错误，msg=${obj.msg}`);
		if (obj.nocoin)
		{
			//HallUI.instance.showNoCoinDialog(obj.msg);
			HallUI.instance.whenWantCoin(obj.need);
		}
		else if (obj.noheart)
		{
			//HallUI.instance.showNoHeartDialog(obj.msg);
			HallUI.instance.whenWantHeart(obj.need);
		}
		else
		{
			HallUI.instance.showConfirmDialog(obj.msg);
		}
		this._requestingStartGame = false;
	}

	private _recv_startGame(obj)
	{
		console.info('开始游戏');
		if (obj.tutorial)
		{
			this._requestingStartGame = false;
			GameStage.instance.createGame(obj);
		}
		else
		{
			HallUI.instance.heartbar.playMinusHeartAnimation(() =>
			{
				this._requestingStartGame = false;
				GameStage.instance.createGame(obj);
			});
		}
	}

	private _recv_gameover(obj)
	{
		GameStage.instance.showGameOver(obj);
	}
	private _recv_submitGameResultError(obj)
	{
		console.error(`提交游戏结果错误, msg=${obj.msg}`);
		GameStage.instance.closeGame();
	}

	private _recv_unlockPetError(obj)
	{
		if (obj.nocoin)
		{
			//HallUI.instance.showNoCoinDialog(obj.msg);
			HallUI.instance.whenWantCoin(obj.need);
		}
		else
		{
			HallUI.instance.showConfirmDialog(obj.msg);
		}
	}

	sendGameResult(obj: { score: number, coin: number, killPetCount: number[], feverCount: number, bombCount: number, skillCount: number } & any)
	{
		let obj2: any = {};
		for (let key in obj)
		{
			obj2[key] = obj[key];
		}
		obj2.cmd = 'submitGameResult';
		this.sendPacket(obj2);
	}

	private _processUserInfo(obj)
	{
		if (!obj) return;
		let copy = (name) =>
		{
			if (name in obj)
			{
				this[name] = obj[name];
				return true;
			}
			return false;
		}
		if (copy('key'))
		{
			share.regShareWhenLogin();
		}
		copy('coin');
		copy('diamond');
		copy('currentPet');
		let bRefreshHeart = copy('heart');
		copy('nextHeartTime');
		let bRefreshFriends = copy('weekHighScore');
		bRefreshFriends = copy('historicalHighScore') || bRefreshFriends;
		copy('nickname');
		if (copy('faceurl'))
		{

		}
		copy('weekRankPosition');
		if (copy('boughtItems'))
		{
			HallUI.instance.refreshPayment();
		}
		HallUI.instance.updateBasicInfo();
		if (bRefreshHeart)
		{
			HallUI.instance.updateHeartInfo();
		}
		if (obj.pets)
		{
			this.pets.length = 0;
			for (let i = 0; i < obj.pets.length; ++i)
			{
				let pet = obj.pets[i];
				this.pets[pet.id] = pet;
			}
		}
		if (obj.pets || 'currentPet' in obj)
		{
			HallUI.instance.updatePetInfo();
		}

		this._processMail(obj);
		this._processDailyTask(obj);
		this._processWeeklyTask(obj);
		this._processFriends(obj);
		if (bRefreshFriends && this._friendList)
		{
			HallUI.instance.refreshFriends();
		}
	}
	sendReqMail()
	{
		this.sendPacket({ cmd: 'reqMail' });
	}
	sendReqRecvAllMail()
	{
		if (this._mailCount > 0)
		{
			this.sendPacket({ cmd: 'reqRecvAllMail' });
		}
	}
	sendReqRecvMail(id)
	{
		this.sendPacket({ cmd: 'reqRecvMail', id: id });
	}
	sendReqRejectMail(id)
	{
		this.sendPacket({ cmd: 'reqRejectMail', id: id });
	}
	//处理mailCount和mails
	private _processMail(obj)
	{
		if ('mailCount' in obj)
		{
			if (obj.mailCount !== this._mailCount)
			{
				this._mailCount = obj.mailCount;
				HallUI.instance.updateMailCount(this._mailCount);
				//当数量发生改变的时候，且当前没有发送mails的话，则刷新一下
				if (!('mails' in obj))
				{
					//当count==0的时候，就直接知道mails=[]了，不需要请求了
					if (obj.mailCount === 0)
					{
						this._mails = [];
						HallUI.instance.updateMail(this._mails);
					}
					else
					{
						//只在面板显示的时候立刻刷新
						if (HallUI.instance.isMailPanelShowing())
						{
							this.sendReqMail();
						}
					}
				}
			}
		}
		if ('mails' in obj)
		{
			this._mails = obj.mails;
			HallUI.instance.updateMail(this._mails);
		}
	}
	//服务器请求删除一封邮件
	private _recv_delMail(obj)
	{
		let success = false;
		let id = obj.id;
		if (Array.isArray(this._mails))
		{
			for (let i = 0; i < this._mails.length; ++i)
			{
				if (this._mails[i].id === id)
				{
					this._mails.splice(i, 1);
					success = true;
					break;
				}
			}
		}
		if (success)
		{
			HallUI.instance.updateMail(this._mails);
			--this._mailCount;
			HallUI.instance.updateMailCount(this._mailCount);
		}
		else
		{
			if (HallUI.instance.isMailPanelShowing())
			{
				this.sendReqMail();
			}
		}

	}
	/**返回null表示，你没有这个宠物 */
	getPetInfo(i: number): IPetInfo
	{
		let pets = this.pets;
		let pet = this.pets[i];
		if (!pet) return null;
		return {
			idx: i,
			skill: pet.skillLv,
			skillExp: pet.skillExp,
			skillExpTotal: PetRules.getPetSkillLevelUpExp(pet.id, pet.skillLv),
			level: pet.level,
			maxLevel: pet.lockedLv,
			exp: pet.exp,
			expTotal: PetRules.getPetLevelUpExp(pet.id, pet.level),
			unlockPrice: pet.unlockPrice
		};
	}
	/**和getPetInfo()类似 但是总会返回一个初始的宠物给你的*/
	getFakePetInfo(i: number): IPetInfo
	{
		if (i < 0) return null;
		if (i >= PetRules.MAX_PET_COUNT) return null;
		return {
			idx: i,
			skill: 1,
			skillExp: 0,
			skillExpTotal: PetRules.getPetSkillLevelUpExp(i, 1),
			level: 1,
			maxLevel: 5,
			exp: 0,
			expTotal: PetRules.getPetLevelUpExp(i, 1),
			//unlockPrice: 0,
			fake: true
		}
	}

	/**宠物基础分数 */
	getPetScore(i: number): number
	{
		let pi = this.getPetInfo(i);
		let lv = pi ? pi.level : 1;
		return this.getPetScoreByLevel(i, lv);
	}

	getPetScoreByLevel(petid: number, lv: number): number
	{
		return PetRules.PET_BASE_SCORE[petid] + PetRules.PET_UP_SCORE[petid] * (lv - 1);
	}

	sendReqStartGame(obj: {
		items: string[]
	})
	{
		if (this._requestingStartGame) return;
		this._requestingStartGame = true;
		this.sendPacket({
			cmd: 'reqStartGame',
			items: obj.items
		});
	}

	sendReqWeeklyTask()
	{
		this.sendPacket({
			cmd: 'reqWeeklyTask'
		});
	}
	sendReqEndWeeklyTask()
	{
		this.sendPacket({
			cmd: 'reqEndWeeklyTask'
		});
	}


	private _processDailyTask(obj)
	{
		/*
		let ui = HallUI.instance.dailyTaskBar;
		if ('dailyTaskCount' in obj)
		{
			ui.setFinishedCount(obj.dailyTaskCount);
		}
		if ('dailyTask' in obj)
		{
			if (obj.dailyTask)
			{
				ui.setDailyTaskPercent(obj.dailyTask.count / obj.dailyTask.maxCount);
				ui.setDailyTaskText(DT.getDailyTaskText(obj.dailyTask));
			}
			else
			{
				ui.setDailyTaskPercent(0);
				ui.setDailyTaskText('任务没啦，明天请赶早！');
			}
		}
		*/
	}
	private _processWeeklyTask(obj)
	{
		if (Array.isArray(obj.weeklyTasks))
		{
			for (let task of obj.weeklyTasks)
			{
				if (typeof task.param === 'number' && task.desc.indexOf('{果冻X}') >= 0)
				{

					task.desc = task.desc.toString().replace('{果冻X}', PetRules.PET_NAMES[task.param]);
				}
			}
			HallUI.instance.updateWeeklyTask(obj.weeklyTasks, obj.weeklyTaskCount, obj);
			this._weeklyTasks = obj.weeklyTasks;
		}
	}
	getCurrentWeeklyTask()
	{
		if (this._weeklyTasks)
		{
			return this._weeklyTasks[this._weeklyTasks.length - 1];
		}
		return null;
	}

	sendUnlockPet(idx: number)
	{
		this.sendPacket({ cmd: 'unlockPet', idx: idx });
	}
	sendBuyGift(idx: number)
	{
		if (this._isBuyingGift) return;
		this._isBuyingGift = true;
		this.sendPacket({ cmd: 'buyGift', idx: idx });
	}

	_recv_buyGiftSuccess(obj)
	{
		console.info(`成功购买礼包`);
		this._isBuyingGift = false;
		HallUI.instance.showBuyGiftSuccess(obj);
	}
	_recv_buyGiftError(obj)
	{
		console.info('购买礼包失败：' + obj.msg);
		this._isBuyingGift = false;
		//alert('购买礼包失败：' + obj.msg);
		if (obj.nocoin)
		{
			//HallUI.instance.showNoCoinDialog(obj.msg);
			HallUI.instance.whenWantCoin(obj.need);
		}
		else
		{
			HallUI.instance.showConfirmDialog(obj.msg);
		}
	}

	sendCancelGame()
	{
		this.sendPacket({ cmd: 'cancelGame' });
	}

	_processFriends(obj)
	{
		if (obj && Array.isArray(obj.friends))
		{
			this._friendList = obj.friends;
			HallUI.instance.refreshFriends();
		}
	}
	_recv_updateFriend(obj)
	{
		if (obj.friend && obj.friend.key && this._friendList)
		{
			let updated = false;
			for (let i = 0; i < this._friendList.length; ++i)
			{
				if (this._friendList[i].key === obj.friend.key)
				{
					this._friendList[i] = obj.friend;
					updated = true;
					break;
				}
			}
			if (!updated)
			{
				this._friendList.push(obj.friend);
			}
			HallUI.instance.refreshFriends();
		}
	}

	_recv_removeFriend(obj)
	{
		if (obj.key && this._friendList)
		{
			for (let i = 0; i < this._friendList.length; ++i)
			{
				if (this._friendList[i].key === obj.key)
				{
					this._friendList.splice(i, 1);
					HallUI.instance.refreshFriends();
					return;
				}
			}
		}
	}

	getFriendList(sortOn: "weekHighScore" | "historicalHighScore")
	{
		let arr = [];
		arr.push({
			key: this.key,
			name: this.nickname,
			score: this[sortOn],
			currentPet: this.currentPet,
			faceurl: this.faceurl
		});

		Object.defineProperty(arr[0], 'currentPet', { get: () => this.currentPet });

		for (let f of this.friendList)
		{
			if (f.key === this.key) //好像这个是没用的，friendList中不会出现自己了
			{
				f.weekHighScore = this.weekHighScore;
				f.historicalHighScore = this.historicalHighScore;
			}
			arr.push({
				key: f.key,
				name: f.nickname,
				score: f[sortOn],
				canSendHeart: f.canSendHeart,
				currentPet: f.currentPet,
				faceurl: f.faceurl
			});
		}
		sortOnKey(arr, 'score');
		for (let i = 0; i < arr.length; ++i)
		{
			arr[i]['index'] = i;
		}
		return arr;
	}
	//输入，我的分数变化，如果排名提升了，则返回变化的数据. 否则返回null
	genScorePositionChangeInfo(oldScore: number, newScore: number)
	{
		if (!(newScore > oldScore)) return null;
		let appendFriendInfo = (arr: any[]) =>
		{
			for (let f of this.friendList)
			{
				if (f.key === this.key) continue;
				arr.push({
					key: f.key,
					name: f.nickname,
					score: f.weekHighScore,
					currentPet: f.currentPet,
					faceurl: f.faceurl
				});
			}
		};
		let self = {
			key: this.key,
			name: this.nickname,
			score: oldScore,
			currentPet: this.currentPet,
			faceurl: this.faceurl
		};

		let arr = [];
		arr.push(self);
		appendFriendInfo(arr);
		sortOnKey(arr, 'score');
		let oldIndex = arr.indexOf(self);

		arr = [];
		self.score = newScore;
		arr.push(self);
		appendFriendInfo(arr);
		sortOnKey(arr, 'score');
		let newIndex = arr.indexOf(self);
		if (newIndex < oldIndex && arr[newIndex + 1])
		{
			return {
				me: self,
				friend: arr[newIndex + 1],
				oldScore: oldScore,
				newScore: newScore,
				oldIndex: oldIndex,
				newIndex: newIndex
			};
		}
		return null;
	}


	sendQueryFriend(key: string)
	{
		this.sendPacket({ cmd: 'queryFriend', key: key });
	}
	sendRemoveFriend(key: string)
	{
		this.sendPacket({ cmd: 'removeFriend', key: key });
	}
	_recv_queryFriend(obj)
	{
		if (this._friendList)
		{
			for (let f of this._friendList)
			{
				if (f.key === obj.key)
				{
					obj.canSendHeart = f.canSendHeart;
					obj.showRemoveFriend = true;
				}
			}
		}
		HallUI.instance.recvFriendInfo(obj);
	}
	//送给好友一个体力
	sendFriendHeart(key)
	{
		this.sendPacket({ cmd: 'sendFriendHeart', key: key });
		//把自己缓存的好友信息中的，可不可以发送红心，设置成false
		if (this._friendList)
		{
			for (let f of this._friendList)
			{
				if (f.key === key)
				{
					f.canSendHeart = false;
					HallUI.instance.refreshFriends();
					break;
				}
			}
		}
	}
	_recv_sendHeartError(obj)
	{
		console.log(obj.msg);
		let text = new createjs.Text(obj.msg, '42px SimHei', '#ff1469');
		text.textAlign = 'center';
		text.x = 320;
		text.y = 600;
		text.alpha = 1;

		HallUI.instance.spr.addChild(text);
		createjs.Tween.get(text).to({ alpha: 0, y: 350 }, 1000).call(() =>
		{
			if (text.parent) text.parent.removeChild(text);
		});
	}
	sendBuyCoin(id)
	{
		HallUI.instance.showPaymentMask();
		this.sendPacket({ cmd: 'buyCoin', item: id });
	}

	sendBuyHeart(id)
	{
		HallUI.instance.showPaymentMask();
		this.sendPacket({ cmd: 'buyHeart', item: id });
	}

	sendBuyDiamond(id)
	{
		HallUI.instance.showPaymentMask();
		this.sendPacket({ cmd: 'buyDiamond', item: id, backUrl: getBackUrl() });
	}

	_recv_buyEnd(obj)
	{
		HallUI.instance.hidePaymentMask();
	}

	_recv_buyCoinError(obj)
	{
		HallUI.instance.hidePaymentMask();
		let msg = obj.msg;
		if (obj.nodiamond)
		{
			//HallUI.instance.showNoDiamondDialog(msg);
			HallUI.instance.whenWantDiamond(obj.need);
		}
		else
		{
			HallUI.instance.showConfirmDialog(msg);
		}
	}
	_recv_buyHeartError(obj)
	{
		HallUI.instance.hidePaymentMask();
		let msg = obj.msg;
		if (obj.nodiamond)
		{
			//HallUI.instance.showNoDiamondDialog(msg);
			HallUI.instance.whenWantDiamond(obj.need);
		}
		else
		{
			HallUI.instance.showConfirmDialog(msg);
		}
	}
	_recv_buyDiamond(obj)
	{
		//HallUI.instance.hidePaymentMask();
		location.href = obj.url;
	}
	_recv_buyDiamondError(obj)
	{
		let msg = '购买钻石失败：' + obj.msg;
		if (obj.nodiamond)
		{
			//HallUI.instance.showNoDiamondDialog(msg);
			HallUI.instance.whenWantDiamond(obj.need);
		}
		else
		{
			HallUI.instance.showConfirmDialog(msg);
		}
	}
	sendRefresh()
	{
		this.sendPacket({ cmd: 'refresh' });
	}
	sendSearchFriend(name)
	{
		if (this._isSearchingFriend) return;
		this._isSearchingFriend = true;
		this.sendPacket({ cmd: 'searchFriend', name: name });
	}
	_recv_searchFriendResult(obj)
	{
		this._isSearchingFriend = false;
		HallUI.instance.recvSearchFriendResult(obj.friends);
	}
	sendReqAddFriend(key)
	{
		this.sendPacket({ cmd: 'reqAddFriend', key: key });
	}
	sendUseDiamond(count: number, reason?)
	{
		this.sendPacket({ cmd: 'useDiamond', count: count, reason });
	}

	_recv_animation(obj)
	{
		HallUI.instance.recvPlayAnimation(obj);
	}

	//是不是有免费的买宠物可以用，这个包装一下'firstFreeGift'字符串
	hasFreeGift()
	{
		return !this.boughtItems || this.boughtItems.indexOf('firstFreeGift') < 0;
	}

	sendTriggerEvent(type: string)
	{
		this.sendPacket({ cmd: 'triggerEvent', type: type });
	}
	lastEnterMatch: string;
	//加入匹配
	sendEnterMatch(type: string)
	{
		this.lastEnterMatch = type;
		this.sendPacket({ cmd: 'reqEnterMatch', type: type });
	}
	//取消匹配
	sendLeaveMatch()
	{
		this.sendPacket({ cmd: 'reqLeaveMatch' });
	}
	//对战游戏，加载完成
	sendMatchReady()
	{
		this.sendPacket({ cmd: 'match_ready' });
	}
	//对战游戏，通知自己的分数
	sendMatchScore(score, leftTime)
	{
		this.sendPacket({ cmd: 'match_score', gameScore: score, gameLeftGame: leftTime });
	}

	_recv_enter_match(obj)
	{
		HallUI.instance.showMatchingPanel(true, obj.count, obj.type);
		this.matchPlayers.length = 0;
	}

	_recv_match_start(obj)
	{
		console.log('匹配成功：开始加载游戏');
		HallUI.instance.showMatchingPanel(false);
		GameStage.instance.createGame(obj.gameStartObject);
	}

	_recv_match_go(obj)
	{
		console.log('对战开始，go');
		let game = GameStage.instance._currentGame;
		if (game)
		{
			game.matchGameStart();
		}
	}

	_recv_match_playerStatus(obj)
	{
		var game = GameStage.instance._currentGame;
		if (game)
		{
			game.setMatchPlayerScore(obj);
		}
	}

	_recv_match_player(obj)
	{
		this.matchPlayers.push(obj);
		HallUI.instance.updateMatchPanel(this.matchPlayers);
	}
	_recv_cancel_match_game(obj)
	{
		GameStage.instance.closeMatchGame();
		this.matchPlayers.length = 0;
	}
	_recv_enter_match_error(obj)
	{
		if (obj.nocoin)
		{
			HallUI.instance.showNoCoinDialog(obj.msg);
			return;
		}
		HallUI.instance.showConfirmDialog(obj.msg);
	}
	_recv_weekRankList(obj)
	{
		this._weekRankList = obj.list;
		HallUI.instance.refreshRankListPanel();
	}
	getWeekRankList()
	{
		var me = {
			key: this.key,
			index: this.weekRankPosition - 1,
			name: this.nickname,
			score: this.weekHighScore,
			faceurl: this.faceurl
		}
		var arr = [me];
		if (this._weekRankList)
		{
			for (var i = 0; i < this._weekRankList.length; ++i)
			{
				var p = this._weekRankList[i];
				p.index = i;
				p.name = p.nickname;
				arr.push(p);
			}
		}
		else
		{
			if (!this._weekRankListQuried)
			{
				this.sendPacket({ cmd: 'queryWeekRankList' });
				this._weekRankListQuried = true;
			}
		}
		return arr;
	}

	sendReqTutorialPlay()
	{
		this.sendPacket({ cmd: 'reqTutorialPlay' });
	}
}

//稳定的排序，总是降序的
function sortOnKey(arr: any[], key: string)
{
	let count = arr.length;
	let swapped = false;
	do
	{
		swapped = false;
		for (let i = 0; i < count - 1; ++i)
		{
			if (arr[i][key] < arr[i + 1][key])
			{
				let tmp = arr[i];
				arr[i] = arr[i + 1];
				arr[i + 1] = tmp;
				swapped = true;
			}
		}
	} while (swapped);
}

function getBackUrl()
{
	let white_qs = ['enuid', 'nickname', 'face', 'type'];
	let qs = util.getQueryString();
	let qs2: any = {};
	for (let key of white_qs)
	{
		if (key in qs)
		{
			qs2[key] = qs[key];
		}
	}
	let url = location.protocol + "//" + location.host + location.pathname + '?' + util.encodeQueryString(qs2);
	return url;
}
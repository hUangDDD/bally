import {MyWebSocket, IGameUser, GameServer} from "./GameServer"
import DBUser = require("./DBUser");
import assert = require("assert");
import * as GameRules from "../shared/GameRules"
import * as GameItemDefine from "../shared/GameItemDefine"
import * as objectutil from "./objectutil"
import * as PetRules from "../shared/PetRules"
import * as DT from "../shared/DailyTaskDefine"
import * as WT from "../shared/WeeklyTaskDefine"
import * as PetSkillDesc from "../shared/PetSkillDesc"
import * as GD from "../shared/GiftDefine"
import * as PD from "../shared/PaymentDefine"
import * as cash from "./cash"
import * as jrpc from "./jrpc"
import * as util from "./util"
import * as HighScoreAward from "../shared/HighScoreAward"
import {MatchGame, MatchPlayer} from "./GameMatch"
import * as RankListDB from "./RankListDB"
import * as MatchRules from "../shared/MatchRules"

const ENABLE_DAILY_TASK = false;

export interface IFriendInfo
{
	key: string;
	nickname: string;
	weekHighScore: number;
	historicalHighScore: number;
	currentPet: number
}
export class GameUser implements IGameUser
{
	private _closed = false;
	private _server: GameServer;
	private _dbUser: DBUser.IDBUser;
	//private _currentGame: any;//当前开始的游戏。
	private _loginSent = false;//是不是发送过了login成功
	//当前已经获取并发送的朋友列表
	private _friendList: IFriendInfo[];
	socket: MyWebSocket;
	get isLogined() { return this.socket._socketStatus === 'logined'; }
	get key() { return this._dbUser.key; }
	get dbuser() { return this._dbUser; }
	get currentGame() { return this._dbUser.currentGame; }
	set currentGame(val) { this._dbUser.currentGame = val; }
	inTime: number; //玩家进入的时间

	matchPlayer: MatchPlayer = null;  //如果matchPlayer !== null && matchGame === null表示正在匹配中
	matchGame: MatchGame = null;

	constructor(dbuser: DBUser.IDBUser, socket: MyWebSocket, server: GameServer)
	{
		this.inTime = Date.now();
		this._server = server;
		global['lastgameuser'] = this;
		this.socket = socket;
		this._dbUser = dbuser;
		assert(dbuser);
		//delete old mail
		let oldtime = Date.now() - 30 * 24 * 3600 * 1000;
		let hasOldMail = false;
		for (let m of dbuser.mails)
		{
			if (!(m && m.time >= oldtime)) { hasOldMail = true; break; }
		}
		if (hasOldMail)
		{
			dbuser.mails = dbuser.mails.filter(m => m && m.time > oldtime);
		}

		{
			let idx = this.dbuser.friends.indexOf(null);
			if (idx >= 0)
			{
				this.dbuser.friends.splice(idx, 1);
			}
		}
		this._checkAddFriendAward();

		if (dbuser.weekHighScoreDate > 0)
		{
			RankListDB.write(dbuser.key, dbuser.weekHighScoreDate, dbuser.weekHighScore);
		}
		this._refreshWeekHighScore();
	}

	private _checkAddFriendAward()
	{
		if (this.dbuser.friends.length >= 20 && !this.dbuser.eventTags['20_FRIEND_AWARD'])
		{
			this.addMail('diamond', 20, '好友达到20个！获得了钻石*10');
			this.dbuser.eventTags['20_FRIEND_AWARD'];
		}
	}

	/**刷新一个和时间有关的内容 */
	refresh()
	{
		this._refreshHeart();
	}

	onMessage(obj: any)
	{
		if (!obj) return;
		let cmd = obj.cmd;
		switch (cmd)
		{
			case 'selectPet':
				this.recvSelectPet(obj);
				break;
			case 'reqStartGame':
				this.recvReqStartGame(obj);
				break;
			case 'submitGameResult':
				this.recvSubmitGameResult(obj);
				break;
			case 'reqRecvMail':
				this.recvReqRecvMail(obj);
				break;
			case 'reqRecvAllMail':
				this.recvReqRecvAllMail(obj);
				break;
			case 'reqRejectMail':
				this.recvReqRejectMail(obj);
				break;
			case 'reqMail':
				this.sendMailInfo();
				break;
			case 'reqEndWeeklyTask':
				this._recvReqEndWeeklyTask(obj);
				break;
			case 'reqWeeklyTask':
				this._recvReqWeeklyTask();
				break;
			case 'unlockPet':
				this._recvUnlockPet(obj);
				break;
			case 'buyGift':
				this._recvBuyGift(obj);
				break;
			case 'cancelGame':
				if (this.currentGame)
				{
					jrpc.gameCancel(this.dbuser.usertype, this.key, this.currentGame.id, true);
				}
				this.currentGame = null;
				this.dbuser.tutorial = true;
				break;
			case 'queryFriend':
				this._recvQueryFriend(obj);
				break;
			case 'sendFriendHeart':
				this._recvSendFriendHeart(obj);
				break;
			case 'removeFriend':
				this._recvRemoveFriend(obj);
				break;
			case 'buyHeart':
				this._recvBuyHeart(obj);
				break;
			case 'buyCoin':
				this._recvBuyCoin(obj);
				break;
			case 'buyDiamond':
				this._recvBuyDiamond(obj);
				break;
			case 'refresh':
				this.sendBasicInfo();
				break;
			case 'searchFriend':
				this._recvSearchFriend(obj);
				break;
			case 'reqAddFriend':
				this._recvRequestAddFriend(obj);
				break;
			case 'useDiamond':
				this._recvUseDiamond(obj);
				break;
			case 'triggerEvent':
				this.recvTriggerEvent(obj);
				break;
			case 'reqEnterMatch':
				this.recvEnterMatch(obj);
				break;
			case 'reqLeaveMatch':
				this.recvLeaveMatch(obj);
				break;
			case 'match_ready':
				if (this.matchGame) this.matchGame.setReady(this);
				break;
			case 'match_score':
				if (this.matchGame) this.matchGame.setGameScore(this, obj);
				break;
			case 'queryWeekRankList':
				this.recvQueryWeekRankList(obj);
				break;
			case 'reqTutorialPlay':
				this.sendTutorialPlay();
				break;
			default:
				console.log('recv unknown message:' + obj.cmd);
				break;
		}
	}
	recvQueryWeekRankList(obj)
	{
		RankListDB.getRankList((err, result) =>
		{
			if (err)
			{
				console.log('RankListDB.getRankList error,', err)
				return;
			}
			if (!this._closed)
			{
				this.socket.sendPacket({ cmd: 'weekRankList', list: result });
			}
		});
	}

	recvEnterMatch(obj)
	{
		if (this.matchPlayer || this.matchGame) return;
		var sendError = (msg: string, nocoin?: boolean) =>
		{
			this.socket.sendPacket({ cmd: 'enter_match_error', msg, nocoin });
		};

		var type = obj.type;
		if (['11', '44', 'master'].indexOf(type) < 0) return;
		if (this.matchGame || this.matchPlayer) return;
		var price = MatchRules.MATCH_PRICE[type] | 0;
		var score = MatchRules.MATCH_ENTER_SCORE[type] | 0;
		if (this.dbuser.historicalHighScore < score)
		{
			sendError('你没有达到最低的分数要求');
			return;
		}

		if (price > 0)
		{
			if (this.dbuser.coin < price)
			{
				sendError('你的金币不够', true);
				return;
			}
			this.dbuser.coin -= price;
			this.socket.sendPacket({
				cmd: 'update',
				coin: this.dbuser.coin
			});
		}

		this._server.matchServer.enterMatch(this, type);
		this.currentGame = null;
		this.socket.sendPacket({
			cmd: 'enter_match',
			count: this._server.matchServer.getMatchPlayerCount(type),
			type: type
		});
	}

	recvLeaveMatch(obj)
	{
		if (this.matchPlayer && !this.matchGame)
		{
			let price = MatchRules.MATCH_PRICE[this.matchPlayer.type] | 0;
			if (price > 0)
			{
				this.dbuser.coin += price;
				this.socket.sendPacket({
					cmd: 'update',
					coin: this.dbuser.coin
				});
			}
			this._server.matchServer.leaveMatch(this);
		}
	}

	recvTriggerEvent(obj)
	{
		const KNOWN_AWARD = ['SHARE_AWARD', 'DOWNLOAD_APP_AWARD'];
		if (KNOWN_AWARD.indexOf(obj.type) >= 0)
		{
			let type = obj.type;
			if (this.dbuser.eventTags[type]) return;
			this.dbuser.eventTags[type] = true;
			switch (obj.type)
			{
				case 'SHARE_AWARD':
					//this.dbuser.diamond += 5;
					this.addMail('diamond', 5, '首次分享成功！获得了钻石*5');
					break;
				case 'DOWNLOAD_APP_AWARD':
					//this.dbuser.coin += 20000;
					this.addMail('coin', 20000, '下载客户端奖励：金币*20000');
					break;
			}
		}
	}
	recvSelectPet(obj)
	{
		let id = obj.id | 0;
		let db = this._dbUser;
		if (db.currentPet !== id && db.pets[id])
		{
			db.currentPet = id;
			this.socket.sendPacket({
				cmd: 'update',
				currentPet: id
			});
		}
	}

	//客户端请求开始游戏
	recvReqStartGame(obj)
	{
		console.log(`${this.key}请求开始游戏`);
		let sendStartGameError = (msg, nocoin?, need?: number) =>
		{
			console.log(`${this.key}开始游戏失败:${msg}`);
			this.socket.sendPacket({
				cmd: 'startGameError',
				msg: msg,
				nocoin,
				need
			});
		}
		let items = obj.items;//应该是字符串数组
		if (!Array.isArray(items))
		{
			sendStartGameError('参数错误');
			return;
		}

		if (this.currentGame && Date.now() - this.currentGame.time <= 10000)
		{
			sendStartGameError('游戏已经开始了');
			return;
		}
		this.currentGame = null;

		let db = this._dbUser;
		//红心是否够
		this._refreshHeart();
		if (db.heart <= 0)
		{
			this.socket.sendPacket({
				cmd: 'startGameError',
				msg: '你没有足够的体力',
				noheart: true,
				need: 1

			});
			return;
		}
		//游戏开始的时候，需要由服务器处理两种道具：增加时间、减少球类型
		let useCoin = 0;//需要花费多少金币
		let totalTime = 60;
		let pets = [];
		let usedColors: any = {};
		pets.push(db.currentPet);
		usedColors[PetRules.PET_REAL_COLORS[db.currentPet]] = true;
		while (pets.length < 5)
		{

			let idx = (Math.random() * PetRules.MAX_PET_COUNT) | 0;
			if (pets.indexOf(idx) < 0 && !usedColors[PetRules.PET_REAL_COLORS[idx]])
			{
				pets.push(idx);
				usedColors[PetRules.PET_REAL_COLORS[idx]] = true;
			}
		}

		for (let itemDefine of GameItemDefine.GAME_ITEM_DEFINES)
		{
			if (items.indexOf(itemDefine.type) >= 0)
			{
				useCoin += itemDefine.price;
				if (itemDefine.type === GameItemDefine.GAME_ITEM_ADD_TIME)
				{
					totalTime = 70;
				}
				else if (itemDefine.type === GameItemDefine.GAME_ITEM_DEC_BALL_TYPE)
				{
					if (pets.length == 5) pets.pop();
				}
			}
		}

		if (db.coin - useCoin < 0)
		{
			sendStartGameError('你的金币不足', true, useCoin);
			return;
		}
		let pet = db.pets[db.currentPet];
		if (!pet)
		{
			sendStartGameError('你没有当前选中的宠物');
			return;
		}
		//这里开始游戏啦
		this._useHeart();
		if (useCoin > 0)
		{
			let DEFINES = GameItemDefine.GAME_ITEM_DEFINES;
			for (let i = 0; i < DEFINES.length; ++i)
			{
				let itemDefine = DEFINES[i];
				if (items.indexOf(itemDefine.type) >= 0)
				{
					jrpc.consumedataEx(this.dbuser.usertype, this.key, db.nickname, jrpc.CONSUME_TYPE_GAME_ITEM + i, itemDefine.price, 1, db.coin, '游戏开始道具:' + itemDefine.name);
				}
			}
		}


		db.coin -= useCoin;

		let gameObject = {
			id: Date.now() + '' + Math.random(),
			time: Date.now(),
			totalTime: totalTime,
			skillLevel: pet.skillLv,
			pets: pets,
			items: items,
			scoreExtraRate: 0,
			cmd: 'startGame'
		};
		jrpc.gameStart(this.dbuser.usertype, this.key, gameObject.id, this.dbuser.heart, useCoin, gameObject.pets[0]);
		this.currentGame = gameObject;
		this.socket.sendPacket(gameObject);
		this.sendBasicInfo();
	}

	sendTutorialPlay()
	{
		//if (this.currentGame) return false;
		let gameObject = {
			totalTime: 60,
			skillId: 0,
			skillLevel: 1,
			pets: [1, 3, 5],
			items: [],
			scoreExtraRate: 0,
			tutorial: true,
			cmd: 'startGame'
		};
		this.currentGame = gameObject;
		this.socket.sendPacket(gameObject)
		return true;
	}

	processGameResult(obj: {
		score: number,
		coin: number,
		killPetCount: number[],
		bombCount: number,
		feverCount: number,
		skillCount: number
	} & any,
		currentGame: any,
		outputGameOver: any
	)
	{
		let sendError = msg =>
		{
			outputGameOver.cmd = 'submitGameResultError';
			outputGameOver.msg = msg;
		};

		if (!currentGame)
		{
			sendError('游戏没有开始啦');
			return false;
		}
		let isTutorial = !!currentGame.tutorial;
		let isMatch = !!currentGame.isMatch;//是否比赛模式
		//检查参数
		if (!objectutil.objectVerify(obj, {
			score: 'number',
			coin: 'number',
			killPetCount: 'array',
			bombCount: 'number',
			feverCount: 'number',
			skillCount: 'number'
		}))
		{
			sendError("参数错误");
			console.warn('recvSubmitGameResult参数错误(类型错误)', obj);
			return false;
		}
		//继续参数检查
		if (obj.killPetCount.length !== currentGame.pets.length)
		{
			sendError("参数错误");
			console.warn('recvSubmitGameResult参数错误(killPetCount.length不匹配)', obj);
			return false;
		}

		for (let x of obj.killPetCount)
		{
			if (typeof x !== 'number' || x < 0) 
			{
				sendError("参数错误");
				console.warn('recvSubmitGameResult参数错误(killPetCount类型错误)', obj);
				return false;
			}
		}
		//下面开始各种算分数，然后发送结算结果到客户端
		let db = this._dbUser;
		let totalScore = 0;
		let totalCoin = 0;
		let petAddPercent = 0;
		let itemAddPercent = 0;
		let petAddScore = 0;
		let itemAddScore = 0;
		let pet = db.pets[currentGame.pets[0]];

		jrpc.gameEnd(this.dbuser.usertype, this.key, currentGame.id, obj);

		if (!isTutorial)
		{
			if (pet)
			{
				petAddPercent = PetRules.getPetExtraScorePercent(pet.id, pet.level);
				petAddScore = (obj.score * petAddPercent) | 0;
			}

			if (currentGame.items.indexOf(GameItemDefine.GAME_ITEM_ADD_SCORE) >= 0)
			{
				//增加10%分数的道具
				itemAddPercent = 0.1;//这里暂时把数字写死吧
				itemAddScore = (obj.score * itemAddPercent) | 0;
			}

			totalScore = (obj.score + itemAddScore + petAddScore) | 0;
			if (currentGame.items.indexOf(GameItemDefine.GAME_ITEM_ADD_COIN) >= 0)
			{
				let percent = GameItemDefine.calcGameItemAddCoinRate();
				totalCoin = (obj.coin * (1 + percent)) | 0;
			}
			else
			{
				totalCoin = obj.coin | 0;
			}
		}

		//计算宠物经验
		let hasAddPetExpItem = currentGame.items.indexOf(GameItemDefine.GAME_ITEM_ADD_EXP);
		let petResult = [];
		let mainPet = 0;
		let mainPetScore = 0;
		for (let i = 0; i < obj.killPetCount.length; ++i)
		{
			let petid = currentGame.pets[i];
			let num = obj.killPetCount[i];
			let pet = db.pets[petid];
			let exp = num;

			if (isMatch) exp = 0;//比赛，对战没有宠物经验

			if (hasAddPetExpItem)
			{
				exp = (exp * 1.1) | 0;
			}
			//每个经验炸弹加10经验给携带宠物.
			if (obj.expBomb > 0)
			{
				exp += (obj.expBomb * 10) | 0;
			}
			if (isTutorial) exp = 0;
			if (i === 0) mainPet = petid;
			if (i === 0) mainPetScore = exp;
			if (!pet)
			{
				petResult.push({
					pet: petid,
					num: num,
					from: -1,
					to: -1
				});
				if (i === 0) mainPetScore = 0;
			}
			else
			{
				let oldLv = pet.level;
				let oldExp = pet.exp;
				let oldExpTotal = PetRules.getPetLevelUpExp(petid, oldLv);

				let newLv = oldLv;
				let newExp = oldExp;
				let newExpTotal = oldExpTotal;
				let realAddExp = 0;//实际加了多少经验。
				let changed = false;
				while (exp > 0 && newLv < pet.lockedLv)
				{
					if (newExp + exp < newExpTotal)
					{
						newExp += exp;
						realAddExp += exp;
						exp = 0;
						changed = true;
					}
					else
					{
						exp -= newExpTotal - newExp;
						realAddExp += newExpTotal - newExp;
						newLv++;
						newExp = 0;
						newExpTotal = PetRules.getPetLevelUpExp(petid, newLv);
						changed = true;
					}
				}
				petResult.push({
					pet: petid,
					num: num,
					from: oldLv + (oldExp / oldExpTotal),
					to: newLv + (newExp / newExpTotal)
				});
				if (changed)
				{
					pet.level = newLv;
					pet.exp = newExp;
				}
			}
		}
		//加金币、
		if (!isMatch)
		{
			db.coin += totalCoin;
		}
		//加分数、计算最高分数等。
		let weekHighScoreChanged;
		let historicalHighScoreChanged;
		if (!(totalScore <= db.historicalHighScore))
		{
			historicalHighScoreChanged = {
				oldScore: db.historicalHighScore | 0,
				newScore: totalScore
			};
			this._processHistoricalScoreAward(db.historicalHighScore | 0, totalScore | 0);
			db.historicalHighScore = totalScore;
			db.historicalHighScoreDate = Date.now();


		}
		this._refreshWeekHighScore();
		if (!(totalScore <= db.weekHighScore))
		{
			weekHighScoreChanged = {
				oldScore: db.weekHighScore | 0,
				newScore: totalScore
			};
			db.weekHighScore = totalScore;
			db.weekHighScoreDate = Date.now();

			RankListDB.write(this.key, db.weekHighScore, db.weekHighScoreDate);
			this._refreshWeekRankPosition();
		}
		//日常任务的统计
		let weeklyTaskSatisfied = false;
		if (!isTutorial && !isMatch)
		{
			let totalBall = 0;
			for (let c of obj.killPetCount) totalBall += c;

			let taskData: any = {};
			taskData['game'] = 1;
			taskData['ball'] = totalBall;
			taskData['exp'] = mainPetScore;//经验一定是当前携带宠物获得的经验
			taskData['bomb'] = obj.bombCount;
			taskData['skill'] = obj.skillCount;
			taskData['coin'] = totalCoin;
			taskData['fever'] = obj.feverCount;
			taskData['score'] = totalScore;
			for (let i = 0; i < obj.killPetCount.length; ++i)
			{
				let pid = currentGame.pets[i];
				taskData['ball' + pid] = obj.killPetCount[i];
			}
			taskData['skill' + currentGame.pets[0]] = obj.skillCount;
			taskData['link'] = obj.maxLink;
			taskData['combo'] = obj.maxCombo;
			taskData['expBomb'] = obj.expBomb;
			taskData['timeBomb'] = obj.timeBomb;
			taskData['scoreBomb'] = obj.scoreBomb;
			taskData['coinBomb'] = obj.coinBomb;
			console.info(`游戏人物数据：${JSON.stringify(taskData)}`);

			if (obj.maxCombo > db.maxCombo) db.maxCombo = obj.maxCombo;
			if (obj.maxLink > db.maxLink) db.maxLink = obj.maxLink;
			db.totalKill += totalBall;


			this._updateDailyTask(taskData);
			let weeklyTaskOutput: any = {};
			this._updateWeeklyTask(taskData, weeklyTaskOutput);
			if (weeklyTaskOutput.satisfied)
			{
				weeklyTaskSatisfied = true;
			}
		}
		var tutorialGift;
		if (isTutorial && !db.tutorial)
		{
			db.tutorial = true;
			db.heart += 10;
			tutorialGift = true;
			this._refreshHeart();
		}

		//发送结算出局
		let goObject: any = { //'go' === Game Over
			cmd: 'gameover',
			petResult: petResult,//各个宠物获得的经验，升级信息
			pet: mainPet,//当且携带宠物的id
			petScore: mainPetScore,//携带宠物获得的经验
			petAddPercent,
			petAddScore,
			itemAddPercent,
			itemAddScore,
			coin: totalCoin,
			score: totalScore,
			weekHighScore: db.weekHighScore | 0,
			historicalHighScore: db.historicalHighScore | 0,
			tutorial: isTutorial,
			tutorialGift: tutorialGift,
		};



		if (weekHighScoreChanged) goObject.weekHighScoreChanged = weekHighScoreChanged;
		if (historicalHighScoreChanged) goObject.historicalHighScoreChanged = historicalHighScoreChanged;
		if (weeklyTaskSatisfied) goObject.weeklyTaskSatisfied = true;

		for (let key in goObject)
		{
			outputGameOver[key] = goObject[key];
		}
		return true;
		//this.socket.sendPacket(goObject);
		//发送用户其他信息
		//this.sendBasicInfo();
		//this.sendPetInfo();
		//this.sendDailyTask();
	}

	recvSubmitGameResult(obj: {
		score: number,
		coin: number,
		killPetCount: number[],
		bombCount: number,
		feverCount: number,
		skillCount: number
	} & any)
	{
		if (this.matchGame)
		{
			this.matchGame.setGameOver(this, obj);
		}
		else
		{
			let go: any = {};
			this.processGameResult(obj, this.currentGame, go);
			this.socket.sendPacket(go);
			if (go.cmd === 'gameover')
			{
				this.sendBasicInfo();
				this.sendPetInfo();
				this.sendDailyTask();
			}
			this.currentGame = null;
		}

	}

	close()
	{
		this._closed = true;
	}

	sendLoginSuccess(loginObject?)
	{
		this._loginSent = true;
		let obj: any = {};
		this.refresh();
		this.sendBasicInfo(obj);
		this.sendPetInfo(obj);
		obj.cmd = 'login';
		obj.success = true;
		this.socket.sendPacket(obj);
		//初始化好友相关的内容
		this._initFriends(loginObject);
		this._refreshDailyTask();
		this._refreshWeeklyTask();
		this.sendDailyTask();
		this.sendWeeklyTask();
		this._checkEverydayGift();
		if (Array.isArray(this.dbuser.boughtItems))
		{
			this.socket.sendPacket({ cmd: 'update', boughtItems: this.dbuser.boughtItems });
		}
		else
		{
			this.socket.sendPacket({ cmd: 'update', boughtItems: [] });
		}


		if (!this.dbuser.eventTags) this.dbuser.eventTags = {};
		let eventTags = this.dbuser.eventTags;
		if (!eventTags['2016-07-11 17:58'])
		{
			eventTags['2016-07-11 17:58'] = true;
			this.addMail('coin', 10000, '活动期间所有登陆玩家都可直接获得10000金币奖励');
		}

		if (!this.dbuser.tutorial)
		{
			//	this.dbuser.tutorial = true;
			this.sendTutorialPlay();
		}

		this._refreshWeekRankPosition();
	}
	//获取周排行，并且发送周排行名次
	private _refreshWeekRankPosition()
	{
		if (this.dbuser.weekHighScoreDate > 0)
		{
			RankListDB.getRankPosition(this.key, this.dbuser.weekHighScoreDate, this.dbuser.weekHighScore, (err, result) =>
			{
				if (err)
				{
					console.log('获取周排行数据出错', err);
					return;
				}
				if (!this._closed)
				{
					this.socket.sendPacket({ cmd: 'update', weekRankPosition: result + 1 });
				}
			})
		}
	}

	//很多send方法，支持传入一个obj，那样就会把要发送的内容放入obj，而不进行发送.
	sendBasicInfo(obj?)
	{
		let db = this._dbUser;
		let bsend;
		if (!obj)
		{
			obj = {};
			bsend = true;
		}
		//this._refreshHeart();
		obj.key = this.key;
		obj.coin = db.coin;
		obj.diamond = db.diamond;
		obj.heart = db.heart;
		obj.mailCount = db.mails.length;
		obj.weekHighScore = db.weekHighScore;
		obj.historicalHighScore = db.historicalHighScore;
		obj.nickname = db.nickname;
		obj.faceurl = db.faceurl;
		if (db.nextHeartTime > 0 && Date.now() < db.nextHeartTime)
		{
			obj.nextHeartTime = db.nextHeartTime - Date.now();
		}
		else
		{
			obj.nextHeartTime = 0;
		}
		if (bsend)
		{
			obj.cmd = 'update';
			this.socket.sendPacket(obj);
		}
	}

	sendPetInfo(obj?)
	{
		let db = this._dbUser;
		let bSend;
		if (!obj)
		{
			obj = {};
			bSend = true;
		}
		obj.currentPet = db.currentPet;
		obj.pets = [];
		if (Array.isArray(db.pets))
		{
			for (const pet of db.pets)
			{
				if (pet)
				{
					let pet2: any = {};
					for (let key in pet)
					{
						pet2[key] = pet[key];
					}
					if (pet.level === pet.lockedLv)
					{
						let unlockData = PetRules.getPetUnlockData(pet.id, pet.level);
						if (unlockData)
						{
							pet2.unlockPrice = unlockData.price;
						}
					}
					obj.pets.push(pet2);
				}
			}
		}
		if (bSend)
		{
			obj.cmd = 'update';
			this.socket.sendPacket(obj);
		}
	}

	sendMailInfo()
	{
		this.socket.sendPacket({
			cmd: 'update',
			mails: this._dbUser.mails,
			mailCount: this._dbUser.mails.length
		});
	}

	/**给这个用户一封邮件 
	 * extraData 是要放在邮件中的额外数据
	*/
	addMail(type: DBUser.DBMailType, count: number, text: string, extraData?: any)
	{
		let db = this._dbUser;
		let mail = {
			id: db.nextMailId | 0,
			type,
			count: count | 0,
			text: text || '',
			time: Date.now()
		};
		db.nextMailId = mail.id + 1
		if (db.nextMailId >= 0xffffff) db.nextMailId = 0;
		if (typeof extraData === 'object')
		{
			for (var key in extraData)
			{
				mail[key] = extraData[key];
			}
		}
		util.safePush(db, 'mails', mail); // 相当于 db.mails.push(mail); 但是修复了一些bug
		//发送数量，如果客户端当前打开着邮件窗口，则自动请求邮件内容
		if (this._loginSent)
		{
			this.socket.sendPacket({
				cmd: 'update',
				mailCount: db.mails.length
			});
		}
	}
	/**给这个用户发一分请求加好友的邮件 */
	addAddFriendMail(key: string, text: string, faceurl?: string)
	{
		let db = this._dbUser;
		let mail: DBUser.IDBMail = {
			id: db.nextMailId | 0,
			type: 'addFriend',
			count: 0,
			text: text || '',
			time: Date.now(),
			fromKey: key,
			fromKeyFace: faceurl
		};
		db.nextMailId = mail.id + 1
		if (db.nextMailId >= 0xffffff) db.nextMailId = 0;
		util.safePush(db, 'mails', mail);

		//发送数量，如果客户端当前打开着邮件窗口，则自动请求邮件内容
		this.socket.sendPacket({
			cmd: 'update',
			mailCount: db.mails.length
		});
	}

	recvReqRecvMail(obj)
	{
		let db = this._dbUser;
		let mails = db.mails;
		for (let i = 0; i < mails.length; ++i)
		{
			let mail = mails[i];
			if (mail.id == obj.id)
			{
				console.log(`收邮件type=${mail.type}`);
				mails.splice(i, 1);
				this._applyMail(mail);
				this.socket.sendPacket({
					cmd: 'delMail',
					id: mail.id,
					mailCount: mails.length
				});
				this.sendBasicInfo();
				return;
			}
		}
	}

	recvReqRejectMail(obj)
	{
		let db = this._dbUser;
		let mails = db.mails;
		for (let i = 0; i < mails.length; ++i)
		{
			let mail = mails[i];
			if (mail.id == obj.id)
			{
				if (mail.type === 'addFriend')
				{
					mails.splice(i, 1);
					this.socket.sendPacket({
						cmd: 'delMail',
						id: mail.id,
						mailCount: mails.length
					});
					this.sendBasicInfo();
				}
				return;
			}
		}
	}

	recvReqRecvAllMail(obj)
	{
		let db = this._dbUser;
		let mails = db.mails;
		for (let m of mails)
		{
			this._applyMail(m);
		}
		db.mails.length = 0;
		this.sendMailInfo();
		this.sendBasicInfo();
	}

	private _applyMail(mail: any)
	{
		if (!mail) return;
		let count = mail.count;
		//if (!(count > 0)) return;
		let type = mail.type;
		let db = this._dbUser;
		//如果是好友发送的体力，则每天只能收50个
		if (type === 'heart' && mail['_friendheart'])
		{
			let now = Date.now();
			if (!isSameDay(now, +db.recvHeartCountTime))
			{
				db.recvHeartCountTime = now;
				db.recvHeartCount = 0;
			}
			if (db.recvHeartCount >= 50) return;//收了超过50个，则直接return
			db.recvHeartCount = (db.recvHeartCount + 1) | 0;//确保recvHeartCount一定是整数，不会是NaN
		}

		switch (type)
		{
			case 'heart':
				db.heart += count;
				this._refreshHeart();
				break;
			case 'coin':
				db.coin += count;
				break;
			case 'diamond':
				db.diamond += count;
				break;
			case 'addFriend':
				this._acceptAddFriendFromMail(mail.fromKey);
				break;
		}
	}


	private _useHeart()
	{
		let db = this._dbUser;
		this._refreshHeart();
		if (db.heart > 0)
		{
			--db.heart;
			if (db.heart < GameRules.MAX_HEART &&
				db.nextHeartTime === 0)
			{
				db.nextHeartTime = Date.now() + GameRules.HEART_TIME;
			}
			return true;
		}
		return false;
	}

	private _refreshHeart()
	{
		let db = this._dbUser;
		const MAX_HEART = GameRules.MAX_HEART;
		while (db.heart < MAX_HEART && Date.now() >= db.nextHeartTime)
		{
			++db.heart;
			if (db.heart < MAX_HEART)
			{
				db.nextHeartTime = db.nextHeartTime + GameRules.HEART_TIME;
			}
			else
			{
				db.nextHeartTime = 0;
				break;
			}
		}
		if (db.heart >= MAX_HEART)
		{
			db.nextHeartTime = 0;
		}
		return true;
	}

	private _refreshWeekHighScore()
	{
		let db = this._dbUser;
		if (typeof db.weekHighScoreDate !== 'number')
		{
			db.weekHighScoreDate = Date.now();
			db.weekHighScore = 0;
		}
		else
		{
			let d1 = new Date(db.weekHighScoreDate);
			let d2 = new Date();
			if (!isSameWeek(d1, d2))
			{
				//如果经过了一周，则发放周奖励
				if (db.weekHighScore > 0)
				{
					let score = db.weekHighScore;
					let arr = HighScoreAward.WeeklyHighScoreAward;
					let coin = 0;
					arr.forEach(item =>
					{
						if (score >= item.score) coin = item.coin;
					});
					if (coin > 0)
					{
						this.addMail('coin', coin, `您上周记录达到了${score}分，系统赠送了您${coin}金币，请查收。`);
					}
				}
				db.weekHighScoreDate = Date.now();
				db.weekHighScore = 0;
			}
		}
	}

	private _processHistoricalScoreAward(oldScore: number, newScore: number)
	{
		if (newScore > oldScore)
		{
			HighScoreAward.HistoricalHighScoreAward.forEach(item =>
			{
				let score = item.score;
				if (oldScore < score && newScore >= score)
				{
					this.addMail('coin', item.coin, `恭喜您最高分数达到${newScore}分，获得了系统赠送您的${item.coin}金币，请查收。`);
				}
			});
		}
	}

	private _refreshDailyTask()
	{
		if (!ENABLE_DAILY_TASK) return;
		let db = this._dbUser;
		//是不是要完成当前任务
		{
			let task: DT.IDailyTask = db.dailyTask;
			if (task && task.count >= task.maxCount)
			{
				let d = new Date(db.dailyTaskTime);

				let dayText = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
				this.addMail('coin', 500, `你完成了${dayText}的日常任务，奖励500金币`);//todo: 奖励做成可以配置的。甚至每个任务奖励不同的
				db.dailyTask = null;
			}
		}

		let newTask = false;
		let now = Date.now();
		if (typeof db.dailyTaskTime !== 'number')
		{
			db.dailyTaskTime = 0;
		}

		if (!Array.isArray(db.todayDailyTask) || !isSameDay(db.dailyTaskTime, now))
		{
			db.todayDailyTask = [];
			db.dailyTaskTime = Date.now();
			newTask = true;
		}



		if (!newTask && !db.dailyTask && db.todayDailyTask.length < DT.MAX_DAILY_TASK)
		{
			newTask = true;
		}

		if (newTask)
		{
			let arr = [];
			for (let i = 0; i < DT.DailyTaskTemplate.length; ++i)
			{
				if (db.todayDailyTask.indexOf(i) < 0)
					arr.push(i);
			}
			if (arr.length > 0)
			{
				let idx = arr[(arr.length * Math.random()) | 0];
				let task = DT.DailyTaskTemplate[idx];
				if (task)
				{
					db.dailyTask = {
						type: task.type,
						count: 0,
						maxCount: task.maxCount
					};
					db.todayDailyTask.push(idx);
				}
			}
		}
	}

	private _updateDailyTask(taskData: any)
	{
		if (!ENABLE_DAILY_TASK) return;
		if (!taskData) return;
		let task = this._dbUser.dailyTask;
		if (!task) return;
		let type = task.type;
		let count = taskData[type];
		if (typeof count === 'number' && count > 0)
		{
			task.count += count;
			this._refreshDailyTask();
		}
	}

	private sendDailyTask()
	{
		if (!ENABLE_DAILY_TASK) return;
		let db = this._dbUser;
		let count = 0;
		if (db.todayDailyTask)
		{
			if (!db.dailyTask)
			{
				count = db.todayDailyTask.length | 0;
			}
			else
			{
				count = (db.todayDailyTask.length - 1) | 0;
			}
		}
		this.socket.sendPacket({
			cmd: 'update',
			dailyTask: db.dailyTask,
			dailyTaskCount: count
		});
	}
	//测试用
	private _testFinishTask()
	{
		let db = this._dbUser;
		if (!db.weeklyTasks) return;
		let currentTask = db.weeklyTasks[db.weeklyTasks.length - 1];
		if (!currentTask) return;
		if (currentTask.status !== 'running') return;
		let finishCurrentTask = () =>
		{
			currentTask.status = 'satisfied';
			let logtask: any = currentTask;
			//找一下，拿出原版的desc
			let dbset = WT.getCurrentWeeklyTaskSet();
			if (dbset && dbset.tasks[db.weeklyTasks.length - 1])
			{
				logtask = dbset.tasks[db.weeklyTasks.length - 1];
			}
			console.log('finishTask:' + currentTask.desc);
			this.sendWeeklyTask();
		};
		finishCurrentTask();
	}

	/**一局游戏结束后调用的，更新并判断是否完成了任务 */
	private _updateWeeklyTask(taskData: any, output?: any)
	{
		let db = this._dbUser;
		if (!db.weeklyTasks) return;
		let currentTask = db.weeklyTasks[db.weeklyTasks.length - 1];
		if (!currentTask) return;
		if (currentTask.status !== 'running') return;
		let parsedType = WT.splitWeeklyTaskType(currentTask.type, currentTask.param);
		let typePrefix = parsedType[0];
		let typeSuffix = parsedType[1];//suffix会考虑到ballX或skillX的情况

		let finishCurrentTask = () =>
		{
			if (output) output.satisfied = true;
			currentTask.status = 'satisfied';
			let logtask: any = currentTask;
			//找一下，拿出原版的desc
			let dbset = WT.getCurrentWeeklyTaskSet();
			if (dbset && dbset.tasks[db.weeklyTasks.length - 1])
			{
				logtask = dbset.tasks[db.weeklyTasks.length - 1];
			}
			jrpc.weeklyTaskEnd(this, logtask);
			this.sendWeeklyTask();
		};

		{
			let value = taskData[typeSuffix];
			if (typeof value === 'number' && (value | 0) > 0)
			{
				value = value | 0;
				if (typePrefix === 'game')
				{
					if (value >= currentTask.maxCount)
					{
						finishCurrentTask();
						return;
					}
					else
					{
						console.info(`没有达到任务条件${currentTask.type},应该:${currentTask.maxCount} 实际:${value}`);
					}
				}
				else if (typePrefix === 'total')
				{
					currentTask.count += value;
					if (currentTask.count >= currentTask.maxCount)
					{
						finishCurrentTask();
						return;
					}
					this.sendWeeklyTask();
				}
			}
		}

		//外部需要处理一下，如果消除的球id=123消除了456个，则taskData['ball123'] = 456
		//处理特殊的任务类型 ballX和skillX
		/*if (typeSuffix === 'ballX' || typeSuffix === 'skillX')
		{
			let key = (typeSuffix === 'ballX' ? 'ball' : 'skill') + currentTask.param.toString();
			let value = taskData[key];
			if (typeof value === 'number' && (value | 0) > 0)
			{
				value = value | 0;
				if (typePrefix === 'game')
				{
					if (value >= currentTask.maxCount)
					{
						finishCurrentTask();
						return;
					}
				}
				else if (typePrefix === 'total')
				{
					currentTask.count += value;
					if (currentTask.count >= currentTask.maxCount)
					{
						finishCurrentTask();
						return;
					}
				}
			}
		}*/
		//如果达到了失败次数，也算作任务完成了
		if (currentTask.failCount > 0)
		{
			++currentTask.fail;
			if (currentTask.fail >= currentTask.failCount)
			{
				finishCurrentTask();
				return;
			}
			this.sendWeeklyTask();
		}
	}
	private _recvReqEndWeeklyTask(obj)
	{
		let db = this._dbUser;
		if (Array.isArray(db.weeklyTasks))
		{
			let task = db.weeklyTasks[db.weeklyTasks.length - 1];
			if (task)
			{
				if (task.status === 'satisfied')
				{
					task.status = 'end';
					this._addWeeklyTask(false);
					this.sendWeeklyTask();

					if (task.prizeType && task.prizeCount > 0)
					{
						let name = '';
						switch (task.prizeType)
						{
							case 'coin': name = '金币'; break;
							case 'heart': name = '红心'; break;
							case 'diamond': name = '钻石'; break;
						}
						this.addMail(task.prizeType as any, task.prizeCount, `完成冒险"${task.desc}"奖励${task.prizeCount}${name}`);
					}
				}
			}
		}
	}
	private _recvReqWeeklyTask()
	{
		let sysWTTask = WT.getCurrentWeeklyTaskSet();
		let db = this._dbUser;
		if (sysWTTask)
		{
			if (!db.weeklyTasks || db.weeklyTaskId !== sysWTTask.id)
			{
				this._addWeeklyTask(true);
			}
		}
	}
	//用户登录的时候调用一下，如果毛线任务发生的变化，则刷新ing一下
	private _refreshWeeklyTask()
	{
		let db = this._dbUser;
		let sysWTTask = WT.getCurrentWeeklyTaskSet();
		if (!sysWTTask || (sysWTTask.id !== db.weeklyTaskId))
		{
			db.weeklyTaskId = null;
			db.weeklyTasks = null;
		}
	}

	//假定上一个任务已经完成，或者当前任务是空的，增加一个新的任务
	//  if (callSendWeeklyTask) 在数据发生变化的时候，会自动调用sendWeeklyTask()
	private _addWeeklyTask(callSendWeeklyTask: boolean)
	{
		let changed = false;
		let sysWTTask = WT.getCurrentWeeklyTaskSet();
		let db = this._dbUser;
		if (!sysWTTask)
		{
			changed = !!db.weeklyTasks;
			db.weeklyTaskId = null;
			db.weeklyTasks = null;
			if (changed && callSendWeeklyTask)
			{
				this.sendWeeklyTask();
			}
			return;
		}
		else if (sysWTTask.id !== db.weeklyTaskId)
		{
			db.weeklyTaskId = sysWTTask.id;
			db.weeklyTasks = [];
			changed = true;
		}

		if (!Array.isArray(db.weeklyTasks))
		{
			db.weeklyTasks = [];
			changed = true;
		}
		let sysTask = sysWTTask.tasks[db.weeklyTasks.length];
		if (sysTask)
		{
			let obj = {
				status: 'running' as ('running' | 'satisfied' | 'end'), //.... make compiler happy
				type: sysTask.type,
				param: -1,
				count: 0,
				maxCount: sysTask.maxCount,
				fail: 0,
				failCount: sysTask.failCount,
				prizeType: sysTask.prizeType,
				prizeCount: sysTask.prizeCount,
				desc: sysTask.desc
			};
			if (obj.type.indexOf('X') >= 0)
			{
				let arr = [];
				for (let i = 0; i < db.pets.length; ++i)
				{
					if (db.pets[i])
						arr.push(i);
				}
				if (arr.length > 0)
				{
					obj.param = arr[(Math.random() * arr.length) | 0];
				}
			}

			db.weeklyTasks.push(obj);
			changed = true;
		}
		if (changed && callSendWeeklyTask)
		{
			this.sendWeeklyTask();
		}
	}
	sendWeeklyTask()
	{
		let db = this._dbUser;
		let arr = [];
		let tasks = db.weeklyTasks;
		if (tasks)
		{
			for (let task of tasks)
			{
				let obj: any = {
					type: task.type,
					status: task.status,
					desc: task.desc,
					prizeType: task.prizeType
				};

				if (task.status === 'running')
				{
					obj.fail = task.fail;
					obj.failCount = task.failCount;
					obj.count = task.count;
					obj.maxCount = task.maxCount;
					obj.param = task.param;
				}
				arr.push(task);
			}
		}
		let weeklyTaskCount = 0;
		let sysTasks = WT.getCurrentWeeklyTaskSet();
		let weeklyTaskPrize = [];
		if (sysTasks)
		{
			weeklyTaskCount = sysTasks.tasks.length;
			//for (let task of sysTasks.tasks)
			for (let i = 0; i < sysTasks.tasks.length; ++i)
			{
				let task = sysTasks.tasks[i];
				let prizeType = task.prizeType;
				if (db.weeklyTasks && i < db.weeklyTasks.length &&
					db.weeklyTasks[i].status === 'end')
				{
					prizeType = null;
				}
				if (prizeType)
				{
					weeklyTaskPrize.push({
						idx: i,
						type: prizeType,
						count: task.prizeCount
					});
				}

			}
		}
		this.socket.sendPacket({
			cmd: 'update',
			weeklyTasks: arr,
			weeklyTaskCount: weeklyTaskCount,
			weeklyTaskPrize: weeklyTaskPrize,
		});
	}
	private _recvUnlockPet(obj)
	{
		let idx = obj.idx;
		let sendError = (msg, nocoin?, need?: number) =>
		{
			let obj = {
				cmd: 'unlockPetError',
				msg: msg,
				nocoin: nocoin,
				need
			};
			this.socket.sendPacket(obj);
		}
		if (typeof idx === 'number' && (idx | 0) === idx)
		{
			let db = this._dbUser;
			let pet = db.pets[idx];
			if (!pet)
			{
				sendError('你没有此宠物');
				return;
			}
			if (pet.level !== pet.lockedLv)
			{
				sendError('此宠物当前不能解锁')
				return;
			}
			let data = PetRules.getPetUnlockData(pet.id, pet.level);
			if (!data)
			{
				sendError('此宠物不能解锁');
				return;
			}
			if (db.coin < data.price)
			{
				sendError('你的金币不够', true, data.price);
				return;
			}
			jrpc.consumedataEx(this.dbuser.usertype, this.key, db.nickname, jrpc.CONSUME_TYPE_UNLOCK_PET, data.price, 1, db.coin, '解锁宠物等级');
			db.coin -= data.price;
			pet.lockedLv = data.nextLevel;
			let obj2: any = {};
			this.sendPetInfo(obj2);
			obj2.coin = db.coin;
			obj2.cmd = 'update';
			this.socket.sendPacket(obj2);
		}
	}
	//是不是可以抽取这个宠物
	//技能等级没有满，或者等级没有满
	//被 recvBuyGift 使用
	private _canAddPet(idx: number)
	{
		let pet = this._dbUser.pets[idx];
		if (!pet) return true;
		let skillDefine = PetSkillDesc.PetSkillDesc[PetRules.PET_SKILL[idx]];
		if (skillDefine && pet.skillLv < skillDefine.maxLevel)
			return true;
		if (pet.level < pet.lockedLv)
			return true;
		return false;
	}
	//增加一个宠物
	//如果有了则，增加技能经验，
	//如果技能经验满了，则增加等级经验200
	//被 recvBuyGift 使用
	private _addPet(idx: number, num: number)
	{
		if (!(idx >= 0 && idx < PetRules.MAX_PET_COUNT)) 
		{
			throw new Error("invalid pet id=" + idx);
		}
		let db = this._dbUser;
		let changed = false; //是不是发生了变化，如果有，则需要发送宠物信息
		while (num > 0)
		{
			--num;
			let pet = db.pets[idx];
			if (!pet)
			{
				for (let i = 0; i < idx; ++i)
				{
					if (typeof db.pets[i] === 'undefined')
					{
						db.pets[i] = null;
					}
				}
				db.pets[idx] = {
					id: idx,
					level: 1,
					exp: 0,
					skillLv: 1,
					skillExp: 0,
					lockedLv: 5
				};
				changed = true;
				continue;
			}
			//给宠物加技能等级
			let skillDefine = PetSkillDesc.PetSkillDesc[PetRules.PET_SKILL[idx]];
			if (skillDefine && pet.skillLv < skillDefine.maxLevel)
			{
				++pet.skillExp;
				if (pet.skillExp >= PetRules.getPetSkillLevelUpExp(idx, pet.skillLv))
				{
					++pet.skillLv;
					pet.skillExp = 0;
				}
				changed = true;
				continue;
			}
			//给宠物家经验
			let EXP_TO_ADD = 200;
			while (EXP_TO_ADD > 0 && pet.level < pet.lockedLv)
			{
				let maxExp = PetRules.getPetLevelUpExp(idx, pet.level);
				if (pet.exp + EXP_TO_ADD >= maxExp)
				{
					EXP_TO_ADD = maxExp - pet.exp;
					pet.exp = 0;
					pet.level++;
				}
				else
				{
					pet.exp += EXP_TO_ADD;
					EXP_TO_ADD = 0;
				}
				changed = true;
			}
		}
		if (changed)
		{
			this.sendPetInfo();
		}
	}
	private _recvBuyGift(obj)
	{
		let sendBuyError = (msg, nocoin?, need?: number) =>
		{
			this.socket.sendPacket({
				cmd: 'buyGiftError',
				msg,
				nocoin,
				need
			});
		}
		let define = GD.getShopGift(obj.idx);
		if (!define)
		{
			sendBuyError('礼包不存在');
			return;
		}

		let gifts = define.gifts.filter(x =>
		{
			if (x.type === 'pet')
			{
				return this._canAddPet(x.id);
			}
			return false;
		});
		if (gifts.length <= 0)
		{
			sendBuyError('这里礼包你不能买，宠物都满级了');
			return;
		}
		let db = this._dbUser;
		let FREE_ITEM_STRING = 'firstFreeGift';
		let isfree = false;
		if (!Array.isArray(db.boughtItems) || db.boughtItems.indexOf(FREE_ITEM_STRING) < 0)
		{
			isfree = true;
		}

		if (!isfree && db.coin < define.price)
		{
			sendBuyError('你的金币不够', true, define.price);
			return;
		}
		let giftIdx = randomChooseByPP(gifts);
		if (isfree)
		{
			giftIdx = 1;
		}
		if (giftIdx < 0 || !gifts[giftIdx])
		{
			sendBuyError('购买出错了');
			return;
		}
		let gift = gifts[giftIdx];

		let oldSkillExp = 0;
		let newSkillExp = 0;
		if (db.pets[gift.id])
		{
			let pet = db.pets[gift.id];
			oldSkillExp = pet.skillLv + pet.skillExp / PetRules.getPetSkillLevelUpExp(gift.id, pet.skillLv);
		}

		this._addPet(gift.id, gift.num);
		if (db.pets[gift.id])
		{
			let pet = db.pets[gift.id];
			newSkillExp = pet.skillLv + pet.skillExp / PetRules.getPetSkillLevelUpExp(gift.id, pet.skillLv);
		}
		if (isfree)
		{
			if (Array.isArray(db.boughtItems))
			{
				db.boughtItems.push(FREE_ITEM_STRING);
			}
			else
			{
				db.boughtItems = [FREE_ITEM_STRING];
			}
			this.socket.sendPacket({ cmd: 'update', boughtItems: db.boughtItems });
		}
		else
		{
			jrpc.consumedataEx(this.dbuser.usertype, this.key, db.nickname, jrpc.CONSUME_TYPE_BUY_GIFT + (obj.idx | 0), define.price, 1, db.coin, '购买礼包');
			db.coin -= define.price;
		}

		let retGiftObject: any = {
			id: gift.id,
			num: gift.num
		};
		if (oldSkillExp === 0 && newSkillExp > 0)
		{
			retGiftObject['new'] = true;
		}
		else if (oldSkillExp > 0 && newSkillExp > oldSkillExp)
		{
			retGiftObject.skillExp1 = oldSkillExp;
			retGiftObject.skillExp2 = newSkillExp;
		}
		//update coin
		this.socket.sendPacket({ cmd: 'update', coin: db.coin });
		this.socket.sendPacket({
			cmd: 'buyGiftSuccess',
			gift: retGiftObject
		});
	}

	_refreshFriendList()
	{
		let userKeys = [];
		let ff = this.dbuser.friends;
		for (let i = 0; i < ff.length; ++i)
		{
			if (ff[i] && typeof ff[i].key === 'string')
			{
				userKeys.push(ff[i].key);
			}
		}

		this._server.queryUserScores(userKeys, ret =>
		{
			if (!this.isLogined) return;
			ret = ret.filter(x => !!x);
			for (let i = 0; i < ret.length; ++i)
			{
				if (this._canSendHeart(ret[i].key))
				{
					ret[i]['canSendHeart'] = true;
				}
			}
			this._friendList = ret;
			this.socket.sendPacket({ cmd: 'update', friends: this._friendList });
		});
	}
	/** 返回，是不是可以给这个用户发送红心 */
	_canSendHeart(key: string)
	{
		let ff = this.dbuser.friends;
		let idx = this._findFriendInDB(key);
		if (idx >= 0)
		{
			let f = ff[idx];
			if (typeof f.lastSendHeartTime !== 'number')
			{
				return true;
			}
			return !isSameDay(f.lastSendHeartTime, Date.now());
		}
		return false;
	}

	/** 查找好友的小标 */
	_findFriendInDB(key: string)
	{
		let ff = this.dbuser.friends;
		for (let i = 0; i < ff.length; ++i)
		{
			if (ff[i] && ff[i].key === key)
				return i;
		}
		return -1;
	}

	/**
	 * 初始化的时候调用
	*/
	_initFriends(obj?)
	{
		//如果有friend，则尝试添加好友并刷新好友列表，否则立即刷新好友
		if (obj && typeof obj.from === 'string' && obj.from !== this.key && this._findFriendInDB(obj.from) < 0)
		{
			this._server.requestAddFriend(this, obj.from, (success) =>
			{
				if (success) util.safePush(this.dbuser, 'friends', { key: obj.from });
				this._refreshFriendList();
			})
			return;
		}
		else
		{
			this._refreshFriendList();
		}
	}

	_acceptAddFriendFromMail(key)
	{
		console.log(`接受来自${key}加好友的请求`)
		if (typeof key === 'string' && key !== this.key && this._findFriendInDB(key) < 0)
		{
			this._server.requestAddFriend(this, key, (success) =>
			{
				console.log(`接受来自${key}加好友的请求，结果=>${success}`)
				if (success && this.dbuser.friends.length < DBUser.MAX_FRIEND_COUNT)
				{
					util.safePush(this.dbuser, 'friends', { key: key });
					this._refreshFriendList();
					this._checkAddFriendAward();
				}
			})
			return true;
		}
		return true;
	}

	/**
	 * 当当前这个用户在线的情况下，添加另一个人(f)为好友
	 */
	_addFriendOnline(f: GameUser)
	{
		if (this._findFriendInDB(f.key) < 0 && this.dbuser.friends.length < DBUser.MAX_FRIEND_COUNT)
		{
			util.safePush(this.dbuser, 'friends', { key: f.key });
			if (this._friendList)
			{
				let obj: IFriendInfo = {
					key: f.key,
					nickname: f.dbuser.nickname,
					weekHighScore: f.dbuser.weekHighScore | 0,
					historicalHighScore: f.dbuser.historicalHighScore | 0,
					currentPet: f.dbuser.currentPet | 0,
				};
				obj['canSendHeart'] = true;
				this._friendList.push(obj);
				this.socket.sendPacket({ cmd: 'updateFriend', friend: obj });
				this._checkAddFriendAward();
			}
		}
	}
	/**
	 * 同上，但是是删除好友
	 */
	_removeFriendOnline(f: GameUser)
	{
		let idx = this._findFriendInDB(f.key);
		if (idx >= 0)
		{
			this.dbuser.friends.splice(idx, 1);
			if (this._friendList)
			{
				this.socket.sendPacket({
					cmd: 'removeFriend', key: f.key
				});
			}
		}
	}

	_recvRemoveFriend(obj)
	{
		if (typeof obj.key === 'string' && this._friendList)
		{
			let idx = this._findFriendInDB(obj.key);
			if (idx >= 0)
			{
				this.dbuser.friends.splice(idx, 1);
				this.socket.sendPacket({ cmd: 'removeFriend', key: obj.key });
				this._server.requestRemoveFreind(this, obj.key, () => { });
			}
		}
	}

	//查询好友的详细信息
	_recvQueryFriend(obj)
	{
		if (typeof obj.key === 'string')
		{
			this._server.getUserForRead(obj.key).then(user =>
			{
				if (!this.isLogined) return;
				let text = "";
				let pet = user.pets[user.currentPet];
				text += `携带果冻：Lv${pet ? pet.level : 1}果冻(技能等级Lv${pet ? pet.skillLv : 1})\n`;
				text += `最高分数：${user.historicalHighScore | 0}\n`;
				text += `最高连击：${user.maxCombo}\n`;
				text += `最长连接：${user.maxLink}\n`;
				let petCount = 0;
				let petTotalLevel = 0;
				for (let pet of user.pets)
				{
					if (pet)
					{
						++petCount;
						petTotalLevel += pet.level;
					}
				}

				text += `果冻数量：${petCount}\n`;
				text += `果冻总等级：${petTotalLevel}\n`;
				text += `总消除果冻：${user.totalKill}\n`;
				let petName = PetRules.PET_NAMES[user.currentPet];
				let retobj = {
					cmd: 'queryFriend',
					key: obj.key,
					selPet: `Lv${pet ? pet.level : 1}${petName}(技能等级Lv${pet ? pet.skillLv : 1})`,
					highScore: user.historicalHighScore | 0,
					maxCombo: user.maxCombo | 0,
					maxLink: user.maxLink | 0,
					petCount: petCount,
					petTotalLevel: petTotalLevel,
					totalKill: user.totalKill,
					weekScore: user.weekHighScore | 0,
					nickname: user.nickname,
					faceurl: user.faceurl,
				};

				this.socket.sendPacket(retobj);
			}, e => { });
		}
	}
	//赠送好友一颗红心
	_recvSendFriendHeart(obj)
	{
		//先检查是不是到达了上限20个
		let db = this.dbuser;
		let now = Date.now();
		if (!isSameDay(now, +db.sendHeartCountTime))
		{
			db.sendHeartCountTime = now;
			db.sendHeartCount = 0;
		}

		if (!(db.sendHeartCount < 20))
		{
			this.socket.sendPacket({ cmd: 'sendHeartError', msg: '已经到达了发送红心的上限了' });
			return;
		}

		if (typeof obj.key === 'string' && this._canSendHeart(obj.key))
		{
			let idx = this._findFriendInDB(obj.key);
			if (idx >= 0)
			{
				this._dbUser.friends[idx].lastSendHeartTime = Date.now();
			}
			let mailExtraData = { _friendheart: true }; //邮件中，特殊的标记，表示从好友那里来的体力
			this._server.addMail(obj.key, 'heart', 1, `你的好友${this._dbUser.nickname}送你一个体力`, (err) =>
			{
				if (err)
				{
					console.log(`发送邮件给：${obj.key}失败,`, err);
				}
			}, mailExtraData);
			db.sendHeartCount++;
			db.heart++;
			this._refreshHeart();
			this.sendBasicInfo();
		}
	}

	_recvBuyCoin(obj)
	{
		let sendError = (msg, nodiamond?, need?) =>
		{
			this.socket.sendPacket({ cmd: 'buyCoinError', msg: msg, nodiamond, need });
		};
		if (typeof obj.item !== 'string') return;
		for (let item of PD.BUY_COIN_DEFINE)
		{
			if (item.id === obj.item)
			{
				let db = this.dbuser;
				if (db.diamond >= item.diamond)
				{
					jrpc.consumedataEx(this.dbuser.usertype, this.key, db.nickname, jrpc.CONSUME_TYPE_BUY_COIN, item.diamond, item.coin, db.diamond, '用钻石购买金币');
					db.diamond -= item.diamond;
					db.coin += item.coin;
					this.sendBasicInfo();
					this.socket.sendPacket({ cmd: 'animation', type: 'buyCoin', count: item.coin });
					this.socket.sendPacket({ cmd: 'buyEnd' });
				}
				else
				{
					sendError('你没有足够的钻石', true, item.diamond);
				}
				return;
			}
		}
		sendError('购买的商品不存在');
	}

	_recvBuyHeart(obj)
	{
		let sendError = (msg, nodiamond?, need?) =>
		{
			this.socket.sendPacket({ cmd: 'buyHeartError', msg: msg, nodiamond, need });
		};
		if (typeof obj.item !== 'string') return;
		for (let item of PD.BUY_HEART_DEFINE)
		{
			if (item.id === obj.item)
			{
				let db = this.dbuser;
				if (db.diamond >= item.diamond)
				{
					db.diamond -= item.diamond;
					jrpc.consumedataEx(this.dbuser.usertype, this.key, db.nickname, jrpc.CONSUME_TYPE_BUY_HEART, item.diamond, item.heart, db.diamond, '购买体力');
					db.heart += item.heart;
					this._refreshHeart();
					this.sendBasicInfo();
					this.socket.sendPacket({ cmd: 'animation', type: 'buyHeart', count: item.heart });
					this.socket.sendPacket({ cmd: 'buyEnd' });
				}
				else
				{
					sendError('你没有足够的钻石', true, item.diamond);
				}
				return;
			}
		}
		sendError('购买的商品不存在');
	}

	_recvBuyDiamond(obj)
	{
		let sendError = (msg) =>
		{
			this.socket.sendPacket({ cmd: 'buyDiamondError', msg: msg });
		};
		if (typeof obj.item !== 'string') return;
		for (let item of PD.BUY_DIAMOND_DEFINE)
		{
			if (item.id === obj.item)
			{
				if (item.onlyonce)
				{
					if (!Array.isArray(this.dbuser.boughtItems)) this.dbuser.boughtItems = [];
					if (this.dbuser.boughtItems.indexOf(item.id) >= 0)
					{
						sendError('好东西只能\n买一次。')
						return;
					}
					this.dbuser.boughtItems.push(item.id);
				}

				let url = cash.generatePaymentUrl(this, this.key, item.cash, `购买${item.diamond}个钻石`, item.diamond, obj.backUrl);
				this.socket.sendPacket({ cmd: 'buyDiamond', url: url });
				return;
			}
		}
		sendError('购买的商品不存在');
	}

	_recvSearchFriend(obj)
	{
		let sendResult = (ret: any[]) =>
		{
			ret = ret.filter(f =>
			{
				if (!f) return false;
				f.key = f._id;
				if (this.key === f.key) return false;
				//if (this._friendList && this._friendList.some(x => x && x.key === f.key)) return false;
				return true;
			})
			this.socket.sendPacket({ cmd: 'searchFriendResult', friends: ret })
		}
		if (typeof obj.name !== 'string') return;
		if (obj.name === '') return sendResult([]);
		DBUser.searchUser(obj.name).then(result => sendResult(result)).catch(() => sendResult([]));
	}
	/**请求添加好友 */
	_recvRequestAddFriend(obj)
	{
		let key = obj.key;
		if (typeof key !== 'string') return;
		if (this.key === key || this._findFriendInDB(key) >= 0)
		{
			return;
		}
		this._server.userRequestAddFriend(this, obj.key, success =>
		{
			console.log(`${this.key}请求添加好友${obj.key} = ${success}`);
		});
	}

	_recvUseDiamond(obj)
	{
		let count = obj.count | 0;
		if (count > 0)
		{
			if (count <= this.dbuser.diamond)
			{
				jrpc.consumedataEx(this.dbuser.usertype, this.key, this.dbuser.nickname, jrpc.CONSUME_TYPE_GAME_OTHER, count, 1, this.dbuser.diamond, '游戏其他:' + obj.reason);
				this.dbuser.diamond -= count;
				this.socket.sendPacket({
					cmd: 'update',
					diamond: this.dbuser.diamond
				});
			}
		}
	}

	//登陆的时候，调用一下，发放每日登录奖励
	_checkEverydayGift()
	{
		let now = Date.now();
		let db = this.dbuser;
		if (typeof db.previousEverydayGiftTime !== 'number' || !isSameDay(now, db.previousEverydayGiftTime))
		{
			db.previousEverydayGiftTime = now;
			this.addMail('coin', 300, '每日登陆奖励300金币~~');
		}
	}
}



function isSameDay(t1: number, t2: number) 
{
	if (Math.abs(t2 - t1) > 24 * 3600 * 1000) return false;
	let d1 = new Date(t1);
	let d2 = new Date(t2);
	return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
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

/** 根据arr中元素的pp属性为概率，随机选取一个 */
function randomChooseByPP(arr: { pp: number }[]): number 
{
	if (arr.length > 0)
	{
		let total = 0;
		for (let i = 0; i < arr.length; ++i) total += arr[i].pp;
		let x = Math.random() * total;
		for (let i = 0; i < arr.length; ++i)
		{
			x -= arr[i].pp;
			if (x <= 0) return i;
		}
		return arr.length - 1;
	}
	return -1;
}
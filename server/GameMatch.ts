import {GameUser} from "./GameUser"
import * as PetRules from "../shared/PetRules"
import * as assert from "assert"
import {MATCH_AWARD} from "../shared/MatchRules"
/*const WINNER_COIN = {
	"11": 1800,
	"44": 3000,
	"master": 11000
};*/


type MatchPlayerStatus = "matching" |  //匹配中
	"loading" | //匹配成功，开始loading
	"ready" |   //loading完成
	"playing" | //正在玩游戏
	"gameover" //游戏结束等待中

export class MatchPlayer
{
	user: GameUser;
	status: MatchPlayerStatus;
	isLinkLost = false;
	//matching variables
	matchStartTime = Date.now();//开始匹配的时间
	matchExp: number = 0;       //匹配经验
	currentStatusStartTime = Date.now();
	lastUpdateTime = Date.now();
	//gaming variables
	gameStartObject: any;
	gameScore = 0;
	gameLeftTime = 0;
	gameOverObject: any;
	type: string;

	constructor(user: GameUser, type: string)
	{
		this.user = user;
		this.type = type;
	}

	prepareGameStartObject()
	{
		if (this.gameStartObject) return;
		let pets = [];
		let usedColors: any = {};
		let currentPet = this.user.dbuser.currentPet | 0;
		let pet = this.user.dbuser.pets[currentPet];
		pets.push(currentPet);
		usedColors[PetRules.PET_REAL_COLORS[currentPet]] = true;
		while (pets.length < 5)
		{

			let idx = (Math.random() * PetRules.MAX_PET_COUNT) | 0;
			if (pets.indexOf(idx) < 0 && !usedColors[PetRules.PET_REAL_COLORS[idx]])
			{
				pets.push(idx);
				usedColors[PetRules.PET_REAL_COLORS[idx]] = true;
			}
		}
		this.gameStartObject = {
			id: Date.now() + '' + Math.random(),
			time: Date.now(),
			totalTime: 60,
			skillLevel: pet ? (pet.skillLv | 0) : 0,
			pets: pets,
			items: [],
			scoreExtraRate: 0,
			isMatch: true,
			matchType: this.type
		};
	}
}

export class MatchGame
{
	players: MatchPlayer[];
	closed = false;
	type: string;
	constructor(players: MatchPlayer[], type: string)
	{
		this.players = players.slice();
		this.type = type;
	}

	getOthers(p: MatchPlayer | GameUser): MatchPlayer[]
	{
		return this.players.filter(pp =>
		{
			if (pp === p || pp.user === p) return false;
			return true;
		})
	}
	getOther(p: MatchPlayer | GameUser): MatchPlayer
	{
		if (p === this.players[0] || p === this.players[0].user) return this.players[1];
		return this.players[0];
	}

	getMatchPlayer(p: GameUser)
	{
		return p.matchPlayer;
	}
	//开始比赛啦
	//函数调用完成后，所有玩家都是loading状态啦
	startMatch()
	{
		let now = Date.now();
		for (let p of this.players)
		{
			p.status = 'loading';
			p.lastUpdateTime = now;
			p.currentStatusStartTime = now;
			p.prepareGameStartObject();
		}

		for (let p of this.players)
		{
			this.sendPlayerInfo(p);
			this.sendStatusToOther(p);
			p.user.socket.sendPacket({
				cmd: 'match_start',
				gameStartObject: p.gameStartObject,
				type: this.type
			});
		}
	}


	setReady(user: GameUser)
	{
		let player = this.getMatchPlayer(user);
		//let other = this.getOther(player);
		if (player.status === 'loading')
		{
			player.status = 'ready';
			player.lastUpdateTime = Date.now();
			player.currentStatusStartTime = Date.now();
			if (this.players.every(p => p.status === 'ready' || p.isLinkLost))
			{
				this.startPlaying();
			}
			else
			{
				this.sendStatusToOther(player);
			}
		}
	}

	startPlaying()
	{
		for (let p of this.players)
		{
			if (!p.isLinkLost)
			{
				p.status = 'playing';
				p.lastUpdateTime = Date.now();
				p.currentStatusStartTime = Date.now();
				p.user.socket.sendPacket({
					cmd: 'match_go'
				});
			}
		}
	}

	setGameScore(user: GameUser, obj: any)
	{
		let player = this.getMatchPlayer(user);
		if (player.status === 'playing')
		{
			player.lastUpdateTime = Date.now();
			player.gameScore = obj.gameScore | 0;
			player.gameLeftTime = obj.gameScore | 0;
			this.sendStatusToOther(player);
		}
	}

	setGameOver(user: GameUser, obj: any)
	{
		let player = this.getMatchPlayer(user);
		if (player.status === 'playing')
		{
			player.lastUpdateTime = Date.now();
			player.status = 'gameover';
			player.currentStatusStartTime = Date.now();

			let goObject: any = {};
			player.user.processGameResult(obj, player.gameStartObject, goObject);
			player.user.currentGame = null;

			if (goObject.cmd === 'gameover') //cmd === 'gameover'表示，其实是正常结束游戏了
			{
				player.gameScore = goObject.score | 0;
				player.gameLeftTime = 0;
			}
			player.gameOverObject = goObject;

			this.sendStatusToOther(player);
			//判断是不是需要结束游戏了
			//let other = this.getOther(player);
			if (this.players.every(p => p.isLinkLost || p.status === 'gameover'))
			{
				this.endMatch();
			}
		}
	}
	//正常结束比赛
	endMatch()
	{
		if (this.closed) 
		{
			console.trace('closed and endMatch again');
			return;
		}
		var winner = null;
		var winner_score = 0;
		for (let p of this.players)
		{
			if (p.gameScore > winner_score)
			{
				winner = p;
				winner_score = p.gameScore;
			}
		}
		var sortedPlayer = this.players.slice();
		sortOnKey(sortedPlayer, 'gameScore');
		var matchPlayerResultList = [];
		for (let p of sortedPlayer)
		{
			let coin = 0;
			if (p === winner) coin = MATCH_AWARD[this.type];
			matchPlayerResultList.push({
				key: p.user.key,
				score: p.gameScore,
				coin: coin,
				nickname: p.user.dbuser.nickname,
				faceurl: p.user.dbuser.faceurl
			});
		}

		for (let p of this.players)
		{
			if (!p.isLinkLost)
			{
				if (p.gameOverObject)
				{
					p.gameOverObject.isMatch = true;
					p.gameOverObject.matchType = p.type;
					p.gameOverObject.matchPlayerResultList = matchPlayerResultList;
					var other = this.getOther(p);
					if (p === winner)
					{
						//给胜利的人，加钱
						var coinToAdd = MATCH_AWARD[this.type] | 0;
						p.user.dbuser.coin += coinToAdd
						p.user.socket.sendPacket({ cmd: 'update', coin: p.user.dbuser.coin });
						p.gameOverObject.coin = coinToAdd;
						p.gameOverObject.win = true;
					}
					else
					{
						p.gameOverObject.coin = 0;
					}
					p.user.socket.sendPacket(p.gameOverObject);
				}
				p.user.matchGame = null;
				p.user.matchPlayer = null;
			}
		}
		this.close();
	}

	setLinkLost(user: GameUser)
	{
		if (this.closed) return;
		let player = this.getMatchPlayer(user);
		if (!player.isLinkLost)
		{
			player.isLinkLost = true;
			player.user.matchGame = null;
			player.user.matchPlayer = null;
			this.sendStatusToOther(player);
			if (this.players.every(p => p.isLinkLost))
			{
				this.close();
				return;
			}
			if (this.players.every(p => p.isLinkLost || p.status === 'ready'))
			{
				this.startPlaying();
				return;
			}
			if (this.players.every(p => p.isLinkLost || p.status === 'gameover'))
			{
				this.endMatch();
				return;
			}
		}
	}

	private kick(p: MatchPlayer, reason?: string)
	{
		if (!p.isLinkLost)
		{
			p.user.socket.sendPacket({
				cmd: 'cancelMatchGame',
				type: this.type,
				reason: reason,
			});
			this.setLinkLost(p.user);
		}
	}

	close()
	{
		for (var p of this.players)
		{
			if (p.user.matchGame === this)
				p.user.matchGame = null;
			if (p.user.matchPlayer === p)
				p.user.matchPlayer = null;
		}
		this.closed = true;
	}

	sendStatusToOther(p: MatchPlayer)
	{
		//	let other = this.getOther(p);
		//	if (other.isLinkLost) return;
		let obj: any = { cmd: 'match_playerStatus' };
		obj.key = p.user.key;
		obj.status = p.status;
		if (p.isLinkLost) obj.isLinkLost = true;
		if (p.status === 'playing' || p.status === 'gameover')
		{
			obj.gameScore = p.gameScore;
			obj.gameLeftTime = p.gameLeftTime;
		}
		for (var other of this.getOthers(p))
		{
			if (!other.isLinkLost)
			{
				other.user.socket.sendPacket(obj);
			}
		}
	}

	sendPlayerInfo(p: MatchPlayer)
	{
		let obj = {
			cmd: 'match_player',
			key: p.user.key,
			nickname: p.user.dbuser.nickname,
			faceurl: p.user.dbuser.faceurl
		};
		for (let other of this.players)
		{
			if (other === p) continue;
			if (!other.isLinkLost)
			{
				other.user.socket.sendPacket(obj);
			}
		}
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
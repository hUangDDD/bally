///<reference path="../../typings/tsd.d.ts"/>
import {GraphicConstant as GC} from "../resource"
import {GameStage} from "../GameStage"
import * as res from "../resource"
import {BallRenderer} from "./BallRenderer"
import {Ball} from "./Ball"
import * as util from "../util"
import {SimpleButton} from "../SimpleButton"
import {GameImageLoader} from "./GameImageLoader"
import {ImageLoader} from "./ImageLoader"
import {MiniImageLoader} from "../MiniImageLoader"
import * as GameRules from "./GameRules"
import * as GameUtil from "./GameUtil"
import {LineRenderer} from "./LineRenderer"
import {ScoreControl} from "./ScoreControl"
import {SkillButton} from "./SkillButton"
import {IGameSkill} from "./skill/IGameSkill"
import * as AllSkill from "./skill/AllSkill"
import {GameAnimation} from "./GameAnimation"
import {FeverBar} from "./FeverBar"
import * as GameItemDefine from "../GameItemDefine"
import * as GameWorker from "./GameWorker";
import {GameLink} from "../GameLink"
import {HallUI} from "../hall/HallUI"
import {PetSkillDesc} from "../../shared/PetSkillDesc"
import * as WT from "../../shared/WeeklyTaskDefine"
import {SoundManager} from "../SoundManager"
import {ImageButton} from "../ImageButton"
import {GamePausePanel} from "./GamePausePanel"
import {GameTutorial} from "./GameTutorial"
import * as PetRules from "../../shared/PetRules"
import * as GameWroker from "./GameWorker"
import {NeedMoreTimeDialog} from "./NeedMoreTimeDialog"
import {MatchUI} from "./MatchUI"
import {BitmapText} from "../hall/shared/BitmapText"
//这是一个由服务器发来的结构，启动游戏的参数应该都在里面
export interface IGameStartInfo
{
	totalTime: number;      //游戏总时间(秒)
	//skillId: number;        //技能序号
	skillLevel: number;     //技能等级，从1开始
	scoreExtraRate: number; //额外的金币奖励
	pets: number[];         //用哪几个球。第一个是当前携带的宠物
	items: string[];        //当前携带的游戏道具（只有部分需要由客户端自己处理，其它的都由服务器端处理）
	tutorial?: boolean;
	isMatch?: boolean;
	matchType?: string;
}

const b2Vec2 = Box2D.Common.Math.b2Vec2;
const COMBO_TIMEOUT = 3;
const SHAKE_TIMEOUT = 1;
/** 炸弹的爆炸半径，圆心落入半径的都被炸掉 */
const BOMB_RADIUS = Ball.MAX_RADIUS * 2.5 * 1.333;

//下面的关于fever的数值。假定fever满是1.0（38格）

/**每个球增加的fever */
const FEVER_ADD_PER_BALL = 1 / 38;
/**每秒减少的fever数量 */
const FEVER_DECREASE_PER_SECOND = 1 / 38;
/**fever的时候每秒减少的fever数量 */
const FEVER_DECREASE_WHEN_FEVER_PER_SECOND = 4 / 38;
/**fever的时候加多少游戏时间 */
const FEVER_ADD_GAME_TIME = 5;
/**fever时候分数加的倍数 */
const FEVER_SCORE_MULTIPY = 1.3;

// 自动爆炸炸弹
const AUTO_BOMB_FIRST_DELAY = 2.5;
const AUTO_BOMB_DELAY = 2;


let g_CachedWorker = null;
let g_GameId = 112;
export class Game
{
	static MAX_LINK_DISTANCE = 160; /**两个球最大的可连接距离 */
	spr: createjs.Container;
	id = g_GameId++;
	// layers
	feverMask: createjs.Shape; /** 当fever的时候，显示的一张mask */
	ballRenderLayer: BallRenderer;
	feverBar: FeverBar;
	paintLayer: createjs.Shape;
	lineLayer: LineRenderer;
	blackMask: createjs.Shape;
	animationLayer: createjs.Container;
	animationLayer2: createjs.Container;// 2在前面一点
	animationLayer3: createjs.Container;//在black mask 前面的动画layer
	comboContainer: createjs.Container;
	gameTaskBg: createjs.Bitmap;
	gameTaskText: createjs.Text;
	//gameTaskTextOutline: createjs.Text;
	gamePausePanel: GamePausePanel;
	balls: Ball[] = [];
	tick: number = 0;

	minLinkCount = 3;

	//由技能设置，下一次连接可以忽略颜色
	nextLinkIgnoreColor = false;
	nextLinkIgnoreColor_MaxCount = 16;

	//将下一次点击事件发送给技能
	skillWantNextClick = false;
	//技能设置，连线周围的球会一起爆炸(是不是球炸的时候，类似于炸弹，会把周围的球一起炸了)
	wantBombAsBomb = false;


	// timing
	private _physicsTime = 0;
	private _logicTime = 0;
	private _timeScale = 1;

	private _coinScale = 1;//获得金币的倍率。为了技能

	get physicsTime() { return this._physicsTime; }
	get logicTime() { return this._logicTime; }

	// private variable
	private _animation: GameAnimation;
	private _loadComplete = false;
	private _ImageLoader: GameImageLoader;
	private _loader: ImageLoader;
	private _isGameStart = false;
	private _clearEvents: Function; /**保存一个函数，用来在注销在stage上监听事件 */
	private _lastShakeTime = 0; /**上一次摇一摇的时间. 配合摇一摇的冷却时间使用 */
	private _totalGameTime = 60 * 1000;
	private _gameStartTime = -1; //实际游戏开始时间
	private _wantStartGameTime = -1;
	private _leftGameTime = 0;
	private _isGamePaused = false; //游戏是否暂停中

	private _lastUpdateTime = -1;/**上一次update的Date.now()，用来计算两次update的间隔 */
	private _isGameOver = false;
	private _isTimeOver = false; /**游戏时间到了，但是游戏没有结束 */
	private _nextAutoBombTime = 0; /**下一次，自动爆炸球的时间。timeover之后，gameover之前。*/

	/**
	 * 当时间用完的时候，游戏并不是立刻结束 
	 * 这个值保存着，最后发生的事件的时候。所以当时间超过了 大约_gameOverCheckTime+1000的时候结束。
	 * 所以，当有球发生爆炸的时候，this._gameOverCheckTime = Date.now();
	 * */
	private _gameOverCheckTime = 0;
	// linking variable
	private _isLinking: boolean = false;
	private _linkColor: string;
	private _linkedBalls: Ball[];
	private _lastMousePoint: { x: number, y: number };
	private _wantDropBall = 0;
	//private _linkCountUI: createjs.Container;
	// bomb
	private _bombBalls: Ball[][] = [];

	private _comboCount = 0; /**当前连击次数，默认是0 */
	private _comboTimeoutTime = 0; /**连击次数清0的时间 ms */
	private _comboDisappearTime = 0; /**连击UI消失的时间ms */
	private _bombSoundIndex = 0;

	private _scoreControl: ScoreControl;
	private _coinControl: ScoreControl;

	private _timerUI: BitmapText;

	// skill 
	private _skillButton: SkillButton;
	private _skill: IGameSkill;// = AllSkill.createSkill(0);

	private _BALL_RES: any[];
	private _BOMB_BALL_RES: any;

	// web worker
	private _worker: Worker;
	private _workerReady = false;
	private _physicsPaused = false;

	// fever
	private _isInFever = false;
	private _feverBonusScore = 0;
	private get _fever() { return this.feverBar.value; }
	private set _fever(val) { this.feverBar.value = val; }

	private _gameStartInfo: IGameStartInfo;
	//分数统计，用来最后提交给服务器的
	private _score = 0;
	private _coin = 0;
	private _petKillCount: number[];//消除的ball的数量
	private _bombCount = 0;//炸炸弹次数
	private _feverCount = 0;//进入fever次数
	private _skillCount = 0;
	private _maxCombo = 0;
	private _maxLink = 0;
	private _expBomb = 0;
	private _timeBomb = 0;
	private _coinBomb = 0;
	private _scoreBomb = 0;

	//教程
	private _tutorial: GameTutorial;

	private _weeklyTask: any;

	/**当前提示用来连接的球 */
	private _hintBalls: Ball[] = [];
	/**用来记录最后的操作时间（球爆炸等），超过一定时间，则会显示出提示 */
	private _lastActionTime: number = 0;

	//发送给服务器游戏结束后的数据。
	//如果游戏结束后，和服务器断开了，则自动连接后重新发送这个数据
	private _gameResultObject: any;

	//在对战模式下，定时发送自己的分数。这个就是用来定时的变量啦
	private _lastSendUpdateTime = 0;
	private _matchUI: MatchUI;
	private _matchWaitText: createjs.Text;//用来显示类似“正在等待其他玩家结束游戏”的文字

	get mainPetId() { return this._gameStartInfo.pets[0]; }

	/**BALL_RES就是普通球的资源，不包括炸弹 */
	get BALL_RES() { return this._BALL_RES; }
	get isMatch() { return this._gameStartInfo.isMatch; }
	/*
		Game 启动流程：
			1. 开始载入图片，同时启动Web Worker
			2. 上面两个都完成之后(_workerReady,_loadComplete)，调用startGame() (在_checkStart()中)
			3. 让Web Worker执行initPhysics
			4. 等到initPhysics完成后(收到initPhysicsReady)，调用startGame2()才正式开始游戏
	*/
	/**
	 * 构造流程： constructor() ， addChild() , init() 。。。载入资源  startGame()
	 * 
	 */
	constructor()
	{
		this.spr = new createjs.Container();
		this.spr.setBounds(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);//为了让能够接受所有鼠标消息
		this.spr.name = "Game Sprite";
		this._animation = new GameAnimation(this);
		window["game"] = this;
	}

	init(info: IGameStartInfo)
	{
		SoundManager.playBg(null);
		if (!info.isMatch)
		{
			this._weeklyTask = GameLink.instance.getCurrentWeeklyTask();
		}
		else
		{
			//todo.....
		}

		this._gameStartInfo = info;

		this._skill = AllSkill.createSkill(PetRules.PET_SKILL[info.pets[0]]);
		if (info.tutorial)
		{
			this._tutorial = new GameTutorial(this);
		}
		if (g_CachedWorker)
		{
			this._worker = g_CachedWorker;
			this._workerReady = true;
		}
		else 
		{
			this._worker = GameWroker.createWorker()//new Worker('script/worker.js');
		}
		let func = obj => this._onWorkerMessage(obj);
		this._worker.addEventListener('message', func);
		this._worker['token'] = func;
		GameStage.instance.setCssBackground('images/background.jpg');

		let spr = this.spr;
		{

			let mousedown = e => this.onMouseDown(e);
			let mouseup = e => this.onMouseUp(e);
			let mousemove = e => this.onMouseMove(e);
			let stage = this.spr.stage;
			stage.addEventListener('stagemousedown', mousedown);
			stage.addEventListener('stagemouseup', mouseup);
			stage.addEventListener('stagemousemove', mousemove);
			this._clearEvents = function ()
			{
				stage.removeEventListener('stagemousedown', mousedown);
				stage.removeEventListener('stagemouseup', mouseup);
				stage.removeEventListener('stagemousemove', mousemove);
			}
		}


		{





			//let game_task_bg_image = this.getImage('game_task_bg');
			let game_task_bg = new createjs.Bitmap(null);
			//game_task_bg.x = (GC.SCREEN_WIDTH - game_task_bg_image.width) / 2;
			spr.addChild(game_task_bg);
			this.gameTaskBg = game_task_bg;

			if (this.isMatch)
			{
				let link = GameLink.instance;
				this._matchUI = new MatchUI(this._gameStartInfo.matchType);
				this.spr.addChild(this._matchUI.spr);
				this._matchUI.setFaceUrl(0, link.faceurl);
				if (link.matchPlayers[0] && link.matchPlayers[0].faceurl)
				{
					this._matchUI.setFaceUrl(1, link.matchPlayers[0].faceurl);
				}
			}
		}

		{
			this.feverMask = new createjs.Shape();
			{
				let g = this.feverMask.graphics;
				g.beginFill('rgba(0,0,0,0.6)');
				g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
				g.endFill();
			}
			this.feverMask.visible = false;
			spr.addChild(this.feverMask);

			this._scoreControl = new ScoreControl(`${32 * res.GLOBAL_SCALE}px SimHei`);
			this._scoreControl.spr.x = 380 * res.GLOBAL_SCALE;
			this._scoreControl.spr.y = 86 * res.GLOBAL_SCALE;
			spr.addChild(this._scoreControl.spr);


			this._coinControl = new ScoreControl(`${24 * res.GLOBAL_SCALE}px SimHei`);
			this._coinControl.spr.x = 378 * res.GLOBAL_SCALE;
			this._coinControl.spr.y = 143 * res.GLOBAL_SCALE;
			spr.addChild(this._coinControl.spr);

			this._timerUI = new BitmapText();
			this._timerUI.align = 'center';
			this._timerUI.x = 97 * res.GLOBAL_SCALE;
			this._timerUI.y = 105 * res.GLOBAL_SCALE;
			spr.addChild(this._timerUI);


			spr.addChild(this._animation.feverEffectLayer);


			this._skillButton = new SkillButton();
			this._skillButton.spr.x = res.POSITIONS.SKILL_BUTTON.x;
			this._skillButton.spr.y = res.POSITIONS.SKILL_BUTTON.y;
			spr.addChild(this._skillButton.spr);

			{
				//这个其实是没用的，参考下面的setMaxEnergy()
				this._skillButton.setMaxEnergy(12)
			}

			this.ballRenderLayer = new BallRenderer(this);
			spr.addChild(this.ballRenderLayer);


			/*
						let feverText = new createjs.Bitmap(null);
						feverText.name = 'feverText';
						feverText.set({
							x: 320,
							y: 1007
						});
						spr.addChild(feverText);
			*/
			this.feverBar = new FeverBar();
			spr.addChild(this.feverBar);

			this.lineLayer = new LineRenderer();
			//spr.addChild(this.lineLayer);
			this.ballRenderLayer.lineRenderer = this.lineLayer;

			this.paintLayer = new createjs.Shape();
			spr.addChild(this.paintLayer);
			spr.addChild(this._animation.feverScoreLayer);
		}




		this.animationLayer = new createjs.Container();
		this.animationLayer.mouseChildren = false;
		spr.addChild(this.animationLayer);

		this.animationLayer2 = new createjs.Container();
		this.animationLayer2.mouseChildren = false;
		spr.addChild(this.animationLayer2);

		this.comboContainer = new createjs.Container();
		spr.addChild(this.comboContainer);

		this.blackMask = new createjs.Shape();
		{
			let g = this.blackMask.graphics;
			g.beginFill('rgba(0,0,0,0.6)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
		}
		//spr.addChild(this.blackMask);
		//this.blackMask.visible = false;
		this.ballRenderLayer.maskRenderer = this.blackMask;

		this.animationLayer3 = new createjs.Container();
		spr.addChild(this.animationLayer3);

		this._matchWaitText = new createjs.Text('XXXXXXXXXXX', '30px SimHei', 'white');
		this._matchWaitText.set({
			textAlign: 'center',
			x: 320, y: 300,
			visible: false
		});
		spr.addChild(this._matchWaitText);

		if (this._skill)
		{
			spr.addChild(this._skill.spr);
			if (this._skill.bgSpr)
			{
				//var idx = spr.getChildIndex(this.ballRenderLayer);
				spr.addChildAt(this._skill.bgSpr, 0);
			}
			this._skill.init(this);
			this._skillButton.setMaxEnergy(this._skill.getMaxEnergy());
		}

		if (this._tutorial)
		{
			spr.addChild(this._tutorial.spr);
		}


		let ballRes = [];
		let gameRes = GAME_COMM_RES.slice();
		if (this._skill)
		{
			gameRes = gameRes.concat(this._skill.getSkillResource());
		}

		if (this._tutorial)
		{
			gameRes = gameRes.concat(this._tutorial.getResource());
		}

		//准备一下 ball资源图片
		for (let i = 0; i < BALL_RES_BOMB_COUNT; ++i)
		{
			ballRes.push(BALL_RES[i]);
		}
		let pets = this._gameStartInfo.pets;
		for (let i = 0; i < pets.length; ++i)
		{
			ballRes.push(BALL_RES[BALL_RES_BOMB_COUNT + pets[i]]);
		}

		this._petKillCount = [];
		for (let i = 0; i < pets.length; ++i)
		{
			this._petKillCount[i] = 0;
		}

		this._ImageLoader = new GameImageLoader(gameRes, ballRes);
		this._loader = this._ImageLoader._loader;
		this.spr.addChild(this._ImageLoader.spr);
		this._ImageLoader.onComplete = () => { this._loadComplete = true; this._checkStart(); }

		this._totalGameTime = this._gameStartInfo.totalTime * 1000;
		this._leftGameTime = this._gameStartInfo.totalTime * 1000;

		this._BALL_RES = ballRes.slice(BALL_RES_BOMB_COUNT);
		// this._BALL_RES.length = 2;
		this._BOMB_BALL_RES = ballRes.slice(0, BALL_RES_BOMB_COUNT);
	}
	/**是否携带的某个游戏道具 */
	private _hasGameItem(type: string)
	{
		return this._gameStartInfo.items.indexOf(type) >= 0;
	}

	private _checkStart()
	{
		if (this._workerReady && this._loadComplete)
		{
			if (this.isMatch)
			{
				console.log('初始化完成，正在等待其他玩家进入');
				this.showMatchWaitText('正在等待其他玩家进入');
				GameLink.instance.sendMatchReady();
			}
			else
			{
				this.startGame();
			}

		}
	}
	matchGameStart()
	{
		this.startGame();
	}
	/**
	 * 释放潜在的任何资源
	 */
	clear()
	{
		if (this._clearEvents)
		{
			this._clearEvents();
			this._clearEvents = null;
		}
		if (this._worker)
		{
			this._worker.removeEventListener('message', this._worker['token'])
			this._worker.postMessage({ cmd: 'stop', id: this.id });
			//this._worker.onmessage = null;
			this._worker['token'] = null;
			this._worker = null;
			//this._worker.terminate();
		}
		if (this._animation)
		{
			this._animation.clear();
		}
	}

	/**
	 * 游戏真正开始的部分，资源完全载入后调用
	 */
	startGame()
	{
		if (!g_CachedWorker)
		{
			g_CachedWorker = this._worker;
		}
		this.hideMatchWaitText();
		_INIT_IMAGES();
		this._animation.init();
		this._timerUI.addChars(BitmapText.buildCharDefines('0123456789', this.getImage('clock_chars'), 31, 41));
		this._worker.postMessage({ cmd: 'start', id: this.id });
		{
			let icon = HallUI.instance.getPetImage(this.mainPetId);//this.getImage(this._BALL_RES[0].id);
			let bg1 = this.getImage('images/Game/skillbg2.png');
			let bg2 = this.getImage('images/Game/skillbg1.png');
			let bg3 = this.getImage('images/Game/skillbg3.png');
			this._skillButton.init(
				util.scaleImage(icon, res.GLOBAL_SCALE),
				util.scaleImage(bg1, res.GLOBAL_SCALE),
				util.scaleImage(bg2, res.GLOBAL_SCALE),
				util.scaleImage(bg3, res.GLOBAL_SCALE));
			this._skillButton.onClick = () => this._onClickEnergy();
		}
		this.gameTaskBg.image = this.getImage('game_task_bg');
		this.gameTaskBg.x = (GC.SCREEN_WIDTH - this.gameTaskBg.image.width) / 2;
		this.gameTaskBg.y = 190;
		this.gameTaskBg.visible = false;
		{
			this.gameTaskText = new createjs.Text('', '28px SimHei', 'white');
			this.gameTaskText.textAlign = 'center';
			this.gameTaskText.x = GC.SCREEN_WIDTH / 2;
			this.gameTaskText.y = this.gameTaskBg.y + 15;
			this.spr.addChildAt(this.gameTaskText, this.spr.getChildIndex(this.gameTaskBg) + 1);

			//this.gameTaskTextOutline = this.gameTaskText.clone();
			//this.gameTaskTextOutline.outline = 4;
			//this.gameTaskTextOutline.color = '#fc3787';
			//this.spr.addChildAt(this.gameTaskTextOutline, this.spr.getChildIndex(this.gameTaskText) + 0);
		}


		var index = this.spr.getChildIndex(this._skillButton.spr);
		let shakeButton = this.spr.addChildAt(new ImageButton(this.getImage('shake_button_bg')), index);
		shakeButton.onClick = () => this._shake();
		shakeButton.x = GC.SCREEN_WIDTH * 0.84;
		shakeButton.y = 1010;

		let pauseButton = this.spr.addChildAt(new ImageButton(this.getImage('pause_button_bg')), index);
		pauseButton.x = 563;
		pauseButton.y = 119;

		pauseButton.onClick = () => this._pauseGame();

		this._createBalls();
		this.postMessage({ cmd: 'initPhysics', id: this.id });
		this.ballRenderLayer.visible = false;
		//这时候，等待initPhysicsReady消息，之后执行startGame2
		//var fever_text = this.spr.getChildByName('feverText') as createjs.Bitmap;
		//fever_text.image = this.getImage('fever_text');
		//fever_text.regX = fever_text.image.width / 2;
	}

	setTaskText(text)
	{
		if (this.gameTaskText)
		{
			this.gameTaskText.text = text;
			if (text === '')
			{
				this.gameTaskBg.visible = false;
			}
			else
			{
				this.gameTaskBg.visible = true;
			}
		}
	}

	startGame2()
	{
		this.spr.removeChild(this._ImageLoader.spr);
		//this._isGameStart = true;
		//this._gameStartTime = Date.now();

		this._lastUpdateTime = Date.now();
		if (!this._gameStartInfo.tutorial)
		{
			this._wantStartGameTime = Date.now() + 3000;
			SoundManager.playEffect('readygo');
			this._showReadyGoAnimation();
			//this._skillButton.addEnergy(9999);
		}
		else
		{
			this._wantStartGameTime = Date.now();
			this._skillButton.addEnergy(9999);
		}
	}

	private _showReadyGoAnimation()
	{
		let imageReady = this.getImage('ready');
		let imageGo = this.getImage('go');
		let x = GC.SCREEN_WIDTH / 2;
		let y = 200;
		let bitmapReady = new createjs.Bitmap(imageReady);
		bitmapReady.set({
			regX: imageReady.width / 2,
			regY: imageReady.height / 2,
			x, y: y - 40, alpha: 0
		});
		let bitmapGo = new createjs.Bitmap(imageGo);
		bitmapGo.set({
			regX: imageGo.width / 2,
			regY: imageGo.height / 2,
			x, y, alpha: 0,
			scaleX: 0,
			scaleY: 0
		});
		this.animationLayer2.addChild(bitmapReady, bitmapGo);
		let t1 = createjs.Tween.get(bitmapReady).to({ y: y, alpha: 1 }, 300).wait(650).call(GameUtil.removeSelfCallback, [bitmapReady]);
		let t2 = createjs.Tween.get(bitmapGo).wait(t1.duration).to({ scaleX: 1, scaleY: 1, alpha: 1 }, 300).wait(1400).call(GameUtil.removeSelfCallback, [bitmapGo]);
	}

	private _updateBalls()
	{
		let balls = this.balls;
		let removeBalls = []; /**用来保存，想要在这一帧中删除的ball */

		// 删除在屏幕外面的球
		for (let i = 0; i < balls.length; ++i)
		{
			balls[i].update();
			if (balls[i].status == 'normal' && balls[i].isOutOfSpace())
			{
				removeBalls.push(balls[i]);
			}
		}
		let now = Date.now();
		//处理想要爆炸的球
		//this._bombBalls保存着想要延迟爆炸的ball
		//  Q: 为什么要这么做？
		//  A: 球爆炸之后只是标记成不显示（物理上仍旧占着位置），只有当一组都爆炸完成后才从逻辑上删除。
		for (let i = 0; i < this._bombBalls.length;)
		{
			let allbombed = true;  /**这一组球是不是全部爆炸了 */
			let balls = this._bombBalls[i];
			for (let j = 0; j < balls.length; ++j)
			{
				let ball = balls[j];
				if (ball.status == 'delay_bomb')
				{
					if (ball.bombTick <= this.tick)
					{
						//在bombIt中，其实并不删除球。只是标记成bombed状态。
						this._bombIt(ball);
						this._gameOverCheckTime = now;
					}
					else
					{
						allbombed = false;
					}
				}
			}

			if (allbombed)
			{
				this._bombBalls.splice(i, 1);
				for (let j = 0; j < balls.length; ++j)
				{
					removeBalls.push(balls[j]);
				}
			}
			else
			{
				++i;
			}
		}

		//真正删除想要删除的ball
		if (removeBalls.length > 0)
		{
			this._gameOverCheckTime = now;
			this._removeBalls(removeBalls);
			for (let ball of removeBalls)
			{
				if (ball.wantBecomeBomb >= 0)
				{
					this._createBomb(ball.position.x, ball.position.y, ball.wantBecomeBomb);
					--this._wantDropBall;
				}
			}
		}
	}

	private _isPreviousNearTimeOver = false;
	private _nearTimeOverSound: createjs.AbstractSoundInstance;
	private _deltaTime = 0;
	getDeltaTime()
	{
		return this._deltaTime;
	}
	/**
	 * tick
	 */
	update()
	{

		if (!this._isGameStart && (this._wantStartGameTime !== -1) && Date.now() >= this._wantStartGameTime)
		{
			this._isGameStart = true;
			this._gameStartTime = Date.now();
			this._lastUpdateTime = Date.now();
			if (this._tutorial)
			{
				this._tutorial.start();
			}
			this.clearHint();
			SoundManager.playBg('bgGame');
		}

		let deltaTime = Date.now() - this._lastUpdateTime;
		this._deltaTime = deltaTime;
		this._lastUpdateTime = Date.now();

		let t0, t1;
		if (this._isGameStart)
		{

			let isTimePaused = false;
			let isPhysicsPaused = false;

			if (this._isGamePaused || this._needMoreTimeStatus === 'showing')
			{
				isTimePaused = true;
				isPhysicsPaused = true;
			}

			if (this._skill)
			{
				this._skill.update();
				isTimePaused = isTimePaused || this._skill.isPreventPhysics();
				isPhysicsPaused = isPhysicsPaused || this._skill.isPreventPhysics();
			}

			if (this._tutorial)
			{
				this._tutorial.update();
				isPhysicsPaused = isPhysicsPaused || this._tutorial.isPreventPhysics();
				isTimePaused = isTimePaused || this._tutorial.isTimePaused();
			}

			if (isPhysicsPaused != this._physicsPaused)
			{
				this._physicsPaused = isPhysicsPaused;
				if (this._physicsPaused)
				{
					this.postMessage({ cmd: 'pause', id: this.id });
				}
				else
				{
					this.postMessage({ cmd: 'resume', id: this.id });
				}
			}


			//处理一下时间暂停的问题

			if (isTimePaused)
			{
				this._totalGameTime += deltaTime;
				if (this._comboDisappearTime != 0)
				{
					this._comboDisappearTime += deltaTime;
				}
				this._comboTimeoutTime += deltaTime;
			}

			if (!isTimePaused && this._timeScale !== 1)
			{
				let dt = (1 - this._timeScale) * deltaTime;
				this._totalGameTime += dt;
				if (this._comboDisappearTime != 0)
				{
					this._comboDisappearTime += dt;
				}
				this._comboTimeoutTime += dt;
			}
			if (!isTimePaused)
			{
				this._leftGameTime -= deltaTime * this._timeScale;
			}
			//球的处理，延迟爆炸等都在这里
			this._updateBalls();
			this._checkHint();
			//如果时间没有暂停，则处理一下fever

			if (!isTimePaused)
			{
				//减fever条
				if (this._fever > 0)
				{
					this._fever -= (this._isInFever ? FEVER_DECREASE_WHEN_FEVER_PER_SECOND : FEVER_DECREASE_PER_SECOND) * GC.TICK_TIME * this._timeScale;
				}
				//判断是否要结束fever
				if (this._isInFever && this._fever <= 0)
				{
					this._endFever();
				}
			}

			//更新一下时钟UI
			{
				let tm = this.getLeftGameTime();
				tm = (((tm + 1) / 1000)) | 0;
				if (tm < 0) tm = 0;
				//
				//let mmm = ['05','04','03','02','01'];
				if (this._timerUI.text != tm.toString())
				{
					if (tm >= 1 && tm <= 5)
					{
						this._animation.blinkTimeWarning();
					}
				}
				this._timerUI.text = tm.toString();
			}
			//处理一下是否要播放游戏快要结束的声音
			{
				let isNearTimeOver = this.getLeftGameTime() <= 5000;
				if (isNearTimeOver != this._isPreviousNearTimeOver)
				{
					this._isPreviousNearTimeOver = isNearTimeOver;
					if (isNearTimeOver)
					{
						if (!this._nearTimeOverSound)
						{
							this._nearTimeOverSound = SoundManager.playEffect('nearTimeover');
						}
					}
					else
					{
						if (this._nearTimeOverSound)
						{
							this._nearTimeOverSound.stop();
							this._nearTimeOverSound = null;
						}
					}
				}
			}

			//调用一下其他模块的update
			this._scoreControl.update();
			this._coinControl.update();
			this._updateLineRender();

			//画一下线段
			t0 = Date.now();
			this._draw();
			t1 = Date.now();

			if (this._wantDropBall > 0)
			{
				--this._wantDropBall;
				this._tryDropOne();
			}

			if (this._comboDisappearTime !== 0 && this._comboDisappearTime < Date.now())
			{
				this._comboDisappearTime = 0;
				this.comboContainer.removeAllChildren();
			}

			//处理一下 GameOver 的情况
			//这里是time over，游戏时间到了
			if (!this._isTimeOver && this.getLeftGameTime() <= 0)
			{
				if (this._isLinking)
				{
					this.applyMouseUp(true);
					return;
				}

				let needMoreTimeStatus = this._needMoreTimeStatus;
				if (needMoreTimeStatus === 'no')
				{
					if (this._isNeedToShowNeedMoreTimeDialog())
					{
						this._showNeedMoreTimeDialog(() =>
						{
							GameLink.instance.sendUseDiamond(5, '+10s');
							this.addGameTime(10 - this.getLeftGameTime() / 1000);
						}, () =>
							{
								//这里应该什么都不需要做。needMoreTimeStatus会变成'showned'然后自动结束游戏了

							})
					}
					else
					{
						this._needMoreTimeStatus = 'showned';//如果不需要显示，则直接标记成“已经显示过了”，让下面的逻辑能结束游戏
					}
				}

				if (needMoreTimeStatus === 'showned')
				{
					if (this._nearTimeOverSound)
					{
						this._nearTimeOverSound.stop();
						this._nearTimeOverSound = null;
					}
					this._isTimeOver = true;
					this._animation.showTimeOver();
					SoundManager.playEffect('timeover');
					var hasBomb = this.balls.some(ball => ball.isBomb && ball.status === 'normal');
					if (hasBomb) this._animation.showBonusTime();

					this._nextAutoBombTime = Date.now() + (AUTO_BOMB_FIRST_DELAY + 2) * 1000;
					this._gameOverCheckTime = this._nextAutoBombTime + 100;
				}
			}

			//自动爆炸
			if (this._isTimeOver && this._nextAutoBombTime != 0)
			{
				this.clearHint();
				if (Date.now() >= this._nextAutoBombTime)
				{
					let bomb: Ball = null;
					for (let ball of this.balls)
					{
						if (ball.isBomb && ball.status === 'normal')
						{
							bomb = ball;
							break;
						}
					}
					if (bomb)
					{
						this._bombTheBomb(bomb, true);
						this._gameOverCheckTime = Date.now();
					}

					if (bomb)
					{
						this._nextAutoBombTime = Date.now() + AUTO_BOMB_DELAY * 1000;
					}
					else
					{
						this._nextAutoBombTime = 0;
					}
				}
			}



			let canTriggerGameOver = this._isTimeOver && !this._isGameOver && Date.now() >= this._gameOverCheckTime + 2100 && this._bombBalls.length == 0;
			canTriggerGameOver = canTriggerGameOver && !(this._skill && this._skill.isPreventGameOver());
			if (canTriggerGameOver)
			{
				this._onGameOver();
				this._isGameOver = true;
			}

			this.blackMask.visible = !this.isEnableUserInteract();

			++this.tick;
			this._updateTaskText();

			if (this.isMatch)
			{
				if (Date.now() - this._lastSendUpdateTime > 2000)
				{
					this._lastSendUpdateTime = Date.now();
					GameLink.instance.sendMatchScore(this._score, this._leftGameTime);
				}
				if (this._matchUI)
				{
					this._matchUI.setScore(0, this._score);
				}
			}
		}
	}

	getLeftGameTime()
	{
		return this._leftGameTime;
	}

	onMouseDown(e: createjs.MouseEvent)
	{
		if (!util.isPrimatyButton(e)) return;
		if (!this.isEnableUserInteract()) return;
		if (this.skillWantNextClick)
		{
			this.skillWantNextClick = false;
			this._skill.triggerClick({ x: e.stageX, y: e.stageY });
			return;
		}

		if (this._isLinking) return;
		let pt = { x: e.stageX, y: e.stageY };
		let balls = this.queryBallPoint(pt).filter(x => x.status == 'normal');
		if (this._tutorial)
		{
			balls = balls.filter(x => this._tutorial.canTouchBall(x));
		}
		if (balls.length >= 1)
		{
			//start link
			this._lastMousePoint = pt;
			let ball = balls[0];
			this._isLinking = true;
			this._linkColor = ball.color;
			this._linkedBalls = [ball];
			SoundManager.playEffect('linkBall');
			ball.linkCount = 0;
			ball.status = 'linking';
			this._animation.flyLinkCountTip(ball.position.x, ball.position.y, 1);
		}
	}



	onMouseUp(e: createjs.MouseEvent)
	{
		if (!util.isPrimatyButton(e)) return;
		if (this._tutorial)
		{
			if (!this._isLinking)
			{
				this._tutorial.triggerClick({ x: e.stageX, y: e.stageY });
			}
		}
		this.applyMouseUp();
	}

	onMouseMove(e: createjs.MouseEvent, noCheckMoveDistance?: boolean)
	{
		if (!this._isLinking) return;
		let pt = { x: e.stageX, y: e.stageY };
		//如果移动的距离太远，自动补充中间的移动点
		if (!noCheckMoveDistance)
		{
			let dx = pt.x - this._lastMousePoint.x;
			let dy = pt.y - this._lastMousePoint.y;
			let sqrDist = util.sqrDistance(pt, this._lastMousePoint);
			let maxdist = Ball.MAX_RADIUS;
			if (sqrDist >= maxdist * maxdist)
			{
				let dist = Math.sqrt(sqrDist);
				dx /= dist;
				dy /= dist;
				let step = Ball.MAX_RADIUS * 0.2;
				let p = step;
				while (p < dist)
				{
					let ee = e.clone();
					ee.stageX = pt.x + dx * p;
					ee.stageY = pt.y + dy * p;
					this.onMouseMove(ee, true);
					p += step;
				}
			}
		}

		this._lastMousePoint = pt;
		let lastBall = this._linkedBalls[this._linkedBalls.length - 1];
		if (lastBall.isBomb) return;
		let lastPt = lastBall.position;
		let balls: Ball[];
		if (this.nextLinkIgnoreColor)
		{
			balls = this.queryBallCircle(pt, Ball.MAX_RADIUS * 0.3).filter(x => x.status == 'normal' && this._linkedBalls.indexOf(x) < 0);
		}
		else
		{
			balls = this.queryBallCircle(pt, Ball.MAX_RADIUS * 0.3).filter(x => x.status == 'normal' && x.color == this._linkColor && this._linkedBalls.indexOf(x) < 0);
		}
		if (this._tutorial)
		{
			balls = balls.filter(x => this._tutorial.canLinkBall(x));
		}
		let isLinked = false;
		if (balls.length > 0 && !(this.nextLinkIgnoreColor && this._linkedBalls.length >= this.nextLinkIgnoreColor_MaxCount))
		{
			let minDistBall = balls[0];
			let dist = util.sqrDistance(minDistBall.position, pt);
			for (let i = 1; i < balls.length; ++i)
			{
				let d2 = util.sqrDistance(balls[i].position, pt);
				if (d2 < dist)
				{
					minDistBall = balls[i];
					dist = d2;
				}
			}
			if (minDistBall)
			{
				let theBall = minDistBall;
				if (this._canLink(lastBall, theBall))
				{
					theBall.linkCount = this._linkedBalls.length;
					theBall.status = 'linking';
					this._linkedBalls.push(theBall);
					SoundManager.playEffect('linkBall');
					isLinked = true;
				}
				else
				{
					//自动隔一个球，可以连接也帮他自动连接起来吧
					if (!this.nextLinkIgnoreColor ||
						(this.nextLinkIgnoreColor && this._linkedBalls.length + 2 <= this.nextLinkIgnoreColor_MaxCount))
					{
						let midBall = this._searchMiddleLinkBall(lastBall, theBall);
						if (midBall)
						{
							theBall.linkCount = this._linkedBalls.length;
							theBall.status = 'linking';
							midBall.linkCount = this._linkedBalls.length;
							midBall.status = 'linking';
							this._linkedBalls.push(midBall);
							this._linkedBalls.push(theBall);
							SoundManager.playEffect('linkBall');
							isLinked = true;
						}
					}
				}
				if (isLinked)
				{

					this._animation.flyLinkCountTip(theBall.position.x, theBall.position.y, this._linkedBalls.length);
					this._updateLineRender();
					this.makeDirty();
				}
			}
		}
		//接下来处理回退功能
		if (!isLinked)
		{
			balls = this.queryBallPoint(pt).filter(ball => this._linkedBalls.indexOf(ball) >= 0);
			if (balls.length == 1)
			{
				let i = this._linkedBalls.indexOf(balls[0]);
				let linkedBallCount = this._linkedBalls.length;
				if (i >= 0 && i >= linkedBallCount - 3 && i < linkedBallCount - 1)
				{
					for (let j = i + 1; j < this._linkedBalls.length; ++j)
					{
						let ball = this._linkedBalls[j];
						ball.status = 'normal';
						ball.linkCount = -1;
					}
					this._linkedBalls.length = i + 1;
					let theBall = this._linkedBalls[i];
					this._animation.flyLinkCountTip(theBall.position.x, theBall.position.y, this._linkedBalls.length);
					this._updateLineRender();
					this.makeDirty();
				}
			}
		}
	}
	//请调用这个来计算分数，而不是GameRules.getScore(...)
	private _calcScore(comboCount: number, balls: Ball[], type: string)
	{
		let X = GameRules.getLinkCountX(balls.length);
		let Y = GameRules.getComboY(comboCount);
		let Z = 0;
		let link = GameLink.instance;
		for (let ball of balls)
		{
			if (!ball.isBomb)
			{
				let i = parseInt(ball.color);
				Z += link.getPetScore(i);
			}
		}
		let score = (Z + X) * Y;
		return score | 0;
	}

	/** 手指放开时的操作，消除连接的球. 在onMouseUp时调用，或者当你想手动让手指放开的时候调用 */
	applyMouseUp(justCancelIt?)
	{
		if (this._isLinking)
		{
			let isTutorialAllowBomb = true;
			if (this._tutorial)
			{
				isTutorialAllowBomb = this._tutorial.canBombBalls(this._linkedBalls);
			}
			if (this._linkedBalls.length == 1 && this._linkedBalls[0].isBomb && isTutorialAllowBomb && !justCancelIt)
			{
				this._bombTheBomb(this._linkedBalls[0]);
				if (this._tutorial) this._tutorial.triggerBomb();
			}
			else if (this._linkedBalls.length >= this.minLinkCount && isTutorialAllowBomb && !justCancelIt)
			{
				//普通消除
				let linkCount = this._linkedBalls.length;
				this._startBomb(this._linkedBalls);
				this._addCombo();
				let score = this._calcScore(this._comboCount, this._linkedBalls, 'link');
				//if (this._isInFever) score *= FEVER_SCORE_MULTIPY;
				let lastBall = this._linkedBalls[linkCount - 1];
				this._animation.showBombNumAnimation(lastBall.position.x, lastBall.position.y, linkCount, 0);
				let delay = this._animation.showScoreAnimation(score, linkCount, lastBall.position.x, lastBall.position.y, this._isInFever);
				this._addScore(score, delay * 0.9);
				let coin = GameRules.getCoin(linkCount);
				this._addCoin(coin, 0);

				const LINK_COUNT_THAT_CAN_GET_BOMB = this._hasGameItem(GameItemDefine.GAME_ITEM_DEC_BOMB_REQ) ? 6 : 7;
				if (this.wantBombAsBomb)
				{
					this._linkedBalls.forEach(x => { x.bombAsBomb = true; });
				}
				if (linkCount >= 7)
				{
					if (linkCount >= 10)
					{
						lastBall.wantBecomeBomb = Math.floor(Math.random() * 5);
						if (lastBall.wantBecomeBomb > 4) lastBall.wantBecomeBomb = 4;
					}
					else
					{
						lastBall.wantBecomeBomb = 0;
					}
				}
				if (this._tutorial) this._tutorial.triggerBomb();
				console.log(`连击:${this._comboCount},消除:${linkCount}个,分数:${score},金币:${coin}`);
				if (linkCount > this._maxLink) this._maxLink = linkCount;
			}
			else
			{
				this._linkedBalls.forEach(x =>
				{
					x.linkCount = -1;
					x.status = 'normal';
				});
			}
			this._animation.clearLinkCountTip();
			this._linkedBalls = null;
			this._isLinking = false;
			this._updateLineRender();
			if (this.nextLinkIgnoreColor)
			{
				this.nextLinkIgnoreColor = false;
				this._skill.triggerSkillEnd();
			}
			this.makeDirty();
		}
	}

	/**如果当前用户正在有连接的操作，则取消所有操作 */
	cancelLinkBall()
	{
		if (this._isLinking)
		{
			for (let ball of this._linkedBalls)
			{
				ball.status = 'normal';
				ball.linkCount = -1;
			}
			this._linkedBalls.length = 0;
			this._updateLineRender();
			this.makeDirty();
		}
	}

	isEnableUserInteract()
	{
		return this._isGameStart && !this._isGameOver && this.getLeftGameTime() >= 0
			&& !(this._skill && this._skill.isPreventUserInteract()) && !this._isGamePaused && this._needMoreTimeStatus !== 'showing';
	}

	private _updateLineRender()
	{
		if (this._isLinking && this._linkedBalls.length >= 2)
		{
			let arr = this._linkedBalls.map(obj => obj.position);
			this.lineLayer.lines = arr;
		}
		else
		{
			this.lineLayer.lines = null;
		}
	}

	/**连击加1，并且返回当前连击（至少是1） */
	private _addCombo()
	{
		if (this._comboCount == 0 || Date.now() > this._comboTimeoutTime)
		{
			this._comboCount = 1;
			this._bombSoundIndex = 0;
		}
		else
		{
			this._comboCount++;
		}
		if (this._comboCount > this._maxCombo) this._maxCombo = this._comboCount;
		this._showComboText(this._comboCount);
		this._comboTimeoutTime = Date.now() + COMBO_TIMEOUT * 1000;
		return this._comboCount;
	}

	/**ball是一个正常的球，由于技能的作用下，它爆炸的时候会像炸弹一样炸掉周围的球 */
	private _bombAsBomb(ball: Ball)
	{
		let arr = [];
		let pos = ball.position;
		let sqrRadius = BOMB_RADIUS * BOMB_RADIUS;
		for (let ball of this.balls)
		{
			if (ball.status === 'normal' && !ball.isBomb)
			{
				let pos2 = ball.position;
				let dx = pos.x - pos2.x;
				let dy = pos.y - pos2.y;
				if (dx * dx + dy * dy <= sqrRadius)
				{
					ball.linkCount = arr.length;
					arr.push(ball);
				}
			}
		}
		if (arr.length > 0)
		{
			this.bombTheBalls(arr);
		}
	}
	bombTheBomb = this._bombTheBomb;
	/** 炸掉一个炸弹球，bomb一定要是一个炸弹 
	 * isBonusTime 有个特殊处理的
	*/
	private _bombTheBomb(bomb: Ball, isBonusTime?: boolean)
	{
		util.assert(bomb.isBomb);
		let arr: Ball[] = [];
		let pos = bomb.position;
		let sqrRadius = BOMB_RADIUS * BOMB_RADIUS;
		if (bomb.color === BOMB_TYPE_BIG)
		{
			let radius = BOMB_RADIUS * 1.5;
			sqrRadius = radius * radius;
		}
		for (let ball of this.balls)
		{
			if (ball.status === 'normal' && !ball.isBomb)
			{
				let pos2 = ball.position;
				let dx = pos.x - pos2.x;
				let dy = pos.y - pos2.y;
				if (dx * dx + dy * dy <= sqrRadius)
				{
					ball.linkCount = arr.length;
					arr.push(ball);
				}
			}
		}
		//console.log('balls', arr);
		let bombType = bomb.color;
		switch (bombType)
		{
			case BOMB_TYPE_COIN:
				this._coinBomb++;
				break;
			case BOMB_TYPE_EXP:
				this._expBomb++;
				break;
			case BOMB_TYPE_SCORE:
				this._scoreBomb++;
				break;
			case BOMB_TYPE_TIME:
				this._timeBomb++;
				break;
		}
		if (arr.length > 0)
		{
			let linkCount = arr.length;
			this._addCombo();
			let score = this._calcScore(this._comboCount, arr, 'bomb');
			let coin = GameRules.getCoin(linkCount);

			if (bombType === BOMB_TYPE_SCORE)
				score *= 2;
			else if (bombType === BOMB_TYPE_COIN)
				coin += 10;

			//if (this._isInFever) score *= FEVER_SCORE_MULTIPY;
			this._animation.showBombNumAnimation(bomb.position.x, bomb.position.y, linkCount, 0);
			let delay = this._animation.showScoreAnimation(score, linkCount, pos.x, pos.y, this._isInFever);
			this._addScore(score, delay * 0.9);
			this._addCoin(coin, 0);
			this._startBomb(arr, 'bomb');
			if (isBonusTime)
			{
				for (let ball of arr)
				{
					ball.bombTick += GC.FPS;
				}
			}

			console.log(`连击:${this._comboCount}, 炸弹炸了${linkCount}个，分数:${score}, 金币:${coin}`);
		}
		if (bombType === BOMB_TYPE_TIME)
		{
			this.addGameTime(2);
		}

		bomb.status = 'delay_bomb';
		bomb.bombTick = this.tick;
		if (isBonusTime)
		{
			bomb.bombTick = this.tick + GC.FPS;
		}
		this._bombBalls.push([bomb]);
		++this._bombCount;
		//console.log('balls2', arr);
	}
	/** 底层的一个炸掉一系列球的函数，最好不要直接调用 
	 *    可以调用bombTheBalls()或_bombTheBom() 等代替
	*/
	private _startBomb(balls: Ball[], mode?: string)
	{
		this.clearHint();
		//这里做的事情最好只放动画，不要做其他计算
		for (let i = 0; i < balls.length; ++i)
		{
			let ball = balls[i];
			ball.status = 'delay_bomb';
			if (mode === 'bomb')//这些球是炸弹炸掉的
			{
				ball.bombTick = this.tick + GC.FPS * 0.2;
				if (i === 0) ball.bombSoundIndex = balls.length - 1;
			}
			else if (mode === 'skill')
			{
				ball.bombTick = this.tick + GC.FPS * 0.4;
				if (i === 0) ball.bombSoundIndex = balls.length - 1;
			}
			else if (mode === 'toBomb') //toBomb表示是为了变成炸弹的爆炸
			{
				ball.bombTick = this.tick + GC.FPS * 0.4;
				if (i === 0) ball.bombSoundIndex = balls.length - 1;
			}
			else
			{
				ball.bombTick = this.tick + ((i * GC.FPS / 10) | 0);
				ball.bombSoundIndex = this._bombSoundIndex++;
			}
		}
		this._bombBalls.push(balls.slice());
	}
	/**转换宠物为主宠物 */
	transformToMainColor(balls: Ball[])
	{
		let main = this.getMainBallDefine();
		for (let i = 0; i < balls.length; ++i)
		{
			let ball = balls[i];
			if (!ball.isBomb && ball.color !== main.color && ball.status === 'normal')
			{
				ball.noEnergy = true;
				ball.changeColor(main);
			}
		}
	}
	/**是不是当前携带的宠物 */
	isMainBall(ball: Ball)
	{
		return ball.color === this.getMainBallDefine().color;
	}

	/** 将这一系列球都爆炸，由技能调用*/
	bombTheBalls(balls: Ball[])
	{
		if (balls && balls.length > 0)
		{
			if (balls.length >= 7)
			{
				if (balls.length >= 10)
				{
					balls[0].wantBecomeBomb = (Math.random() * 5) | 0;
				}
				else
				{
					balls[0].wantBecomeBomb = 0;
				}
			}
			for (var i = 0; i < balls.length; ++i)
			{
				balls[i].linkCount = i;
			}
			this._addCombo();
			let score = this._calcScore(this._comboCount, balls, 'skill');
			let coin = GameRules.getCoin(balls.length);
			//if (this._isInFever) score *= FEVER_SCORE_MULTIPY;
			let pt = calcAABBCenter(balls);
			this._animation.showBombNumAnimation(pt.x, pt.y, balls.length, 0);
			let delay = this._animation.showScoreAnimation(score, balls.length, GC.SCREEN_WIDTH / 2, GC.SCREEN_HEIGHT / 2, this._isInFever);
			this._addScore(score, delay * 0.9);
			this._addCoin(coin, 0);
			console.log(`技能炸了:${balls.length}个,连击:${this._comboCount} ，分数:${score}, 金币:${coin}`);
			this._startBomb(balls, 'skill')
		}
	}
	/**由技能调用，将球变成炸弹 */
	turnBallToBomb(balls: Ball[], bombType?: number)
	{
		if (typeof bombType === 'undefined') bombType = 0;
		balls = balls.filter(ball => !ball.isBomb && ball.status == 'normal');
		if (balls.length > 0)
		{
			for (let i = 0; i < balls.length; ++i)
			{
				balls[i].wantBecomeBomb = bombType;
			}
		}
		this._addCombo();
		this._startBomb(balls, 'toBomb');
	}

	/**不要直接调用 */
	private _bombIt(ball: Ball)
	{
		this.clearHint();
		let isPlayedEnergyAnimation = false;
		ball.status = 'bombed';
		this._animation.playBombAnimation(ball.position.x, ball.position.y);
		if (ball.bombSoundIndex >= 0)
		{
			SoundManager.playBallBomb(ball.bombSoundIndex);
		}
		//加能量
		if (ball.canHasEnergy() && !this._skillButton.isEnergyFull())
		{
			isPlayedEnergyAnimation = true;
			this._animation.receiveEnergyAnimation(ball);
			this._skillButton.addEnergy(1);
			if (this._skillButton.isEnergyFull())
			{
				this._animation.playEnergyFullAnimation();
			}
		}
		//加金币
		if (!ball.isBomb)
		{
			//let coin = GameRules.getCoin(ball.linkCount);
			if (ball.linkCount >= 3)
			{
				this._animation.receiveCoinAnimation(ball.position.x, ball.position.y);
				//this._addCoin(coin);
			}
		}
		//加fever
		if (!ball.isBomb)
		{
			if (!this._isInFever)
			{
				if (!isPlayedEnergyAnimation)
				{
					this._animation.receiveFeverAnimation(ball);
				}
				this._fever += FEVER_ADD_PER_BALL;
				if (this._fever >= 1)
				{
					this._fever = 1;
					if (!this._isTimeOver)
					{
						this._startFever();
					}

				}
			}
		}

		if (!ball.isBomb)
		{
			let color = parseInt(ball.color) | 0;
			let idx = this._gameStartInfo.pets.indexOf(color);
			util.assert(idx >= 0);
			this._petKillCount[idx]++;
		}

		if (ball.bombAsBomb)
		{
			this._bombAsBomb(ball);
		}
	}

	private _startFever()
	{
		this._isInFever = true;
		this.feverMask.visible = true;
		this._animation.playFeverEffect();
		this.addGameTime(FEVER_ADD_GAME_TIME);
		++this._feverCount;
		SoundManager.playBg('bgFever');
		this._animation.showStartFever();
	}

	private _endFever()
	{
		if (!this._isInFever) return;
		this._isInFever = false;
		this.feverMask.visible = false;
		this._animation.stopFeverEffect();
		if (this._feverBonusScore > 0)
		{
			this._addScore(this._feverBonusScore * FEVER_SCORE_MULTIPY, 0);
			this._feverBonusScore = 0;
			this._animation.collectFeverScore();
		}
		SoundManager.playBg('bgGame');
	}

	addToFullFever()
	{
		if (!this._isInFever)
		{
			this._fever = 1;
			this._startFever();
		}
		else
		{
			this._fever = 1;
		}
	}

	private _createBalls()
	{
		const CREATE_RADIUS = Ball.MAX_RADIUS;
		let left = 11;
		let right = GC.SCREEN_WIDTH - 11;
		let top = -100 + 11;
		let bottom = 600 * GC.GLOBAL_SCALE - 11;

		let x = left + CREATE_RADIUS;
		let y = top + CREATE_RADIUS;
		while (true)
		{
			let ball = new Ball(this, util.randomChoose(this._BALL_RES), x + Math.random() * 2, y + Math.random() * 2);
			this.balls.push(ball);

			x += 2 * CREATE_RADIUS;
			if (x + CREATE_RADIUS >= right)
			{
				x = left + CREATE_RADIUS;
				y += CREATE_RADIUS * 2
				if (y >= bottom) break;
			}
		}
	}

	private _draw()
	{
		let g = this.paintLayer.graphics;
		g.clear();

		//draw links
		if (this._isLinking && 0)
		{
			g.beginStroke('black');
			g.setStrokeStyle(2);
			let pos;

			g.setStrokeStyle(2);
			for (let i = 0; i < this._linkedBalls.length; ++i)
			{
				let ball = this._linkedBalls[i];
				pos = ball.position;
				g.beginStroke('black');
				g.drawCircle(pos.x, pos.y, ball.radius);
				g.endStroke();
				for (let c of ball.getEarShape())
				{
					g.beginStroke('black');
					g.drawCircle(c.x, c.y, c.r);
					g.endStroke();
				}
			}

		}
	}

	private _removeBalls(balls: Ball[] | Ball)
	{
		if (Array.isArray(balls))
		{
			this.balls = this.balls.filter(x => balls.indexOf(x) < 0);
			for (let i = 0; i < balls.length; ++i)
			{
				balls[i].remove();
				balls[i].clear();
				++this._wantDropBall;
			}
		}
		else
		{
			let ball = balls;
			let i = this.balls.indexOf(ball);
			if (i >= 0)
			{
				this.balls.splice(i, 1);
			}
			ball.remove();
			ball.clear();
			this._wantDropBall += 1;
		}
	}
	private _createBomb(x, y, type: number)
	{
		console.log('create Bomb:' + type)
		let ball = new Ball(this, this._BOMB_BALL_RES[type], x, y);
		this.balls.push(ball);
		return ball;
	}

	private _tryDropOne()
	{

		let left = Ball.MAX_RADIUS + 10;
		let right = GC.SCREEN_WIDTH - Ball.MAX_RADIUS - 10;
		let x = left + Math.random() * (right - left);
		let y = -Ball.MAX_RADIUS;

		let aabb = new Box2D.Collision.b2AABB();
		aabb.lowerBound.x = x - Ball.MAX_RADIUS;
		aabb.lowerBound.y = y - Ball.MAX_RADIUS;
		aabb.upperBound.x = x + Ball.MAX_RADIUS;
		aabb.upperBound.y = y + Ball.MAX_RADIUS;
		let ball = new Ball(this, util.randomChoose(this._BALL_RES), x, y);
		this.balls.push(ball);
		return ball;
	}

	private _shake()
	{
		if (!this.isEnableUserInteract()) return;
		if (this._tutorial && this._tutorial.isRunning()) return;
		let power: number;
		let span = (Date.now() - this._lastShakeTime) / 1000;
		if (span >= SHAKE_TIMEOUT)
			power = 1;
		else
		{
			power = (span) / SHAKE_TIMEOUT;
		}
		this._lastShakeTime = Date.now();
		this.postMessage({ cmd: 'shake', power: power, id: this.id });
	}

	queryBallPoint(pt: { x: number, y: number }): Ball[]
	{
		for (let ball of this.balls)
		{
			let pos = ball.position;
			if (util.sqrDistance(pt, pos) <= ball.radius * ball.radius)
			{
				return [ball];
			}
		}
		return [];
	}

	queryBallCircle(pt: { x: number, y: number }, radius: number): Ball[]
	{
		let ret = [];
		for (let ball of this.balls)
		{
			let rr = radius + ball.radius;
			if (util.sqrDistance(pt, ball.position) <= rr * rr)
			{
				ret.push(ball);
			}
		}
		return ret;
	}

	queryBallRay(pt0: { x: number, y: number }, pt1: { x: number, y: number }): Ball[]
	{
		let ret = [];
		for (let ball of this.balls)
		{
			if (GameUtil.circleSegmentIntersect(pt0, pt1, ball.position, ball.radius))
			{
				ret.push(ball);
			}
		}
		return ret;
	}

	/**
	 * 显示连击
	 */
	_showComboText(n)
	{
		if (!COMBO_NUMBER.result) return;
		if (!COMBO_TEXT.result) return;
		this._comboDisappearTime = Date.now() + COMBO_TIMEOUT * 1000;
		this.comboContainer.removeAllChildren();
		let x = GC.SCREEN_WIDTH * 0.8;
		let y = GC.SCREEN_HEIGHT * 0.2;
		let digitImages = COMBO_NUMBER.result;
		let textImage = COMBO_TEXT.result;
		let bitmap = new createjs.Bitmap(textImage);
		bitmap.x = x - textImage.width / 2;
		bitmap.y = y + digitImages[0].height;
		this.comboContainer.addChild(bitmap);

		n = (n | 0).toString();
		let totalWidth = digitImages[0].width * n.length;
		let x0 = x - totalWidth / 2;
		for (let i = 0; i < n.length; ++i)
		{
			let bitmap = new createjs.Bitmap(digitImages[n[i] | 0]);
			bitmap.x = x0;
			bitmap.y = y;// - digitImages[0].height;
			x0 += digitImages[0].width;
			this.comboContainer.addChild(bitmap);
		}
	}

	makeDirty()
	{
		GameStage.instance.makeDirty();
	}

	getImage(id: string)
	{
		return this._loader.getImage(id);
	}
	/**当前技能球的define */
	getMainBallDefine()
	{
		return this._BALL_RES[0];
	}

	private _addCoin(coin: number, delay?: number)
	{
		coin = (coin * this._coinScale) | 0;
		this._coinControl.addValue(coin, delay);
		this._coin += coin;
	}
	private _addScore(score: number, delay?: number)
	{
		if (this._isInFever)
		{
			this._feverBonusScore += score;
			this._animation.showFeverScore(this._feverBonusScore);
		}
		else
		{
			this._scoreControl.addValue(score, delay);
			this._score += score;
		}

	}
	private _onClickEnergy()
	{
		if (!this.isEnableUserInteract()) return;
		if (this._tutorial && this._tutorial.isRunning()) return;
		this.applyMouseUp();
		if (this._skill)
		{
			++this._skillCount;
			this.clearHint();
			this._skill.startSkill();
		}
		else
		{
			alert('PONG! PONG! PONG! 华丽的技能特效!');
		}
		this._skillButton.clearEnergy();
	}
	private _onGameOver()
	{
		this._endFever();
		console.log(`游戏结束
总分:${this._score}
总金币:${this._coin}
消除的球数量：${this._petKillCount}
携带宠物经验：${this._petKillCount[0]}	
`)
		let obj: any = {
			score: this._score,
			coin: this._coin,
			killPetCount: this._petKillCount,
			feverCount: this._feverCount,
			bombCount: this._bombCount,
			skillCount: this._skillCount
		};
		obj.expBomb = this._expBomb;
		obj.timeBomb = this._timeBomb;
		obj.scoreBomb = this._scoreBomb;
		obj.coinBomb = this._coinBomb;
		obj.maxLink = this._maxLink;
		obj.maxCombo = this._maxCombo;
		this._gameResultObject = obj;
		GameLink.instance.sendGameResult(obj);
		if (this.isMatch)
		{
			//console.log('对战结束，正在等待其他玩家完成游戏');
			this.showMatchWaitText('正在等待其他玩家完成游戏');
		}
		console.log(`游戏结束：携带宠物经验`)
	}

	sendGameResultIfGameOver()
	{
		if (this._gameResultObject)
		{
			GameLink.instance.sendGameResult(this._gameResultObject);
		}
	}

	canLink = this._canLink;//make it public
	//两个球可以连接吗
	private _canLink(ball1: Ball, ball2: Ball)
	{
		if (ball1 === ball2) return false;
		if (!this.nextLinkIgnoreColor && ball1.color !== ball2.color) return false;
		if (ball1.isBomb || ball2.isBomb) return false;
		let sqrDist = util.sqrDistance(ball1.position, ball2.position);
		let maxDist = Game.MAX_LINK_DISTANCE * Game.MAX_LINK_DISTANCE;
		if (sqrDist > maxDist) return false;
		let otherBalls = this.queryBallRay(ball1.position, ball2.position);
		for (let x of otherBalls)
		{
			if (x !== ball1 && x !== ball2) return false;
		}
		return true;
	}
	/**搜索一个ballX，保证 ball1->ballX->ball2 可以连接 */
	private _searchMiddleLinkBall(ball1: Ball, ball2: Ball): Ball
	{
		if (ball1 === ball2) return null;
		if (ball1.color !== ball2.color) return null;
		if (ball1.isBomb || ball2.isBomb) return null;

		let candidateBalls = this.balls.filter(ball =>
		{
			return ball.status == 'normal' && !ball.isBomb && ball.color === ball1.color && ball !== ball1 && ball !== ball2;
		});
		if (this._tutorial)
		{
			candidateBalls = candidateBalls.filter(x => this._tutorial.canLinkBall(x));
		}
		for (let ballX of candidateBalls)
		{
			if (this._canLink(ball1, ballX) && this._canLink(ballX, ball2))
			{
				return ballX;
			}
		}
		return null;
	}
	private _onWorkerMessage(e: MessageEvent)
	{
		if (!this._worker) return;
		var obj = e.data;
		//if (obj.cmd !== 'update') alert(JSON.stringify(obj));
		switch (obj.cmd)
		{
			case 'update':
				if (obj.id !== this.id)
				{
					console.log(`game id not matched,myid=${this.id},obj.id=${obj.id},cmd=${obj.cmd}`);
					return;
				}
				return this._onWorkerUpdate(obj);
			case 'ready':
				this._workerReady = true;
				this._checkStart();
				return;
			case 'initPhysicsReady':
				if (obj.id !== this.id)
				{
					console.log(`game id not matched,myid=${this.id},obj.id=${obj.id},cmd=${obj.cmd}`);
					return;
				}
				this.startGame2();
				return;
			case 'error':
				return alert(obj);
			default:
			// alert(obj);
		}
	}
	postMessage(obj)
	{
		if (!('id' in obj)) obj.id = this.id;
		this._worker.postMessage(obj);
	}

	private _onWorkerUpdate(obj)
	{
		this.ballRenderLayer.visible = true;
		let balls = obj.balls;
		for (let i = 0; i < balls.length; ++i)
		{
			let ball = balls[i];
			let isset = false;
			for (let ball2 of this.balls)
			{
				if (ball2.id === ball.id)
				{
					ball2.position = ball.pos;
					ball2.angle = ball.rot;
					isset = true;
					break;
				}
			}
			if (!isset)
			{
				//console.log('error set', ball);
			}
		}
		this._physicsTime = obj.time;
	}

	getSkillLevel()
	{
		return this._gameStartInfo.skillLevel;
	}
	/**增加游戏时间，单位：秒 */
	addGameTime(n: number)
	{
		if (this._isGameStart && !this._isGameOver && !this._isTimeOver)
		{
			this._leftGameTime += n * 1000;
		}
	}
	//为了能在游戏中，实时显示冒险任务的进度，所以使用这个函数来收集任务数据
	collectTaskData()
	{
		let taskData: any = {};
		let totalBall = 0;
		for (let c of this._petKillCount) totalBall += c;
		taskData.ball = totalBall;
		taskData.exp = this._petKillCount[0];
		taskData.bomb = this._bombCount;
		taskData.skill = this._skillCount;
		taskData.coin = this._coin;
		taskData.fever = this._feverCount;
		for (let i = 0; i < this._petKillCount.length; ++i)
		{
			let pid = this._gameStartInfo.pets[i];
			taskData['ball' + pid] = this._petKillCount[i];
		}
		taskData['skill' + this._gameStartInfo.pets[0]] = this._skillCount;
		taskData.link = this._maxLink;
		taskData.combo = this._maxCombo;
		taskData.expBomb = this._expBomb;
		taskData.timeBomb = this._timeBomb;
		taskData.scoreBomb = this._scoreBomb;
		taskData.coinBomb = this._coinBomb;
		taskData.score = this._score;
		return taskData;
	}

	_updateTaskText()
	{
		let task = this._weeklyTask;
		let text = '';
		if (task && task.status === 'running')
		{
			let parsedTaskType = WT.splitWeeklyTaskType(task.type, task.param);
			if (parsedTaskType)
			{
				let key = parsedTaskType[1];
				let taskData = this.collectTaskData();
				let value = taskData[key] | 0;
				value += task.count;
				text = `${task.desc}  ${value}/${task.maxCount}`;
			}
		}

		this.setTaskText(text);
	}
	/**暂停游戏 */
	_pauseGame()
	{
		if (!this._isGameStart) return;
		if (this.isMatch) return;
		if (!this._isGamePaused && !this._isTimeOver && !this._isGameOver)
		{
			this._isGamePaused = true;
			if (!this.gamePausePanel)
			{
				this.gamePausePanel = new GamePausePanel(this);
				this.spr.addChild(this.gamePausePanel.spr);
			}
			this.gamePausePanel.show();
		}
	}

	/**继续游戏 */
	_resumeGame()
	{
		if (this._isGamePaused)
		{
			this._isGamePaused = false;
		}
	}

	/**基本上由技能设置，子弹时间 */
	setTimeScale(time: number)
	{
		if (!this._isGameStart) return;
		if (this._isTimeOver) return;
		if (time <= 0.0) time = 0.01;
		if (this._timeScale !== time)
		{
			this._timeScale = time;
			if (this._workerReady && this._worker)
			{
				this._worker.postMessage({ cmd: 'timeScale', timeScale: time });
			}
		}
	}
	/**技能调用：随机将一种果冻整理到最上方 */
	raiseUpBalls(balls: Ball[])
	{
		if (!this._isGameStart) return;
		if (this._isTimeOver) return;
		let ids = balls.map(x => x.id);
		if (this._workerReady && this._worker)
		{
			this._worker.postMessage({ cmd: 'raiseUpBalls', ids: ids });
		}
	}
	/**设置金币获取倍率 */
	setCoinScale(n)
	{
		if (n !== this._coinScale)
		{
			this._coinScale = n;
		}
	}

	/**自动选中可以连接的三个球，提示提示一下 */
	startHint()
	{
		this.clearHint();
		this._lastActionTime = Date.now();//无论是否找到提示，重置一下时间，否则会立刻反复查找
		if (!this._isGameStart) return;
		if (this._gameStartInfo.tutorial) return;
		if (this._isTimeOver || this._isGameOver) return;
		if (this._skill.isCasting()) return;

		let ballsByColor = {};
		let MAX_SQR_DIST = Game.MAX_LINK_DISTANCE * Game.MAX_LINK_DISTANCE * 0.9 * 0.9;
		for (let ball of this.balls)
		{
			if (!ball.isBomb && ball.status === 'normal')
			{
				let color = ball.color;
				if (!ballsByColor[color])
					ballsByColor[color] = [];
				ballsByColor[color].push(ball);
			}
		}
		let self = this;
		let hintBalls = null;
		//放入数组，随机一下
		let ballsOfBalls = [];
		for (let color in ballsByColor)
		{
			ballsOfBalls.push(ballsByColor[color]);
		}
		util.shuffle(ballsOfBalls);

		for (let balls of ballsOfBalls)
		{
			util.shuffle(balls);
			hintBalls = search(balls);
			if (hintBalls) break;
		}


		if (hintBalls)
		{
			//console.log('find hint', hintBalls);
			this._hintBalls = hintBalls;
			for (let i = 0; i < hintBalls.length; ++i)
			{
				hintBalls[i].blink = true;
			}
		}
		else
		{
			//console.log("can't find hint");
		}


		//search implement


		function search(balls: Ball[], ret?: Ball[])
		{
			if (!ret || ret.length === 0)
			{
				for (let ball of balls)
				{
					let xx = search(balls, [ball]);
					if (xx) return xx;
				}
				return null;
			}
			if (ret.length >= 3) return ret;

			let lastBall = ret[ret.length - 1];
			for (let ball of balls)
			{
				if (ret.indexOf(ball) >= 0) continue;
				if (util.sqrDistance(lastBall.position, ball.position) > MAX_SQR_DIST) continue;
				if (!self.canLink(lastBall, ball)) continue;
				let xx = search(balls, ret.concat(ball));
				if (xx) return xx;
			}
			return null;
		}
	}

	clearHint()
	{
		for (let ball of this._hintBalls)
		{
			ball.blink = false;
		}
		this._hintBalls.length = 0;
		this._lastActionTime = Date.now();
	}

	private _checkHint()
	{
		if (Date.now() > this._lastActionTime + 3000)
		{
			this.startHint();
		}
		if (!this._hintBalls || !this._hintBalls.length) return;
		for (let i = 0; i < this._hintBalls.length - 1; ++i)
		{
			let ball = this._hintBalls[i];
			if (ball.status !== 'normal')
			{
				this.clearHint();
				break;
			}
		}
		for (let i = 0; i < this._hintBalls.length - 1; ++i)
		{
			if (!this._canLink(this._hintBalls[i], this._hintBalls[i + 1]))
			{
				this.clearHint();
				break;
			}
		}
	}

	private _needMoreTimeStatus: 'no' | 'showing' | 'showned' = 'no'; //还没有显示，显示中，已经显示过了

	private _showNeedMoreTimeDialog(onOk: Function, onCancel: Function)
	{
		this._needMoreTimeStatus = 'showing';
		/*
		let dlg = new NeedMoreTimeDialog(this);
		this.spr.addChild(dlg.spr);
		dlg.show(() =>
		{
			this._needMoreTimeStatus = 'showned';
			onOk();
		}, () =>
		{
			this._needMoreTimeStatus = 'showned';
			onCancel();
		})*/
		HallUI.instance.whenWant10s(5, () =>
		{
			this._needMoreTimeStatus = 'showned';
			onOk();
		}, () =>
			{
				this._needMoreTimeStatus = 'showned';
				onCancel();
			});
	}

	/**当前的条件是不是需要显示需要更多时间的对话框 */
	private _isNeedToShowNeedMoreTimeDialog()
	{
		//如果当前分数 >= weeklyHighScore * 95% 则显示
		return !this._gameStartInfo.tutorial && !this._gameStartInfo.isMatch && this._score >= GameLink.instance.weekHighScore * 0.95;
	}

	setMatchPlayerScore(obj)
	{
		if (this._matchUI && typeof obj.gameScore === 'number')
		{
			var idx = -1;
			var players = GameLink.instance.matchPlayers;
			for (var i = 0; i < players.length; ++i)
			{
				if (players[i].key === obj.key) idx = i;
			}
			if (idx !== -1)
			{
				this._matchUI.setScore(idx + 1, obj.gameScore);
			}
		}
	}

	showMatchWaitText(text: string)
	{
		this._matchWaitText.text = text;
		this._matchWaitText.visible = true;
	}
	hideMatchWaitText()
	{
		this._matchWaitText.visible = false;
	}
	hideBonusTime()
	{
		this._animation.hideBonusTime();
	}
}

function calcAABBCenter(balls: Ball[])
{
	if (balls.length == 0) return { x: 0, y: 0 };
	let x0, y0, x1, y1;
	x0 = x1 = balls[0].position.x;
	y0 = y1 = balls[0].position.y;
	for (let i = 1; i < balls.length; ++i)
	{
		let x = balls[i].position.x;
		let y = balls[i].position.y;
		if (x < x0) x0 = x;
		if (x > x1) x1 = x;
		if (y < y0) y0 = y;
		if (y > y1) y1 = y;
	}
	return { x: (x0 + x1) * 0.5, y: (y0 + y1) * 0.5 };
}

let COMBO_NUMBER = new MiniImageLoader('images/Game/连击数字.png', image => util.cutRowImages(image, 11, res.GLOBAL_SCALE));
let COMBO_TEXT = new MiniImageLoader('images/Game/连击字母.png', image => util.scaleImage(image, res.GLOBAL_SCALE));
//初始化上面的变量
function _INIT_IMAGES()
{
	COMBO_NUMBER.init();
	COMBO_TEXT.init();
}




const GAME_COMM_RES = [
	{ id: 'images/Game/金币icon.png', src: 'images/Game/金币icon.png' },
	{ id: 'images/Game/skillbg1.png', src: 'images/Game/skillbg1.png' },
	{ id: 'images/Game/skillbg2.png', src: 'images/Game/skillbg2.png' },
	{ id: 'images/Game/skillbg3.png', src: 'images/Game/skillbg3.png' },
	{ id: 'fever_bg_0', src: 'images/Game/a_1_0000.png' },
	{ id: 'fever_bg_1', src: 'images/Game/a_1_0001.png' },
	{ id: 'fever_bg_2', src: 'images/Game/a_1_0002.png' },
	{ id: 'fever_bg_3', src: 'images/Game/a_1_0003.png' },
	{ id: 'fever_bg_4', src: 'images/Game/a_1_0004.png' },
	{ id: 'fever_bg_5', src: 'images/Game/a_1_0005.png' },
	{ id: 'game_task_bg', src: 'images/Game/_0025_图层-40-副本-3.png' },
	{ id: 'shake_button_bg', src: 'images/Game/_0023_图层-3.png' },
	{ id: 'pause_button_bg', src: 'images/Game/_0024_图层-2.png' },
	{ id: 'exit_button', src: 'images/Game/exit_button.png' },
	{ id: 'continue_button', src: 'images/Game/continue_button.png' },
	{ id: 'ready', src: 'images/Game/准备.png' },
	{ id: 'go', src: 'images/Game/GO.png' },
	{ id: 'pause_text', src: 'images/Game/暂停中.png' },
	{ id: 'more_time_text1', src: 'images/Game/-_0000_是否延长10秒倒计时？.png' },
	{ id: 'more_time_text2', src: 'images/Game/more_time_dialog_text2.png' },
	{ id: 'more_time_title', src: 'images/Game/-_0005_增-援.png' },
	{ id: 'more_time_need', src: 'images/Game/-_0002_需-要.png' },
	{ id: 'more_time_giveup', src: 'images/Game/-_0001_放-弃.png' },
	//{ id: 'timer_digits', src: 'images/倒计时数字.png' },
	//{ id: 'fever_text', src: 'images/Game/进度条f.png' },
	{ id: 'clock_chars', src: 'images/Game/-_0000_倒计时数字.png' },
];


let BALL_RES = [
	{ id: 'bomb0', src: 'images/Balls/普通炸弹.png', anchorX: 50, anchorY: 50, color: "bomb0" },
	{ id: 'bomb1', src: 'images/Balls/分数炸弹.png', anchorX: 50, anchorY: 50, color: "bomb1" },
	{ id: 'bomb2', src: 'images/Balls/金钱炸弹.png', anchorX: 50, anchorY: 50, color: "bomb2" },
	{ id: 'bomb3', src: 'images/Balls/经验炸弹.png', anchorX: 50, anchorY: 50, color: "bomb3" },
	{ id: 'bomb4', src: 'images/Balls/时间炸弹.png', anchorX: 50, anchorY: 50, color: "bomb4" },
	{ id: 'bomb5', src: 'images/Balls/BigBomb.png', anchorX: 50, anchorY: 50, color: "bomb5" },
	{ id: 'images/Balls/1.png', src: 'images/Balls/1.png', anchorX: 40, anchorY: 40, color: "0" },
	{ id: 'images/Balls/2.png', src: 'images/Balls/2.png', anchorX: 40, anchorY: 40, color: "1" },
	{ id: 'images/Balls/3.png', src: 'images/Balls/3.png', anchorX: 40, anchorY: 40, color: "2" },
	{ id: 'images/Balls/4.png', src: 'images/Balls/4.png', anchorX: 40, anchorY: 40, color: "3" },
	{ id: 'images/Balls/5.png', src: 'images/Balls/5.png', anchorX: 40, anchorY: 40, color: "4" },
	{ id: 'images/Balls/6.png', src: 'images/Balls/6.png', anchorX: 40, anchorY: 40, color: "5" },
	{ id: 'images/Balls/7.png', src: 'images/Balls/7.png', anchorX: 40, anchorY: 40, color: "6" },
	{ id: 'images/Balls/8.png', src: 'images/Balls/8.png', anchorX: 40, anchorY: 40, color: "7" },
	{ id: 'images/Balls/9.png', src: 'images/Balls/9.png', anchorX: 40, anchorY: 40, color: "8" },
	{ id: 'images/Balls/10.png', src: 'images/Balls/10.png', anchorX: 40, anchorY: 40, color: "9" },
	{ id: 'images/Balls/11.png', src: 'images/Balls/11.png', anchorX: 40, anchorY: 40, color: "10" },
	{ id: 'images/Balls/12.png', src: 'images/Balls/12.png', anchorX: 40, anchorY: 40, color: "11" },
	{ id: 'images/Balls/13.png', src: 'images/Balls/13.png', anchorX: 40, anchorY: 40, color: "12" },
	{ id: 'images/Balls/14.png', src: 'images/Balls/14.png', anchorX: 40, anchorY: 40, color: "13" },
	{ id: 'images/Balls/15.png', src: 'images/Balls/15.png', anchorX: 40, anchorY: 40, color: "14" },
	{ id: 'images/Balls/16.png', src: 'images/Balls/16.png', anchorX: 40, anchorY: 40, color: "15" },
	{ id: 'images/Balls/17.png', src: 'images/Balls/17.png', anchorX: 40, anchorY: 40, color: "16" },
	{ id: 'images/Balls/18.png', src: 'images/Balls/18.png', anchorX: 40, anchorY: 40, color: "17" },
	{ id: 'images/Balls/19.png', src: 'images/Balls/19.png', anchorX: 40, anchorY: 40, color: "18" },
	{ id: 'images/Balls/20.png', src: 'images/Balls/20.png', anchorX: 40, anchorY: 40, color: "19" },
	{ id: 'images/Balls/21.png', src: 'images/Balls/21.png', anchorX: 40, anchorY: 40, color: "20" },
	{ id: 'images/Balls/22.png', src: 'images/Balls/22.png', anchorX: 40, anchorY: 40, color: "21" },
	{ id: 'images/Balls/23.png', src: 'images/Balls/23.png', anchorX: 40, anchorY: 40, color: "22" },
	{ id: 'images/Balls/24.png', src: 'images/Balls/24.png', anchorX: 40, anchorY: 40, color: "23" },
	{ id: 'images/Balls/25.png', src: 'images/Balls/25.png', anchorX: 40, anchorY: 40, color: "24" },
	{ id: 'images/Balls/26.png', src: 'images/Balls/26.png', anchorX: 40, anchorY: 40, color: "25" },
	{ id: 'images/Balls/27.png', src: 'images/Balls/27.png', anchorX: 40, anchorY: 40, color: "26" },
];

const BALL_RES_BOMB_COUNT = 6;
//特殊炸弹的color
const BOMB_TYPE_SCORE = 'bomb1'; //炸弹炸掉的球的分数翻倍
const BOMB_TYPE_COIN = 'bomb2'; //加金币10个
const BOMB_TYPE_EXP = 'bomb3';  //经验增加10（携带宠物的经验）
const BOMB_TYPE_TIME = 'bomb4'; //时间增加2秒
const BOMB_TYPE_BIG = 'bomb5';

//BALL_RES = BALL_RES.slice(0, BALL_RES_BOMB_COUNT + 2);
//BALL_RES.length = 2;


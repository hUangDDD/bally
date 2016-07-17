///<reference path="../typings/tsd.d.ts"/>
import {GraphicConstant as GC} from "./resource"
import * as util from "./util"
import * as res from "./resource"
import {SimpleButton} from "./SimpleButton"
import {Game} from "./game/Game"
import {HallUI} from "./hall/HallUI"
import * as main from "./main"
import {GameLink} from "./GameLink"
import {PetLevelUpPanel} from "./hall/pet_levelup/PetLevelUpPanel"
import {SoundManager} from "./SoundManager"

export class GameStage
{
	static instance: GameStage;
	stage: createjs.Stage;
	canvas: HTMLCanvasElement;
	/**背景们，调用setCssBackground的时候，就是切换这些的显示状态 */
	backgroundImageElements: HTMLImageElement[] = [];
	label: createjs.Text = new createjs.Text();
	_dirty = false;
	_currentGame: Game;
	_hall: HallUI;
	_link: GameLink;
	constructor(canvas: HTMLCanvasElement)
	{

		this._link = new GameLink();
		//create backgroundImageElement
		window['stage'] = this;
		GameStage.instance = this;
		createjs.Ticker.framerate = GC.FPS;
		//createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
		createjs.Ticker.on('tick', () => this.update());
		this.canvas = canvas;
		this.stage = new createjs.Stage(canvas);
		this.stage.snapToPixelEnabled = true;

		this._hall = new HallUI();
		this.stage.addChild(this._hall.spr);
		this.stage.addChild(this.label);
		this.label.textAlign = 'right';
		this.label.x = GC.SCREEN_WIDTH;
		this.label.font = '13px';
		this.label.lineHeight = 13;
		createjs.Touch.enable(this.stage, true);
		this._hall.show();
	}

	_drawTime: number = 0;
	setCssBackgroundImage(image: HTMLImageElement)
	{
		let parent = this.canvas.parentElement;
		image.className = 'contentOnly';
		image.style.position = 'absolute';
		image.style.width = '100%';
		image.style.height = '100%';
		image.style.left = null;
		image.style.top = null;
		parent.insertBefore(image, parent.firstChild);
		image.setAttribute('data-url', image.src);
		this.backgroundImageElements.push(image);
	}
	setCssBackground(url: string)
	{
		// 现在这个实现，不是用css背景了
		// 为了切换css背景每次都是重新读取图片的问题
		// 所以创建多个img标签，切换的时候将不需要的背景隐藏起来
		let has = false;
		for (let i = 0; i < this.backgroundImageElements.length; ++i)
		{
			let img = this.backgroundImageElements[i];
			let data_url = img.getAttribute('data-url');
			if (data_url == url)
			{
				has = true;
				img.style.display = 'block';
			}
			else
			{
				img.style.display = 'none';
			}
		}

		if (!has)
		{
			let img = main.createOverlayHtml('img') as HTMLImageElement;
			let parent = this.canvas.parentElement;
			//插入到parent第一个元素
			parent.insertBefore(img, parent.firstChild);
			img.src = url;
			img.setAttribute('data-url', url);
			this.backgroundImageElements.push(img);
		}
	}

	update()
	{
		if (document.hidden === true)
		{
			SoundManager.background = true;
		}
		let physicsTime = 0;
		let logicTime = 0;
		let tick = 0;

		if (this._currentGame)
		{
			this._currentGame.update();
			physicsTime = this._currentGame.physicsTime;
			logicTime = this._currentGame.logicTime;
			tick = this._currentGame.tick;
		}
		/*
		this.label.text = `fps:${createjs.Ticker.getMeasuredFPS() | 0}
physics:${physicsTime | 0}ms
logicTime:${logicTime | 0}ms
drawTime:${this._drawTime | 0}ms
tick:${tick}
		`*/
		this.label.visible = false;

		let t1 = Date.now();
		this.stage.update();
		this._drawTime = Date.now() - t1;
	}
	/*
		restartGame()
		{
			this.closeGame();
			alert('游戏结束，重新开始啦');
			let game = new Game();
			this.stage.addChildAt(game.spr, 0);
			game.init();
			this._currentGame = game;
		}
	*/
	createGame(obj)
	{
		this.closeGame();
		this._currentGame = new Game();
		this.stage.addChild(this._currentGame.spr);
		this._currentGame.init(obj);
		this._hall.show(false);
	}

	closeGame()
	{
		if (this._currentGame)
		{
			this.stage.removeChild(this._currentGame.spr);
			this._currentGame.clear();
			this._currentGame = null;
		}
		this._hall.show(true);
		this._hall._updateCssBackground();
	}

	//如果当前游戏是对战模式，则结束游戏。
	//因为对战模式是不能断线重入。所以这个特殊处理一下
	closeMatchGame()
	{
		if (this._currentGame && this._currentGame.isMatch)
		{
			this.closeGame();
		}
	}

	/**当收到gameover cmd的时候，由GameLink调用这个 */
	showGameOver(obj)
	{
		let petPanel = new PetLevelUpPanel(obj.petResult);
		this.stage.addChild(petPanel.spr);
		SoundManager.playBg(null);
		SoundManager.playEffect('bgGameOver');
		if (this._currentGame)
		{
			this._currentGame.hideBonusTime();
			this._currentGame.hideMatchWaitText();
		}
		petPanel.onAnimationEnd = () =>
		{
			this.closeGame();
			if (obj.isMatch)
			{
				this._hall.showMatchEndPanel(obj);
			}
			else
			{
				this._hall.showScorePanel(obj);
			}

		}
		if (obj.isMatch)
		{
			console.log('收到对战结束信息');
		}
	}

	testPetLevelUp()
	{
		let petPanel = new PetLevelUpPanel(PetLevelUpPanel.SAMPLE_DATA);
		this.stage.addChild(petPanel.spr);
	}

	makeDirty()
	{
		if (!this._dirty)
		{
			this._dirty = true;
			window.requestAnimationFrame(() =>
			{
				this._dirty = false;
				this.stage.update();
			});
		}
	}
}
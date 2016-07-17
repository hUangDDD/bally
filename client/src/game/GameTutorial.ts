import {Game} from "./Game"
import {Ball} from "./Ball"
import {TutorialDefine as define} from "./GameTutorialDefine"
import {ImageButton} from "../ImageButton"
import * as res from "../resource"
import * as util from "../util"
import {MiniImageLoader} from "../MiniImageLoader"
const GC = res.GraphicConstant;
export class GameTutorial
{
	spr = new createjs.Container();
	private mask: createjs.Bitmap;
	private maskCanvas: HTMLCanvasElement;
	private game: Game;
	private stepIndex = 0;
	private step: any;
	private get action() { return this.step && this.step.action; }
	private balls: Ball[] = []; //选中的球们
	private waitCallList: any[] = [];

	private petIcon: createjs.Bitmap;
	private petTextFrame: createjs.Bitmap;
	private petText: createjs.Text;

	private bombInfoBitmap: createjs.Bitmap;
	private blinkBalls = false;
	private lastTime = 0;
	private ballBlinkFlag = true;

	private backButton: ImageButton;
	private paintPoints: any[];

	private isSkillBlink = false;
	private skillBlinkFlag = true;
	private fingerBitmap: createjs.Bitmap;
	private fingerShow = false;
	private fingerCurrentBall = 0;
	private fingerNextBall = 0;
	constructor(game: Game)
	{
		FINGER_IMAGE.init();
		this.game = game;
		this.maskCanvas = document.createElement('canvas');
		this.maskCanvas.width = GC.SCREEN_WIDTH;
		this.maskCanvas.height = GC.SCREEN_HEIGHT;
		this.mask = new createjs.Bitmap(this.maskCanvas);
		this.spr.addChild(this.mask);
	}

	getResource(): any[]
	{
		return [
			{ id: 'tutorial/pet', src: 'images/tutorial/pet.png' },
			{ id: 'tutorial/frame', src: 'images/tutorial/frame.png' },
			{ id: 'tutorial/bombinfo', src: 'images/tutorial/bombinfo.png' },
			{ id: 'tutorial/back', src: 'images/tutorial/后退.png' },
		];
	}

	canTouchBall(ball: Ball): boolean
	{
		if (this.step)
		{
			if (['linkThree', 'linkSeven', 'linkBomb'].indexOf(this.action) >= 0)
			{
				let ret = this.balls.indexOf(ball) >= 0;
				if (ret) this.blinkBalls = false;
				return ret;
			}
			return false;
		}
		return true;
	}

	canLinkBall(ball: Ball): boolean
	{
		if (this.step)
		{
			if (['linkThree', 'linkSeven', 'linkBomb'].indexOf(this.action) >= 0)
			{
				return this.balls.indexOf(ball) >= 0;
			}
			return false;
		}
		return true;
	}

	canBombBalls(balls: Ball[]): boolean
	{
		if (this.step)
		{
			if (['linkThree', 'linkSeven', 'linkBomb'].indexOf(this.action) >= 0)
			{
				return balls.length === this.balls.length;
			}
			return false;
		}
		return true;
	}

	isPreventPhysics()
	{
		if (this.step)
		{
			return this.waitCallList.length > 0;
		}
		return false;
	}

	isTimePaused()
	{
		if (this.step) return true;
	}

	isRunning()
	{
		return !!this.step;
	}

	//当连接成功了一次的时候调用一下，在某些阶段，自动进入下一阶段
	triggerBomb()
	{
		if (this.step)
		{
			if (this.balls && this.balls.length > 0)
			{
				this.balls = [];
				if (typeof this.step.wait === 'number')
				{
					this._waitCall(this.step.wait, () => this._nextStep());
				}
				else
				{
					this._nextStep();
				}
			}
		}

	}

	//总是在mouseup时候调用
	triggerClick(pt)
	{
		if (this.step)
		{
			if (this.waitCallList.length > 0) return;

			if (this.backButton)
			{
				if (Math.abs(pt.x - this.backButton.x) <= this.backButton.width / 2 &&
					Math.abs(pt.y - this.backButton.y) <= this.backButton.height / 2)
				{
					this._back();
					return;
				}
			}

			if (typeof this.step.saying2 === 'string')
			{
				this._setPet(this.step.x, this.step.y, this.step.saying2);
			}

			if (this.action === 'linkThree' || this.action === 'linkSeven')
			{
				this.blinkBalls = true;
			}

			if (!(this.balls && this.balls.length > 0))
			{
				this._nextStep();
			}
		}
	}

	//正式开始教程
	start()
	{
		this.stepIndex = 0;
		this.step = define[0];
		this.fingerBitmap = new createjs.Bitmap(null);
		this.fingerBitmap.visible = false;
		this.fingerBitmap.set({
			regX: 34, regY: 32
		});
		this.spr.addChild(this.fingerBitmap);
		this._startStep(this.step);
		let btn = new ImageButton(this.game.getImage('tutorial/back'));
		this.spr.addChild(btn);
		btn.x = btn.width / 2 + 30;
		btn.y = btn.height / 2 + 30;
		this.backButton = btn;
	}

	update()
	{
		for (let i = 0; i < this.waitCallList.length;)
		{
			if (this.game.tick >= this.waitCallList[i].tick)
			{
				this.waitCallList[i].func();
				this.waitCallList.splice(i, 1);
			}
			else
			{
				++i;
			}
		}
		if (this.balls && this.balls.length >= 2)
		{
			let refindlink = false;
			for (let i = 0; i < this.balls.length - 1; ++i)
			{
				if (!this.game.canLink(this.balls[i], this.balls[i + 1]))
				{
					refindlink = true;
					break;
				}
			}
			if (refindlink)
			{
				this._findLinkBalls(this.step.x, this.step.y + 30, this.balls.length);
				this._resetFinger();
			}
		}

		if (this.blinkBalls)
		{
			let now = Date.now();
			if (now - this.lastTime >= 400)
			{
				this.balls.forEach(x => x.skillHighlight = this.ballBlinkFlag);
				this.ballBlinkFlag = !this.ballBlinkFlag;
				this.lastTime = now;
			}
		}
		else
		{
			if (!this.ballBlinkFlag)
			{
				this.balls.forEach(x => x.skillHighlight = this.ballBlinkFlag);
				this.ballBlinkFlag = true;
			}
		}

		if (this.balls && this.balls.length > 0)
		{
			let repaint = false;
			if (this.balls.length != this.paintPoints.length)
			{
				repaint = true;
			}
			else
			{
				for (let i = 0; i < this.balls.length; ++i)
				{
					let x = this.balls[i].position.x;
					let y = this.balls[i].position.y;
					if (Math.abs(x - this.paintPoints[i].x) >= 5 || Math.abs(y - this.paintPoints[i].y) >= 5)
					{
						repaint = true;
					}
				}
			}
			if (repaint)
			{
				this._paintMask();
				this._highlightBalls();
			}
		}

		//blink skill
		if (this.isSkillBlink)
		{
			let now = Date.now();
			if (now - this.lastTime >= 400)
			{
				this._paintMask();
				if (this.skillBlinkFlag) this._paintHighlighCircles(89, 1010, 80);
				this.skillBlinkFlag = !this.skillBlinkFlag;
				this.lastTime = now;
			}
		}
		this._updateFinger();
	}
	private _back()
	{
		if (this.stepIndex > 0 && this.waitCallList.length === 0)
		{
			this.stepIndex--;
			this.step = define[this.stepIndex];
			this.game.balls.forEach(ball =>
			{
				if (ball.isBomb && ball.status === 'normal')
				{
					this.game.bombTheBomb(ball);
				}
			})
			this._startStep(this.step);
		}
	}
	private _startStep(step)
	{
		console.log('进入教程：' + JSON.stringify(step));
		this._hideFinger();
		if (this.bombInfoBitmap)
		{
			this.bombInfoBitmap.visible = false;
		}
		this.blinkBalls = false;
		this.step = step;
		this.balls = [];
		this._paintMask();
		this._setPet(step.x, step.y, step.saying);
		this.isSkillBlink = step.blinkSkill;
		if (typeof this.action === 'string' &&
			typeof this['_startAction_' + this.action] === 'function')
		{
			this['_startAction_' + this.action]();
		}
	}
	private _nextStep()
	{
		if (define[this.stepIndex + 1])
		{
			this.step = define[this.stepIndex + 1];
			++this.stepIndex;
			this._startStep(this.step);
		}
		else
		{
			this.step = null;
			this.spr.visible = false;
		}
	}

	//等待n秒，进入下一步
	private _waitCall(n: number, func: () => void)
	{
		this.waitCallList.push({
			tick: this.game.tick + n / GC.TICK_TIME,
			func: func
		});
	}
	//设置宠物说话。
	private _setPet(x: number, y: number, text: string)
	{
		if (!this.petIcon)
		{
			this.petIcon = new createjs.Bitmap(this.game.getImage('tutorial/pet'));
			this.petIcon.regX = this.petIcon.image.width / 2;
			this.petIcon.regY = this.petIcon.image.height / 2;

			this.petTextFrame = new createjs.Bitmap(this.game.getImage('tutorial/frame'));

			this.petText = new createjs.Text('', '22px SimHei', 'white');
			this.petText.lineHeight = 22;

			this.spr.addChild(this.petIcon);
			this.spr.addChild(this.petTextFrame);
			this.spr.addChild(this.petText);
		}
		this.petIcon.x = x;
		this.petIcon.y = y;
		this.petIcon.scaleX = -1.5;
		this.petIcon.scaleY = 1.5;
		this.petTextFrame.x = x + 25;
		this.petTextFrame.y = y - 180;
		this.petText.x = x + 40;
		this.petText.y = y - 176;
		this.petText.text = text;

		this.petIcon.visible = true;
		this.petText.visible = true;
		this.petTextFrame.visible = true;
	}

	//隐藏说话的宠物
	private _hidePet()
	{
		if (this.petIcon)
		{
			this.petIcon.visible = false;
			this.petText.visible = false;
			this.petTextFrame.visible = false;
		}
	}

	//清空mask
	private _paintMask()
	{
		/*let g = this.mask.graphics;
		g.clear();
		g.beginFill('rgba(0,0,0,0.8)');
		g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
		g.endFill();
		*/
		let ctx = this.maskCanvas.getContext('2d');
		ctx.clearRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
		ctx.fillStyle = 'rgba(0,0,0,0.8)';
		ctx.fillRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
	}
	//画一个高亮的园
	private _paintHighlighCircles(x: number, y: number, radius: number)
	{
		let ctx = this.maskCanvas.getContext('2d');
		{
			ctx.save();
			ctx.fillStyle = 'rgba(1,1,1,1)';
			ctx.globalCompositeOperation = 'destination-out';

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

	}

	private _startAction_linkThree()
	{
		this.balls = [];
		this._findLinkBalls(this.step.x, this.step.y + 30, 3);
		this._resetFinger();
	}

	private _startAction_linkSeven()
	{
		this.balls = [];
		this._findLinkBalls(this.step.x, this.step.y + 30, 7);
		this._resetFinger();
	}
	private _startAction_linkBomb()
	{
		for (let ball of this.game.balls)
		{
			if (ball.isBomb)
			{
				this.balls = [ball];
				this._highlightBalls();
				this._resetFinger();
				break;
			}
		}
	}
	private _startAction_showBombInfo()
	{
		if (!this.bombInfoBitmap)
		{
			this.bombInfoBitmap = new createjs.Bitmap(this.game.getImage('tutorial/bombinfo'));
			this.bombInfoBitmap.x = 99;
			this.bombInfoBitmap.y = 353;
			this.spr.addChild(this.bombInfoBitmap);
		}
		this.bombInfoBitmap.visible = true;
	}

	private _findLinkBalls(x: number, y: number, count: number)
	{
		this.balls = [];
		let distSqr = (Game.MAX_LINK_DISTANCE - 10) * (Game.MAX_LINK_DISTANCE - 10);
		let balls = this.game.balls.filter(x => !x.isBomb && x.status === 'normal' && x.position.y > y);
		let game = this.game;
		function link(currentBalls: Ball[], count: number) 
		{
			if (count <= 0) return currentBalls;
			let lastBall = currentBalls[currentBalls.length - 1];
			let pos = lastBall.position;
			game.nextLinkIgnoreColor = true; //临时设置成true，下面调用canLink的时候就会忽略颜色匹配了。
			let nextBalls = balls.filter(x =>
			{
				if (currentBalls.indexOf(x) < 0 && util.sqrDistance(x.position, pos) <= distSqr && game.canLink(lastBall, x))
					return true;
				return false;
			}).map(ball =>
			{
				//为了让nextBalls按照越靠近右下方向的排序。（pi/4的夹角，越小越靠近右下方向）
				let angle = Math.atan2(ball.position.y - pos.y, ball.position.x - pos.x);
				let dist;
				if (angle > 0)
				{
					dist = Math.abs(angle - Math.PI / 4);
				}
				else
				{
					dist = Math.PI - Math.abs(-angle - 3 * Math.PI / 4);
				}
				return { ball: ball, dist: dist };
			});
			game.nextLinkIgnoreColor = false;
			nextBalls.sort((a, b) => a.dist - b.dist);
			for (let i = 0; i < nextBalls.length; ++i)
			{
				let arr = currentBalls.slice();
				arr.push(nextBalls[i].ball);
				let ret = link(arr, count - 1);
				if (ret) return ret;
			}
			return null;
		}

		for (let ball of balls)
		{
			let ret = link([ball], count - 1);
			if (ret)
			{
				this.balls = ret;
				this._highlightBalls();
				this.balls.forEach(x =>
				{
					if (x.color !== this.balls[0].color)
					{
						x.changeColor(this.balls[0].getDefine());
					}
				})
				break;
			}
		}
	}

	_highlightBalls()
	{
		this._paintMask();
		this.paintPoints = [];
		this.balls.forEach(x =>
		{
			this._paintHighlighCircles(x.position.x, x.position.y, this.balls.length === 1 ? 100 : 75);
			this.paintPoints.push({ x: x.position.x, y: x.position.y });
		});
	}

	private _resetFinger()
	{
		this.fingerShow = true;
		var bitmap = this.fingerBitmap;
		bitmap.image = FINGER_IMAGE.result;
		if (!this.balls || this.balls.length == 0)
		{
			bitmap.visible = false;
			return;
		}
		if (this.balls.length >= 1)
		{
			bitmap.visible = true;
			bitmap.set({
				x: this.balls[0].position.x,
				y: this.balls[0].position.y
			});
			this.fingerCurrentBall = 0;
			this.fingerNextBall = 1;
		}

	}
	private _updateFinger()
	{
		if (!this.fingerShow) return;
		var bitmap = this.fingerBitmap;
		var balls = this.balls;
		bitmap.image = FINGER_IMAGE.result;
		if (!balls || balls.length === 0)
		{
			bitmap.visible = false;
			return;
		}
		bitmap.visible = true;
		if (balls.length === 1)
		{
			bitmap.set({
				x: this.balls[0].position.x,
				y: this.balls[0].position.y
			});
			return;
		}
		var step = 10;
		if (this.fingerNextBall >= balls.length)
		{
			this.fingerCurrentBall = balls.length - 1;
			this.fingerNextBall = balls.length - 2;
			var ball = balls[this.fingerCurrentBall];
			if (ball)
			{
				bitmap.x = ball.position.x;
				bitmap.y = ball.position.y;
			}
		}
		else if (this.fingerNextBall < 0)
		{
			this.fingerNextBall = 1;
			this.fingerCurrentBall = 0;
			var ball = balls[this.fingerCurrentBall];
			if (ball)
			{
				bitmap.x = ball.position.x;
				bitmap.y = ball.position.y;
			}
		}
		else
		{
			var ball = balls[this.fingerNextBall];
			if (ball)
			{
				var dist = Math.sqrt(util.sqrDistance(ball.position, bitmap));
				if (dist <= step)
				{
					bitmap.x = ball.position.x;
					bitmap.y = ball.position.y;
					if (this.fingerNextBall < this.fingerCurrentBall)
					{
						--this.fingerNextBall;
						--this.fingerCurrentBall;
					}
					else
					{
						++this.fingerNextBall;
						++this.fingerCurrentBall;
					}
				}
				else
				{
					var dx = ball.position.x - bitmap.x;
					var dy = ball.position.y - bitmap.y;
					bitmap.x += dx / dist * step;
					bitmap.y += dy / dist * step;
				}
			}
		}

	}
	private _hideFinger()
	{
		this.fingerShow = false;
		this.fingerBitmap.visible = false;
	}
}

var FINGER_IMAGE = new MiniImageLoader('images/Game/引导手指.png', result => result);
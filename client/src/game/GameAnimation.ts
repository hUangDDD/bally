import {Game} from "./Game"
import {GraphicConstant as GC} from "../resource"
import {MiniImageLoader} from "../MiniImageLoader"
import {Ball, BALL_BITMAP_RESAMPLE} from "./Ball"
import * as res from "../resource"
import * as GameUtil from "./GameUtil"
import * as util from "../util"

export class GameAnimation
{
	private game: Game;
	private _linkCountUI: createjs.Container;

	feverScoreLayer: createjs.Container = new createjs.Container();
	feverEffectLayer: createjs.Container = new createjs.Container();
	//private _feverBonusText: createjs.Text;
	private _feverBonusBitmap: createjs.Bitmap;
	private _feverBonusScore: createjs.Container;
	private _feverEffectBitmap: createjs.Bitmap;
	private _feverEffectTween: createjs.Tween;

	private _realFeverScore = 0;
	private _showFeverScore = 0;
	private _feverScoreTween: createjs.Tween;
	constructor(_game: Game)
	{
		this.game = _game;
	}

	init()
	{
		_INIT_MY_RES();
		// init fever animation
		{
			let bitmaps = [];
			for (let i = 0; i < 6; ++i) bitmaps.push(this.game.getImage('fever_bg_' + i));
			this._feverEffectBitmap = new createjs.Bitmap(null);
			this._feverEffectBitmap.x = -79;
			this._feverEffectBitmap.y = 75 + 104;
			//this._feverEffectBitmap.visible = false;
			this._feverEffectTween = new createjs.Tween(this._feverEffectBitmap, { loop: true, paused: true });
			for (let i = 0; i < bitmaps.length; ++i)
			{
				this._feverEffectTween.wait(500 / bitmaps.length).set({ image: bitmaps[i] }, this._feverEffectBitmap);
			}
			this.feverEffectLayer.addChild(this._feverEffectBitmap);
		}
		//this.playFeverEffect();
	}

	playFeverEffect()
	{
		this.feverEffectLayer.visible = true;
		this._feverEffectTween.setPaused(false);
	}
	stopFeverEffect()
	{
		if (this.feverEffectLayer) this.feverEffectLayer.visible = false;
		if (this._feverEffectTween) this._feverEffectTween.setPaused(true);
	}

	/**
	 * 飘一个当前点了第几个球的数字
	 */
	flyLinkCountTip(x, y, n)
	{
		this.clearLinkCountTip();
		if (!CACHED_LINE_COUNT_IMAGES.result) return;
		x += 35 * res.GLOBAL_SCALE;
		y -= 10 * res.GLOBAL_SCALE;
		n = (n | 0).toString();
		let container = new createjs.Container();
		let xx = 0;
		for (let i = 0; i < n.length; ++i)
		{
			let nn = parseInt(n[i]);
			let bitmap = new createjs.Bitmap(CACHED_LINE_COUNT_IMAGES.result[nn]);
			bitmap.x = xx;
			bitmap.y = 0;
			container.addChild(bitmap);
			xx += bitmap.image.width;
		}
		container.x = x;
		container.y = y;
		this.game.animationLayer.addChild(container);
		createjs.Tween.get(container).to({ y: y - 30, alpha: 1 }, 200);
		this._linkCountUI = container;
	}

	clearLinkCountTip()
	{
		if (this._linkCountUI)
		{
			this._linkCountUI.parent.removeChild(this._linkCountUI);
			this._linkCountUI = null;
		}
	}

	/**
	 * 收金币动画
	 */
	receiveCoinAnimation(x, y)
	{
		let image = this.game.getImage('images/Game/金币icon.png');
		let bitmap = new createjs.Bitmap(image);
		bitmap.regX = image.width / 2;
		bitmap.regY = image.height / 2;
		bitmap.x = x;
		bitmap.y = y;
		bitmap.scaleX = bitmap.scaleY = res.GLOBAL_SCALE;
		this.game.animationLayer.addChild(bitmap);
		createjs.Tween.get(bitmap).to(res.POSITIONS.COIN_CENTER, 300, createjs.Ease.cubicInOut).call(function (obj: any)
		{
			if (obj.parent) obj.parent.removeChild(obj);
		}, [bitmap]);
	}

	showScoreAnimation(score: number, linkCount: number, x: number, y: number, toFever: boolean)
	{
		var UP_AMOUNT = 20 * res.GLOBAL_SCALE; //向上飞行多少
		var UP_DURATION = 200;                 //向上飞行时间
		var DELAY_TIME = 500;                  //等待多少时间
		var TO_TARGET_DURATION = 300           //飞往目的地的时间
		//目标位置
		var tx, ty;
		if (toFever)
		{
			tx = res.POSITIONS.FEVER_SCORE_CENTER.x;
			ty = res.POSITIONS.FEVER_SCORE_CENTER.y;
		}
		else
		{
			tx = res.POSITIONS.SCORE_CENTER.x;
			ty = res.POSITIONS.SCORE_CENTER.y + 50 * res.GLOBAL_SCALE;
		}


		if (!SCORE_NUMBER.result) return;
		let scoreImage = null;
		let scoreImageIndex = -1;
		if (linkCount >= 5 && linkCount <= 7)
		{
			scoreImageIndex = 0;
		}
		else if (linkCount >= 8 && linkCount <= 10)
		{
			scoreImageIndex = 1;
		}
		else if (linkCount >= 11 && linkCount <= 14)
		{
			scoreImageIndex = 2;
		}
		else if (linkCount >= 15 && linkCount <= 19)
		{
			scoreImageIndex = 3;
		}
		else if (linkCount >= 20 && linkCount <= 29)
		{
			scoreImageIndex = 4;
		}
		else if (linkCount >= 30)
		{
			scoreImageIndex = 5;
		}

		scoreImage = LINK_SHOW_IMAGES[scoreImageIndex] ? LINK_SHOW_IMAGES[scoreImageIndex].result : null;

		let container = new createjs.Container();
		container.x = x;
		container.y = y;
		let bitmaps = GameUtil.createDigitBitmap(score, SCORE_NUMBER.result, true);
		let numberHeight = 0;
		for (let x of bitmaps)
		{
			container.addChild(x);
			numberHeight = x.image.height;
		}
		let scoreImageBitmap = null;
		if (scoreImage)
		{
			scoreImageBitmap = new createjs.Bitmap(scoreImage);
			scoreImageBitmap.x = -scoreImage.width / 2;
			scoreImageBitmap.y = -scoreImage.height - numberHeight;
			container.addChild(scoreImageBitmap);
		}

		let bounds = container.getBounds();
		let right = container.x + bounds.x + bounds.width;
		let left = container.x - bounds.x - bounds.width
		if (right > GC.SCREEN_WIDTH)
		{
			container.x = GC.SCREEN_WIDTH - bounds.x - bounds.width;
		}
		if (left < 0)
		{
			container.x = -bounds.x;
		}

		createjs.Tween.get(container)
			.to({ y: y - UP_AMOUNT }, UP_DURATION)
			.wait(DELAY_TIME)
			.call(GameUtil.removeSelfCallback, [scoreImageBitmap])
			.to({ x: tx, y: ty }, TO_TARGET_DURATION, createjs.Ease.circInOut)
			.call(GameUtil.removeSelfCallback, [container]);
		this.game.animationLayer3.addChild(container);
		return UP_DURATION + DELAY_TIME + TO_TARGET_DURATION;
	}

	playEnergyFullAnimation()
	{
		if (!ENERGY_FULL_EFFECT_IMAGE.result) return;
		let bitmap = new createjs.Bitmap(ENERGY_FULL_EFFECT_IMAGE.result);
		bitmap.regX = bitmap.image.width / 2;
		bitmap.regY = bitmap.image.height / 2;
		bitmap.x = res.POSITIONS.SKILL_BUTTON.x;
		bitmap.y = res.POSITIONS.SKILL_BUTTON.y;
		this.game.animationLayer.addChild(bitmap);
		bitmap.scaleX = 0.2;
		bitmap.scaleY = 0.2;
		createjs.Tween.get(bitmap).to({
			scaleX: 0.8,
			scaleY: 0.8
		}, 500).call(GameUtil.removeSelfCallback, [bitmap]);
	}
	playBombAnimation(x, y)
	{
		if (!BOMB_ANIM.result) return;
		let bitmap = new createjs.Bitmap(null);
		bitmap.x = x - BOMB_ANIM.result[0].width / 2;
		bitmap.y = y - BOMB_ANIM.result[0].height / 2;
		this.game.animationLayer.addChild(bitmap);
		util.animTween(bitmap, BOMB_ANIM.result, 800, true);
	}
	receiveEnergyAnimation(ball: Ball)
	{
		if (ball.bitmap && ball.bitmap.image)
		{
			let bitmap = new createjs.Bitmap(ball.bitmap.image);
			bitmap.regX = ball.bitmap.regX;
			bitmap.regY = ball.bitmap.regY;
			bitmap.x = ball.position.x;
			bitmap.y = ball.position.y;
			bitmap.scaleX = bitmap.scaleY = 0.8 / BALL_BITMAP_RESAMPLE;
			this.game.animationLayer.addChild(bitmap);
			let toX = GC.SCREEN_WIDTH * 0.16;
			let toY = GC.SCREEN_HEIGHT * 0.9;
			createjs.Tween.get(bitmap).to({
				x: toX, y: toY, alpha: 0.1
			}, 400, createjs.Ease.cubicInOut).call(function (bmp: any)
			{
				if (bmp.parent) bmp.parent.removeChild(bmp);
			}, [bitmap]);
		}
	}
	receiveFeverAnimation(ball: Ball)
	{
		//和receiveEnergyAnimation 一样，就是目标位置不一样
		if (ball.bitmap && ball.bitmap.image)
		{
			let bitmap = new createjs.Bitmap(ball.bitmap.image);
			bitmap.regX = ball.bitmap.regX;
			bitmap.regY = ball.bitmap.regY;
			bitmap.x = ball.position.x;
			bitmap.y = ball.position.y;
			bitmap.scaleX = bitmap.scaleY = 0.8 / BALL_BITMAP_RESAMPLE;
			this.game.animationLayer.addChild(bitmap);
			let toX = res.POSITIONS.FEVER_CENTER.x;
			let toY = res.POSITIONS.FEVER_CENTER.y;
			createjs.Tween.get(bitmap).to({
				x: toX, y: toY, alpha: 0.1
			}, 400, createjs.Ease.cubicInOut).call(function (bmp: any)
			{
				if (bmp.parent) bmp.parent.removeChild(bmp);
			}, [bitmap]);
		}
	}
	/**显示fever bonus分数 */
	showFeverScore(n: number)
	{
		if (!SCORE_NUMBER.result) return;

		const TEXT_SIZE = 30 * res.GLOBAL_SCALE;
		/*
				if (!this._feverBonusText)
				{
					this._feverBonusText = new createjs.Text('FEVER BONUS', `${TEXT_SIZE}px SimHei`);
					this._feverBonusText.textAlign = 'center';
					this._feverBonusText.x = res.POSITIONS.FEVER_SCORE_CENTER.x;
					this._feverBonusText.y = res.POSITIONS.FEVER_SCORE_CENTER.y;
				}
		
				if (!this._feverBonusText.parent)
				{
					this.feverScoreLayer.addChild(this._feverBonusText);
				}
		*/

		if (!this._feverBonusBitmap)
		{
			this._feverBonusBitmap = new createjs.Bitmap(null);
			this._feverBonusBitmap.x = 320;
			this._feverBonusBitmap.y = 189;
			this.feverScoreLayer.addChild(this._feverBonusBitmap);
		}
		if (!this._feverBonusBitmap.image)
		{
			this._feverBonusBitmap.image = FEVER_BONUS_IMAGE.result;
			if (this._feverBonusBitmap.image) this._feverBonusBitmap.regX = this._feverBonusBitmap.image.width / 2;
		}
		this._feverBonusBitmap.visible = true;

		// fever score
		if (!this._feverBonusScore)
		{
			this._feverBonusScore = new createjs.Container();
			this._feverBonusScore.x = res.POSITIONS.FEVER_SCORE_CENTER.x;
			this._feverBonusScore.y = res.POSITIONS.FEVER_SCORE_CENTER.y + TEXT_SIZE + SCORE_NUMBER.result[0].height;

		}
		if (!this._feverBonusScore.parent)
		{
			this.feverScoreLayer.addChild(this._feverBonusScore)
		}

		if (this._feverScoreTween)
		{
			this._feverScoreTween.setPaused(true);
			this._feverScoreTween = null;
		}
		this._realFeverScore = n;
		let obj = new GameUtil.ScoreTweenHelper(this._showFeverScore, (val) =>
		{
			if (val != this._showFeverScore)
			{
				this._showFeverScore = val;
				this._internalSetFeverScore(val);
			}
		});
		let tween = this._feverScoreTween = createjs.Tween.get(obj).to({ value: this._realFeverScore }, 1000);

		/*
				this._feverBonusScore.removeAllChildren();
				let digits = GameUtil.createDigitBitmap(n, SCORE_NUMBER.result, true);
				for (let d of digits)
				{
					this._feverBonusScore.addChild(d);
				}
		*/
	}
	/**将fever bonus分数飞到真实的分数上面 */
	collectFeverScore()
	{
		/*
		if (this._feverBonusText && this._feverBonusText.parent)
		{
			this._feverBonusText.parent.removeChild(this._feverBonusText);
		}
		*/
		if (this._feverBonusBitmap)
		{
			this._feverBonusBitmap.visible = false;
		}
		if (this._feverBonusScore && this._feverBonusScore.parent)
		{
			this._internalSetFeverScore(this._realFeverScore);
			createjs.Tween.get(this._feverBonusScore)
				.to({
					x: res.POSITIONS.SCORE_CENTER.x,
					y: res.POSITIONS.SCORE_CENTER.y
				}, 300)
				.call(GameUtil.removeSelfCallback, [this._feverBonusScore]);

			this._feverBonusScore = null;
		}

		if (this._feverScoreTween)
		{
			this._feverScoreTween.setPaused(true);
			this._feverScoreTween = null;
		}

		this._showFeverScore = 0;
		this._realFeverScore = 0;
		this._internalSetFeverScore(0);
	}

	private _internalSetFeverScore(n: number)
	{
		if (!this._feverBonusScore) return;
		this._feverBonusScore.removeAllChildren();
		let digits = GameUtil.createDigitBitmap(n, SCORE_NUMBER.result, true);
		for (let d of digits)
		{
			this._feverBonusScore.addChild(d);
		}
	}

	blinkTimeWarning()
	{
		if (!TIME_WARNING_MASK.result) return;
		let bitmap = new createjs.Bitmap(TIME_WARNING_MASK.result);
		bitmap.scaleX = GC.SCREEN_WIDTH / bitmap.image.width;
		bitmap.scaleY = GC.SCREEN_HEIGHT / bitmap.image.height;
		bitmap.alpha = 0;
		this.game.animationLayer2.addChild(bitmap);
		createjs.Tween.get(bitmap).to({ alpha: 1 }, 300).to({ alpha: 0 }, 300).call(GameUtil.removeSelfCallback, [bitmap]);
	}

	showBombNumAnimation(x: number, y: number, n: number, delay: number)
	{
		let digits = BOMB_NUM_IMAGES.map(x => x.result);
		if (digits.some(x => !x)) return;
		let bitmaps = GameUtil.createDigitBitmap(n, digits, false);
		if (bitmaps.length > 0)
		{
			let cc = new createjs.Container();
			for (let x of bitmaps) cc.addChild(x);
			cc.x = x;
			cc.y = y + bitmaps[0].image.height / 2;
			this.game.animationLayer.addChild(cc);
			let t = createjs.Tween.get(cc);
			if (delay > 0)
			{
				cc.visible = false;
				t.wait(delay * 1000).set({ visible: true });
			}
			t.wait(500).to({ alpha: 0 }, 1000).call(GameUtil.removeSelfCallback, [cc]);
		}
	}

	clear()
	{
		this.stopFeverEffect();
		if (this._feverScoreTween)
		{
			this._feverScoreTween.setPaused(true);
			this._feverScoreTween = null;
		}
	}

	showStartFever()
	{
		if (!START_FEVER_IMAGE.result) return;
		var image = START_FEVER_IMAGE.result;
		var bitmap = new createjs.Bitmap(image);
		bitmap.set({
			regX: image.width / 2,
			regY: image.height / 2,
			x: 320,
			y: 300,
			scaleX: 0,
			scaleY: 0
		});

		this.game.animationLayer3.addChild(bitmap);

		createjs.Tween.get(bitmap).to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.elasticOut).wait(500).call(GameUtil.removeSelfCallback, [bitmap]);
	}

	showTimeOver()
	{
		if (!TIME_OVER_IMAGE.result) return;
		var image = TIME_OVER_IMAGE.result;
		var bitmap = new createjs.Bitmap(image);
		bitmap.set({
			regX: image.width / 2,
			regY: image.height / 2,
			x: 320,
			y: 300,
			scaleX: 0,
			scaleY: 0
		});

		this.game.animationLayer3.addChild(bitmap);

		createjs.Tween.get(bitmap).to({ scaleX: 1, scaleY: 1 }, 800, createjs.Ease.elasticOut).wait(2000).call(GameUtil.removeSelfCallback, [bitmap]);
	}


	_bonusTimeBitmap: createjs.Bitmap;
	showBonusTime()
	{
		if (!BONUS_TIME_IMAGE.result) return;
		this.hideBonusTime();
		var image = BONUS_TIME_IMAGE.result;
		var bitmap = new createjs.Bitmap(image);
		bitmap.set({
			regX: image.width / 2,
			regY: image.height / 2,
			x: 320,
			y: 300,
			scaleX: 0,
			scaleY: 0
		});
		this._bonusTimeBitmap = bitmap;
		this.game.animationLayer3.addChild(bitmap);

		createjs.Tween.get(bitmap).wait(3500).to({ scaleX: 1, scaleY: 1 }, 800, createjs.Ease.elasticOut);
	}
	hideBonusTime()
	{
		if (this._bonusTimeBitmap)
		{
			this.game.animationLayer3.removeChild(this._bonusTimeBitmap);
			this._bonusTimeBitmap = null;
		}
	}
}

let CACHED_LINE_COUNT_IMAGES = new MiniImageLoader('images/Game/连线数量.png', image => util.cutRowImages(image, 11, res.GLOBAL_SCALE));
let SCORE_NUMBER = new MiniImageLoader('images/Game/连线结算数字.png', image => util.cutRowImages(image, 11, res.GLOBAL_SCALE));
let LINK_SHOW_IMAGES = [
	new MiniImageLoader('images/Game/good.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/verygood.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/great.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/excellent.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/won.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/fan.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
];
let ENERGY_FULL_EFFECT_IMAGE = new MiniImageLoader('images/Game/圆形范围指示器.png', image => util.scaleImage(image, res.GLOBAL_SCALE));
let BOMB_ANIM = new MiniImageLoader('images/Game/BombAnimation.png', image => util.cutRowImages(image, 16, res.GLOBAL_SCALE * 2));
let TIME_WARNING_MASK = new MiniImageLoader('images/Game/_0054_图层-7.png', image => image);
let BOMB_NUM_IMAGES = [
	new MiniImageLoader('images/Game/-_0000_0.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0001_1.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0002_2.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0003_3.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0004_4.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0005_5.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0006_6.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0007_7.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0008_8.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
	new MiniImageLoader('images/Game/-_0009_9.png', image => util.scaleImage(image, res.GLOBAL_SCALE)),
];

let START_FEVER_IMAGE = new MiniImageLoader("images/Game/狂热.png", image => image);
let TIME_OVER_IMAGE = new MiniImageLoader("images/Game/timeup.png", image => image);
let BONUS_TIME_IMAGE = new MiniImageLoader("images/Game/爆蛋阶段.png", image => image);
let FEVER_BONUS_IMAGE = new MiniImageLoader("images/Game/game_num_fever_txt.png", image => image);
function _INIT_MY_RES()
{
	CACHED_LINE_COUNT_IMAGES.init();
	SCORE_NUMBER.init();
	ENERGY_FULL_EFFECT_IMAGE.init();
	BOMB_ANIM.init();
	for (let x of LINK_SHOW_IMAGES) x.init();
	TIME_WARNING_MASK.init();
	for (let x of BOMB_NUM_IMAGES) x.init();
	START_FEVER_IMAGE.init();
	TIME_OVER_IMAGE.init();
	BONUS_TIME_IMAGE.init();
	FEVER_BONUS_IMAGE.init();
}


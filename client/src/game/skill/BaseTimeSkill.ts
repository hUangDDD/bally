import {IGameSkill, EmptySkill} from "./IGameSkill"
import {Game} from "../Game"
import {GraphicConstant as GC} from "../../resource"
import * as res from "../../resource"
import {HallUI} from "../../hall/HallUI"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
const ANIMATION_DURATION = 2;

export class BaseTimeSkill extends EmptySkill
{
	spr = new createjs.Container();
	bgSpr = new createjs.Container();
	protected duration = 4; //由子类设置，每次持续的时间
	protected game: Game;
	protected isStarted = false;
	protected remainTime = 0;

	protected blinkBitmap: createjs.Bitmap;
	protected blinkTween: createjs.Tween;


	protected _startTick: number;
	protected _effectTick: number;
	protected _iconBitmap = new createjs.Bitmap(null);
	protected _backgroundRotateBitmap = new createjs.Bitmap(null);
	protected _center = {
		x: GC.SCREEN_WIDTH / 2,
		y: GC.SCREEN_HEIGHT / 2 + 50 * res.GLOBAL_SCALE
	}
	protected _timeBox: TimeBox;
	protected _bgShape: createjs.Shape;
	init(game: any)
	{
		this.game = game;
		{
			let bitmap = this.blinkBitmap = new createjs.Bitmap(null);
			//bitmap.scaleX = GC.SCREEN_WIDTH / bitmap.image.width;
			//bitmap.scaleY = GC.SCREEN_HEIGHT / bitmap.image.height;
			bitmap.alpha = 0;
			bitmap.visible = false;
			this.spr.addChild(bitmap);
		}

		this.blinkTween = createjs.Tween.get(this.blinkBitmap, { loop: true, paused: true })
			.to({ alpha: 1 }, 500)
			.to({ alpha: 0 }, 500);

		this.spr.addChild(this._backgroundRotateBitmap);
		this.spr.addChild(this._iconBitmap);
		this.bgSpr.visible = false;
		this._bgShape = new createjs.Shape();
		this.bgSpr.addChild(this._bgShape);
	}

	clear()
	{
		this._stopSkill();
	}

	getSkillResource()
	{
		return [
			{ id: 'images/Skill/技能特效.png', src: 'images/Skill/技能特效.png' },
			{ id: 'time_skill_blink_bitmap', src: 'images/Game/_0054_图层-7.png' },
			{ id: 'time_skill_bg', src: 'images/Skill/game_skill_eff_donald.png' },
		];
	}

	update()
	{
		if (this.isStarted)
		{
			let tick = this.game.tick;
			//这里是起始放动画的时间
			if (tick < this._effectTick)
			{
				this._iconBitmap.visible = true;
				//中间旋转的东西 
				if (!this._backgroundRotateBitmap.image)
				{
					let bitmap = this._backgroundRotateBitmap;
					let image = bitmap.image = this.game.getImage('images/Skill/技能特效.png');
					bitmap.regX = image.width / 2;
					bitmap.regY = image.height / 2;
					bitmap.x = GC.SCREEN_WIDTH / 2;
					bitmap.y = GC.SCREEN_HEIGHT / 2;
					bitmap.scaleX = GC.SCREEN_HEIGHT / image.width * 1.45;
					bitmap.scaleY = GC.SCREEN_HEIGHT / image.height * 1.45;
					bitmap.compositeOperation = 'lighter';
				}
				this._backgroundRotateBitmap.visible = true;
				this._backgroundRotateBitmap.rotation += 2;
				this._updateIconBitmap();
				if (this._timeBox) this._timeBox.spr.visible = false;
			}
			//动画结束，启动技能
			else if (tick == this._effectTick)
			{
				this._iconBitmap.visible = false;
				this._backgroundRotateBitmap.visible = false;
				this.blinkBitmap.visible = true;
				this.blinkTween.setPaused(false);
				if (!this.blinkBitmap.image)
				{
					let image = this.blinkBitmap.image = this.game.getImage('time_skill_blink_bitmap');
					this.blinkBitmap.scaleX = GC.SCREEN_WIDTH / image.width;
					this.blinkBitmap.scaleY = GC.SCREEN_HEIGHT / image.height;
				}
				if (!this._timeBox)
				{
					this._timeBox = new TimeBox(this._iconBitmap.image, this.game.getImage('images/Game/skillbg1.png'), this.game.getImage('images/Game/skillbg2.png'));
					this._timeBox.spr.set({ x: 320, y: 172 });
					this.spr.addChild(this._timeBox.spr);
				}
				this._timeBox.spr.visible = true;
				this._timeBox.setPercent(1);
				this.start();
			}
			//技能持续的阶段
			if (tick >= this._effectTick)
			{
				this.remainTime -= this.game.getDeltaTime() / 1000;
				this._timeBox.setPercent(this.remainTime / this.duration);
				if (this.remainTime <= 0)
				{
					this._stopSkill();
				}
				this.bgSpr.visible = true;
				{
					let shape = this._bgShape;
					let g = shape.graphics;
					g.clear();
					var mtx = new createjs.Matrix2D();
					mtx.identity();
					mtx.translate(0, -tick * 2);
					g.beginBitmapFill(this.game.getImage('time_skill_bg'), null, mtx);
					g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
					g.endFill();
				}
			}
			else
			{
				this.bgSpr.visible = false;
			}
		}
		else
		{
			this.bgSpr.visible = false;
		}
	}

	isPreventUserInteract()
	{
		return this.isStarted && this.game.tick < this._effectTick;
	}

	isPreventPhysics()
	{
		return this.isStarted && this.game.tick < this._effectTick;
	}

	isPreventGameOver()
	{
		return this.isStarted && this.game.tick < this._effectTick;
	}

	isCasting()
	{
		return this.isStarted;
	}

	startSkill()
	{
		if (!this.isStarted)
		{
			this.spr.visible = true;
			this._startTick = this.game.tick;
			this._effectTick = this._startTick + ((ANIMATION_DURATION / GC.TICK_TIME) | 0);
			this.isStarted = true;
			this.remainTime = this.duration;

		}
		else
		{
			this.remainTime = this.duration;
		}
	}

	getMaxEnergy()
	{
		return 12;
	}
	triggerSkillEnd() { }

	private _stopSkill()
	{
		if (this.isStarted)
		{
			this.isStarted = false;
			this.blinkBitmap.visible = false;
			this.blinkTween.setPaused(true);
			this.stop();
			this.spr.visible = false;
		}
	}


	_updateIconBitmap()
	{
		let bitmap = this._iconBitmap;
		if (!bitmap.image)
		{

			let image = bitmap.image = HallUI.instance.getPetImage(this.game.mainPetId);
			if (image)
			{
				bitmap.regX = image.width / 2;
				bitmap.regY = image.height / 2;
				bitmap.scaleX = 3;
				bitmap.scaleY = 3;
			}
		}
		let p0 = res.POSITIONS.SKILL_BUTTON;
		let p1 = this._center;
		p1 = { x: p1.x, y: p1.y - 40 - 50 };
		let tick = this.game.tick - this._startTick;
		let tick2 = this._effectTick - this._startTick;
		let p = tick / tick2;
		if (p >= 1) p = 1;
		let EAMOUNT = 0.8;
		if (p <= 1 - EAMOUNT)
		{
			p = p / (1 - EAMOUNT);
			bitmap.x = p0.x + (p1.x - p0.x) * p;
			bitmap.y = p0.y + (p1.y - p0.y) * p;
		}
		else
		{
			let ease = createjs.Ease.getElasticOut(1.5, 0.3);
			p = 1 - (1 - p) / EAMOUNT;
			bitmap.x = p1.x;
			bitmap.y = p1.y + 40 * ease(p);
		}


	}

	//由子类重写 start() stop()总是保证对称调用的
	protected start()
	{

	}
	//由子类重写 start() stop()总是保证对称调用的
	protected stop()
	{

	}
}


class TimeBox
{
	spr = new createjs.Container();
	private _bitmap2: createjs.Bitmap;
	private _mask: createjs.Shape;

	constructor(petImage, bg1Image, bg2Image)
	{
		let bitmap1 = new createjs.Bitmap(bg1Image);
		bitmap1.regX = bg1Image.width / 2;
		bitmap1.regY = bg1Image.height / 2;
		this.spr.addChild(bitmap1);

		let bitmap2 = new createjs.Bitmap(bg2Image);
		bitmap2.regX = bg2Image.width / 2;
		bitmap2.regY = bg2Image.height / 2;
		this.spr.addChild(bitmap2);

		let icon = new createjs.Bitmap(petImage);
		icon.regX = petImage.width / 2;
		icon.regY = petImage.height / 2;
		this.spr.addChild(icon);

		this._bitmap2 = bitmap2;
		this._mask = new createjs.Shape();
		bitmap2.mask = this._mask;
	}

	setPercent(pp)
	{
		if (pp < 0) pp = 0;
		else if (pp > 1) pp = 1;
		if (pp === 0)
		{
			this._bitmap2.visible = false;
		}
		else if (pp === 1)
		{
			this._bitmap2.visible = true;
			this._bitmap2.mask = null;
		}
		else
		{
			this._bitmap2.visible = true;
			this._bitmap2.mask = this._mask;
			let width = this._bitmap2.image.width;
			let height = this._bitmap2.image.height;
			let g = this._mask.graphics;
			g.clear();
			g.beginFill('white');
			let x = -width / 2;
			let y = -height / 2;
			g.drawRect(x, y + height * (1 - pp), width, height * pp);
			g.endFill();
		}
	}
}
///<reference path="../../../typings/tsd.d.ts"/>
import {IGameSkill} from "./IGameSkill"
import {Game} from "../Game"
import * as res from "../../resource"
import {HallUI} from "../../hall/HallUI"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
const GC = res.GraphicConstant;

//const SKILL_DURATION = 1.0;
export class BaseSkill implements IGameSkill
{
	spr = new createjs.Container();
	protected _SKILL_EFFECT_PERCENT = 2 / 3;
	protected _SKILL_DURATION = 3.0;
	//旋转的背景
	protected _backgroundRotateBitmap = new createjs.Bitmap(null);

	protected _iconBitmap = new createjs.Bitmap(null);
	protected _game: Game;
	protected _isStarted = false;
	protected _startTick = 0;
	protected _effectTick = 0;
	protected _endTick = 0;
	protected _center = {
		x: GC.SCREEN_WIDTH / 2,
		y: GC.SCREEN_HEIGHT / 2 + 50 * res.GLOBAL_SCALE
	}
	protected _energy = 12;
	constructor()
	{
		this.spr.visible = false;
		this.spr.addChild(this._backgroundRotateBitmap);
		this.spr.addChild(this._iconBitmap);
	}

	init(game)
	{
		this._game = game;
		let petid = -1;
		try { petid = game._gameStartInfo.pets[0]; } catch (e) { }
		if (PetSkillDesc[petid])
		{
			this._energy = PetSkillDesc[petid].energy;
		}
	}

	clear()
	{

	}

	getSkillResource()
	{
		return [
			{ id: 'images/Skill/技能特效.png', src: 'images/Skill/技能特效.png' }
		];
	}

	update()
	{
		if (this._isStarted)
		{
			this._updateIconBitmap();
			this._backgroundRotateBitmap.rotation += 2;
			this._backgroundRotateBitmap.visible = this._game.tick < this._effectTick;
			if (this._game.tick == this._effectTick)
			{

				this._takeEffect();
			}
		}
		if (this._isStarted && this._game.tick >= this._endTick)
		{
			this.spr.visible = false;
			this._applySkillEffect();
			this._isStarted = false;
		}
	}

	_updateIconBitmap()
	{
		let bitmap = this._iconBitmap;
		if (!bitmap.image)
		{

			let image = bitmap.image = HallUI.instance.getPetImage(this._game.mainPetId);
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
		let tick = this._game.tick - this._startTick;
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

		bitmap.visible = p < 1;
	}

	isPreventUserInteract()
	{
		return this.isCasting();
	}
	isPreventPhysics()
	{
		return this.isCasting();
	}

	isCasting()
	{
		return this._isStarted;
	}

	isPreventGameOver()
	{
		return this.isCasting();
	}

	startSkill()
	{
		if (!this._isStarted)
		{
			this._isStarted = true;
			this._startTick = this._game.tick;
			this._effectTick = this._game.tick + (this._SKILL_DURATION * this._SKILL_EFFECT_PERCENT / res.GraphicConstant.TICK_TIME) | 0;
			this._endTick = this._game.tick + (this._SKILL_DURATION / res.GraphicConstant.TICK_TIME) | 0;

			//中间旋转的东西 
			if (!this._backgroundRotateBitmap.image)
			{
				let bitmap = this._backgroundRotateBitmap;
				let image = bitmap.image = this._game.getImage('images/Skill/技能特效.png');
				bitmap.regX = image.width / 2;
				bitmap.regY = image.height / 2;
				bitmap.x = GC.SCREEN_WIDTH / 2;
				bitmap.y = GC.SCREEN_HEIGHT / 2;
				bitmap.scaleX = GC.SCREEN_HEIGHT / image.width * 1.45;
				bitmap.scaleY = GC.SCREEN_HEIGHT / image.height * 1.45;
				bitmap.compositeOperation = 'lighter';
			}
			this.spr.visible = true;
		}
	}

	//在中间的那一帧调用
	protected _takeEffect()
	{

	}
	//在最后调用的
	protected _applySkillEffect()
	{

	}

	getMaxEnergy() { return this._energy; }
	triggerSkillEnd() { }
	triggerClick(pt) { }
}
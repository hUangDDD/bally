import {BaseSkill} from "./BaseSkill"
import {Ball} from "../Ball"
export {Ball} from "../Ball"
export class BaseTransformBallSkill extends BaseSkill
{
	constructor()
	{
		super();
		this._SKILL_EFFECT_PERCENT = 2 / 4;
		this._SKILL_DURATION = 4.0;
	}

	getSkillResource()
	{
		let ret = super.getSkillResource()
		ret = ret.concat([
			{ id: 'skill_ball_indicator', src: 'images/Skill/game_skill_eff_piglet_03.png' },
			{ id: 'skill_ball_indicator_white', src: 'images/Skill/game_skill_eff_piglet_04.png' },
		]);
		return ret;
	}

	update()
	{
		super.update();
		if (this._isStarted)
		{
			let tick = this._game.tick - this._startTick;
			let effectTick = this._effectTick - this._startTick;
			if (tick >= effectTick)
			{
				let pp = (tick - effectTick) / (this._endTick - this._effectTick);
				pp *= 4;//这里加速一下，随便调整一下
				if (pp > 1) pp = 1;
				this.showIndicatorEffect(pp);
			}
		}
		else
		{
			this.hideIndicatorEffect();
		}
	}

	protected _takeEffect()
	{
		let balls = this.getTransformBalls();
		this._createIndicatorEffect(balls);
		for (let ball of balls)
		{
			ball.skillHighlight = true;
			ball.noEnergy = true;
		}
	}

	protected _applySkillEffect()
	{
		let balls = [];

		for (let ball of this._game.balls)
		{
			if (ball.skillHighlight)
			{
				ball.skillHighlight = false;
				balls.push(ball);
			}
		}
		this._game.transformToMainColor(balls);
	}

	//下面三个需要在子类中重载
	protected getTransformBalls(): Ball[]
	{
		return []
	}

	private _createIndicatorEffect(balls: Ball[])
	{
		var image1 = this._game.getImage('skill_ball_indicator');
		var image2 = this._game.getImage('skill_ball_indicator_white');
		var spr = this.spr;
		for (let ball of balls)
		{
			var pos = ball.position;
			let bitmap1 = new createjs.Bitmap(image1);
			let bitmap2 = new createjs.Bitmap(image2);
			bitmap1.set({
				x: pos.x,
				y: pos.y,
				regX: image1.width / 2,
				regY: image1.height / 2,
			});
			bitmap2.set({
				x: pos.x,
				y: pos.y,
				regX: image2.width / 2,
				regY: image2.height / 2
			});
			spr.addChild(bitmap1);
			spr.addChild(bitmap2);
			createjs.Tween.get(bitmap1).to({ scaleX: 1.5, scaleY: 1.5 }, 700).to({ alpha: 0 }, 400);
			createjs.Tween.get(bitmap2).to({ alpha: 0, scaleX: 1.5, scaleY: 1.5 }, 700).wait(400).call(() =>
			{
				spr.removeChild(bitmap1);
				spr.removeChild(bitmap2);
			});
		}
	}

	protected showIndicatorEffect(percent: number)
	{

	}

	protected hideIndicatorEffect()
	{

	}
}
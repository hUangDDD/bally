import {BaseSkill} from "./BaseSkill"
import {Ball} from "../Ball"
export {Ball} from "../Ball"
export class BaseBombBallSkill extends BaseSkill
{
	protected _isBallNoEnergy = false; /**由子类设置，爆炸的球是不是没有能量的 */
	constructor()
	{
		super();
		this._SKILL_EFFECT_PERCENT = 0.8;
	}

	getSkillResource()
	{
		let ret = super.getSkillResource()

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
				if (pp > 1) pp = 1;
				this.showIndicatorEffect(pp);
			}
		}
		else
		{
			this.hideIndicatorEffect();
		}
	}
	protected _currentBombBalls:Ball[];
	protected _takeEffect()
	{
		let balls = this.getBombBalls();
		for(let ball of balls)
		{
			ball.skillHighlight = true;
			ball.noEnergy = this._isBallNoEnergy;
		}

		//let balls: Ball[] = [];
		balls = [];
		for (let ball of this._game.balls)
		{
			if (ball.skillHighlight)
			{
				ball.skillHighlight = false;
				if (!ball.isBomb && ball.status === 'normal')
				{
					balls.push(ball);
				}
			}
		}
		this._game.bombTheBalls(balls);
		for (let ball of balls)
		{
			ball.bombTick += 40 * 0.3;
		}
		this._currentBombBalls = balls;
	}

	protected _applySkillEffect()
	{
		/*
		let balls = [];
		for(let ball of this._game.balls)
		{
			if (ball.skillHighlight)
			{
				ball.skillHighlight = false;
				if (!ball.isBomb && ball.status === 'normal')
				{
					balls.push(ball);
				}
			}
		}
		this._game.bombTheBalls(balls);
		*/
	}

	//下面三个需要在子类中重载
	protected getBombBalls(): Ball[]
	{
		return []
	}

	protected showIndicatorEffect(percent: number)
	{

	}

	protected hideIndicatorEffect()
	{

	}
}
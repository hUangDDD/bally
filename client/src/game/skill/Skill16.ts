import {BaseSkill} from "./BaseSkill"
import {Ball} from "../Ball"
import * as util from "../../util"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
export class Skill16 extends BaseSkill
{
	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[15];
		this._energy = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	//在中间的那一帧调用
	protected _takeEffect()
	{
		let color = util.randomChoose(this._game.BALL_RES).color;
		for (let ball of this._game.balls)
		{
			if (ball.color === color && !ball.isBomb && ball.status === 'normal')
			{
				ball.skillHighlight = true;
			}
		}
	}
	//在最后调用的
	protected _applySkillEffect()
	{
		let arr = [];
		for (let ball of this._game.balls)
		{
			if (ball.skillHighlight)
			{
				ball.skillHighlight = false;
				if (ball.status === 'normal' && !ball.isBomb)
				{
					arr.push(ball);
				}
			}
		}
		this._game.raiseUpBalls(arr);
	}
}
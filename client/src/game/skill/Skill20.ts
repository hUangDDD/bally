import {BaseSkill} from "./BaseSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//直接将狂热进度条充满。
export class Skill20 extends BaseSkill
{
	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[19];
		this._energy = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	//在中间的那一帧调用
	protected _takeEffect()
	{

	}
	//在最后调用的
	protected _applySkillEffect()
	{
		this._game.addToFullFever();
	}
}
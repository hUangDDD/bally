import {BaseTimeSkill} from "./BaseTimeSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
export class Skill15 extends BaseTimeSkill
{
	private backupMinLinkCount = 3;
	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[14];
		this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	start()
	{

		console.log('技能开始，子弹时间开始,持续时间:' + this.duration);
		this.game.setTimeScale(0.1);
	}

	stop()
	{

		console.log('技能结束，子弹时间结束');
		this.game.setTimeScale(1);
	}
}
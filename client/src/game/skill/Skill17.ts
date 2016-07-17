import {BaseTimeSkill} from "./BaseTimeSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
export class Skill17 extends BaseTimeSkill
{
	private backupMinLinkCount = 3;
	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[16];
		this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	start()
	{
		console.log('技能开始，金币翻倍开始,持续时间:' + this.duration);
		this.game.setCoinScale(2);
	}

	stop()
	{
		console.log('技能结束，金币翻倍结束');
		this.game.setCoinScale(1);
	}
}
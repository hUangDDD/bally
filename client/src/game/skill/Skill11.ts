import {BaseTimeSkill} from "./BaseTimeSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
export class Skill11 extends BaseTimeSkill
{
	private backupMinLinkCount = 3;
	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[10];
		this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	start()
	{
		this.backupMinLinkCount = this.game.minLinkCount;
		console.log('技能开始，连接数变成1')
		this.game.minLinkCount = 1;
	}

	stop()
	{
		this.game.minLinkCount = this.backupMinLinkCount;
		console.log('技能结束，连接数恢复成' + this.backupMinLinkCount);
	}
}

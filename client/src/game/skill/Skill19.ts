import {BaseTimeSkill} from "./BaseTimeSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
export class Skill19 extends BaseTimeSkill
{
	private backupMinLinkCount = 3;
	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[18];
		this.duration = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	start()
	{
		console.log('技能开始，乱炸,持续时间:' + this.duration);
		this.game.wantBombAsBomb = true;
	}

	stop()
	{
		console.log('技能结束，乱炸');
		this.game.wantBombAsBomb = false;
	}
}
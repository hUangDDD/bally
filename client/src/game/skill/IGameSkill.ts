

export interface IGameSkill
{
	spr: any;
	bgSpr?: any; //如果！=null，则把它放在ballrender后面作为背景
	init(game: any);
	/**清理 */
	clear();
	/**图像资源 */
	getSkillResource(): any[];
	update();
	/**是否要阻止用户的操作 */
	isPreventUserInteract();

	isPreventPhysics();

	isPreventGameOver();
	/**是否在释放中 */
	isCasting();
	/**释放技能 */
	startSkill();

	getMaxEnergy();
	//提示技能，game已经完成了某些事件，需要skill停止
	triggerSkillEnd();
	//提示技能，用户点击了一下
	triggerClick(pt);
}

export class EmptySkill implements IGameSkill
{
	spr: any;

	init(game: any) { }
	/**清理 */
	clear() { }
	/**图像资源 */
	getSkillResource(): any[] { return [] }
	update() { }
	/**是否要阻止用户的操作 */
	isPreventUserInteract() { return false; }

	isPreventPhysics() { return false; }

	isPreventGameOver() { return false; }
	/**是否在释放中 */
	isCasting() { return false; }
	/**释放技能 */
	startSkill() { }

	getMaxEnergy() { return 12; }

	triggerSkillEnd() { }

	triggerClick(pt) { }
}
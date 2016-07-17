//按照现在看来，所有日常任务都是可以在服务器端完成的。
//在一局游戏结束的时候，客户端发送所有一局游戏的统计数据就可以了。
//所有日常任务都是一个简单计数器。


export const MAX_DAILY_TASK = 3;//每天最多完成的每日任务
export type DAILY_TASK_TYPE =
	'game' | //完成 游戏局数
	'ball' |  //消除n个宠物
	'exp' |  //获得经验
	'bomb' | //引爆炸弹
	'skill' |//触发技能次数
	'coin' |//获得金币数量
	'fever'; //进入fever次数


export interface IDailyTask
{
	type: DAILY_TASK_TYPE;
	count: number;    //当前次数
	maxCount: number; //需要累计的次数
}

export const DailyTaskTemplate: IDailyTask[] = [
	{ type: 'game', maxCount: 12, count: 0 },
	{ type: 'ball', maxCount: 3200, count: 0 },
	{ type: 'exp', maxCount: 600, count: 0 },
	{ type: 'bomb', maxCount: 68, count: 0 },
	{ type: 'skill', maxCount: 28, count: 0 },
	{ type: 'coin', maxCount: 3200, count: 0 },
	{ type: 'fever', maxCount: 54, count: 0 },
];

export function getDailyTaskText(task: IDailyTask)
{
	let pre = '';
	let post = '';
	switch (task.type)
	{
		case 'game':
			pre = '完成';
			post = '局游戏';
			break;
		case 'ball':
			pre = '累计消除';
			post = '个宠物';
			break;
		case 'exp':
			pre = '累计获得';
			post = '经验';
			break;
		case 'bomb':
			pre = '累计引爆';
			post = '个炸弹';
			break;
		case 'skill':
			pre = '累计触发宠物技能';
			post = '次';
			break;
		case 'coin':
			pre = '累计获得';
			post = '金币';
			break;
		case 'fever':
			pre = '累计进入特殊时间';
			post = '次';
			break;
	}
	return `${pre} ${task.count}/${task.maxCount} ${post}`
}
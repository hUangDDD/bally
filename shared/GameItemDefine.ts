//游戏道具定义
//这个文件可能会在服务器端共享的

//1. 游戏结算分数增加10%
export const GAME_ITEM_ADD_SCORE = 'ADDSCORE';
//2. 随机增加金币数量10% --- 50%
export const GAME_ITEM_ADD_COIN = 'ADDCOIN';
//3. 宠物经验增加20%
export const GAME_ITEM_ADD_EXP = 'ADDEXP';

//4. 游戏时间增加(client only)
export const GAME_ITEM_ADD_TIME = 'ADDTIME'
//5. 爆炸点生成需求从7 -> 6(client only)
export const GAME_ITEM_DEC_BOMB_REQ = 'DECBOMBREQ';
//6. 棋子种类5变成4(client only)
export const GAME_ITEM_DEC_BALL_TYPE = 'DECBALLTYPE';

interface IGameItemDefine
{
	name: string;
	type: string;  /**游戏道具的类型 */
	price: number; /**道具的价格 */
	param1?: number;/**道具的参数1 */
	param2?: number;/**道具的参数2 */
}

export const GAME_ITEM_DEFINES: IGameItemDefine[] = [
	GAME_ITEM('增加分数', GAME_ITEM_ADD_SCORE, 500, 0.1),
	GAME_ITEM('增加金币', GAME_ITEM_ADD_COIN, 500, 0.1, 0.5),
	GAME_ITEM('增加经验', GAME_ITEM_ADD_EXP, 500, 0.2),
	GAME_ITEM('增加时间', GAME_ITEM_ADD_TIME, 1000, 10),
	GAME_ITEM('减少球数量', GAME_ITEM_DEC_BALL_TYPE, 1500),
	GAME_ITEM('减少炸弹需求', GAME_ITEM_DEC_BOMB_REQ, 1800)
];

/** 随机计算一个金币加成的倍率 */
export function calcGameItemAddCoinRate() 
{
	let define = [
		[35, 1.1], //35% => 1.1倍，下面以此类推
		[32, 1.3],
		[26, 1.5],
		[4, 2],
		[1, 2.5],
		[1, 5],
		[0.83, 6],
		[0.17, 51]
	];
	let count = define.length;
	let total = 0;
	for (let i = 0; i < count; ++i)
	{
		total += define[i][0];
	}
	let x = Math.random() * total;
	let ret = 1;
	for (let i = 0; i < count; ++i)
	{
		if (x < define[i][0])
		{
			ret = define[i][1];
			break;
		}
		x -= define[i][0];
	}
	return ret - 1;
}

/**helper function 来创建IGameItemDefine */
function GAME_ITEM(name: string, type: string, price: number, param1?, param2?): IGameItemDefine
{
	if (param1 === undefined) param1 = 0;
	if (param2 === undefined) param2 = 0;
	return { name, type, price, param1, param2 };
}
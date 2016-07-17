export const GLOBAL_SCALE = 1;
export const BOX2D = true;
export const BOX2D_SCALE = 4 / (1136 * GLOBAL_SCALE);
export const INV_BOX2D_SCALE = 1 / BOX2D_SCALE;

export function ToBox2DUnit(n: number): number
{
	return n * BOX2D_SCALE;
}

export function FromBox2DUnit(n: any): any
{
	return n * INV_BOX2D_SCALE;
}

const SCREEN_WIDTH = 640 * GLOBAL_SCALE;
const SCREEN_HEIGHT = 1136 * GLOBAL_SCALE;
const FPS = 30;
const TICK_TIME = 1 / FPS;
export const GraphicConstant = {
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	GLOBAL_SCALE,
	FPS,
	TICK_TIME
}

//底部弧形碰撞区域的坐标
export let BOTTOM_STATIC_CHAIN_POINT: { x: number, y: number }[] = [];
{
	let width = GraphicConstant.SCREEN_WIDTH;
	let y0 = (723 + 95) * GLOBAL_SCALE, y1 = (764 + 95) * GLOBAL_SCALE, y2 = (774 + 95) * GLOBAL_SCALE;
	y0 += 40 * GLOBAL_SCALE;
	y1 += 40 * GLOBAL_SCALE;
	y2 += 40 * GLOBAL_SCALE;
	let yy = [y0, y0, y1, y2, y1, y0, y0];
	let xx = [-10, 0, width / 4, width / 2, width / 4 * 3, width, width + 10];
	for (let i = 0; i < xx.length; ++i)
	{
		BOTTOM_STATIC_CHAIN_POINT.push({ x: xx[i], y: yy[i] });
	}
}

//一些公用的图形元素的位置坐标
export let POSITIONS = {
	SKILL_BUTTON: { x: 94, y: 1014 },   /**技能按钮的位置 */
	COIN_CENTER: { x: 333, y: 153 },    /**金币数字的中心 */
	SCORE_CENTER: { x: 321, y: 97 },   /**分数数字的中心 */
	FEVER_CENTER: { x: 336, y: 1019 },
	FEVER_SCORE_CENTER: { x: 319, y: 200 },
};

for (let key in POSITIONS)
{
	POSITIONS[key].x *= GLOBAL_SCALE;
	POSITIONS[key].y *= GLOBAL_SCALE;
}




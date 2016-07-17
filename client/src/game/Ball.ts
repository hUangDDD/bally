///<reference path="../../typings/tsd.d.ts"/>
import * as res from "../resource"
import {GameStage} from "../GameStage"
import {Game} from "./Game"
const GC = res.GraphicConstant;
const b2Vec2 = Box2D.Common.Math.b2Vec2;
type IBALL_DEFINE = {
	color: string;
	id: string;
	// imageAnchor?:{x:number,y:number};
	// image?:HTMLImageElement;
};

const DENSITY = 0.001;
const GLOBAL_SCALE = res.GLOBAL_SCALE;
const BALL_SCALE = 1;
const BALL_IMAGE_SCALE = 1.4;
const BALL_RADIUS = 45 * BALL_SCALE * GLOBAL_SCALE;

const BOMB_RADIUS = 50 * BALL_SCALE * GLOBAL_SCALE;

const IMAGE_CACHE_SIZE = 60 * GLOBAL_SCALE;
const IMAGE_CACHE_ANCHOR_X = IMAGE_CACHE_SIZE * GLOBAL_SCALE;
const IMAGE_CACHE_ANCHOR_Y = IMAGE_CACHE_SIZE * GLOBAL_SCALE;

export const BALL_BITMAP_RESAMPLE = 1;

let ballImageCache: { [id: string]: HTMLCanvasElement[] } = {

};

function rotationToIndex(rot)
{
	const MAX_ROT = 360;
	let i = rot;
	while (i < 0) i += MAX_ROT;
	while (i >= MAX_ROT) i -= MAX_ROT;
	i = (i + 0.5) | 0;
	if (i >= MAX_ROT) i = MAX_ROT - 1;
	return (i / 10) | 0;
}

function indexToRotation(i)
{
	return i * 10;
}
//清空图片缓存。除了在ids中制定的内容。
//每次游戏开始的时候，清空这一局游戏中用不到的缓存。节省内存.
export function clearImageCacheExcept(ids: string[]) 
{
	let keys = Object.keys(ballImageCache);
	for (let key of keys)
	{
		if (ids.indexOf(key) < 0)
		{
			delete ballImageCache[key];
		}
	}
}
export function cacheImageRotate(id: string, image: HTMLImageElement, anchorX, anchorY, rot) 
{
	let cacheArray: HTMLCanvasElement[];
	if (ballImageCache[id])
	{
		cacheArray = ballImageCache[id];
	}
	else
	{
		cacheArray = ballImageCache[id] = [];
	}
	let i = rotationToIndex(rot);
	if (cacheArray[i]) return false;
	// now cache it
	let container = new createjs.Container();
	let bitmap = new createjs.Bitmap(image);
	bitmap.regX = anchorX;
	bitmap.regY = anchorY;
	if (['bomb', 'bomb0', 'bomb1', 'bomb2', 'bomb3', 'bomb4', 'bomb5'].indexOf(id) >= 0)
	{
		bitmap.scaleX = GLOBAL_SCALE * BALL_SCALE * 1.0 * BALL_BITMAP_RESAMPLE;
		bitmap.scaleY = GLOBAL_SCALE * BALL_SCALE * 1.0 * BALL_BITMAP_RESAMPLE;
	}
	else
	{
		bitmap.scaleX = GLOBAL_SCALE * BALL_SCALE * BALL_IMAGE_SCALE * BALL_BITMAP_RESAMPLE;
		bitmap.scaleY = GLOBAL_SCALE * BALL_SCALE * BALL_IMAGE_SCALE * BALL_BITMAP_RESAMPLE;
	}

	bitmap.rotation = indexToRotation(i);
	container.addChild(bitmap);
	container.cache(-IMAGE_CACHE_SIZE * BALL_BITMAP_RESAMPLE, -IMAGE_CACHE_SIZE * BALL_BITMAP_RESAMPLE, IMAGE_CACHE_SIZE * 2 * BALL_BITMAP_RESAMPLE, IMAGE_CACHE_SIZE * 2 * BALL_BITMAP_RESAMPLE);
	cacheArray[i] = container.cacheCanvas as HTMLCanvasElement;
	return true;
}

function getImageRotated2(id, rot) 
{
	let i = rotationToIndex(rot);
	let image = ballImageCache[id][i];
	return image;
}

let g_BallId = 123;
export class Ball
{
	static MAX_RADIUS = 45 * GC.GLOBAL_SCALE;
	id = (g_BallId++).toString();
	bitmap: createjs.Bitmap;
	_game: Game;
	color: string;
	radius: number;
	linkCount: number = -1;/**是不是正在被连接中 */
	wantBecomeBomb = -1;//炸了以后是不是自己会变成炸弹
	noEnergy = false; /**如果是true，表示爆炸之后不会产生能量 */
	skillHighlight = false;/**由技能控制要求这个球，高亮起来 */
	bombSoundIndex = -1;/**爆炸用哪个声音，-1表示没声音 */
	bombAsBomb = false;/**如果是个普通球，在炸的时候是不是像炸弹一样会同时炸掉周围的球 */
	blink = false;/** 是否需要闪烁，由BallRenderer来实现闪烁的功能 */
	drawScale = 1; /**画的时候是不是需要缩放。对于特殊大球，除了物理上需要放大，画面上也需要放大 */
	get isLinking() { return this.linkCount >= 0 }

	status: "normal" | "linking" | "delay_bomb" | "bombed" = "normal";
	bombTick = 0;

	private _define: IBALL_DEFINE;
	private _dirty = true;
	private _sleep = false;
	private _position: { x: number, y: number };
	private _angle: number = 0;
	private _earPos: any[];
	private _earRadius: number;
	static fromBody(body: any): Ball
	{
		return body['_refBall'];
	}

	get position() { return this._position; }
	set position(val) { this._position = val; }
	get angle() { return this._angle; }
	set angle(val) { this._angle = val; }

	get isBomb()
	{
		let c = this.color;
		return ['bomb', 'bomb0', 'bomb1', 'bomb2', 'bomb3', 'bomb4', 'bomb5'].indexOf(c) >= 0;
	}
	constructor(game: Game, ballDefine: IBALL_DEFINE, x, y)
	{
		this._game = game;
		let define = this._define = ballDefine;
		this.radius = BALL_RADIUS;
		this.color = define.color;
		this._position = { x, y };

		this.bitmap = new createjs.Bitmap(null);
		this.bitmap.regX = IMAGE_CACHE_ANCHOR_X * BALL_BITMAP_RESAMPLE;
		this.bitmap.regY = IMAGE_CACHE_ANCHOR_Y * BALL_BITMAP_RESAMPLE;
		this.bitmap.scaleX = 1 / BALL_BITMAP_RESAMPLE;
		this.bitmap.scaleY = 1 / BALL_BITMAP_RESAMPLE;
		if (this.isBomb)
		{
			this.radius = BOMB_RADIUS;
		}

		// if (!this.isBomb && Math.random() < 0.01)
		// {
		// 	var SCALE = 1.5;
		// 	this.radius *= SCALE;
		// 	this.drawScale = SCALE;
		// }

		this._earRadius = 10 * res.GLOBAL_SCALE;
		if (!this.isBomb)
		{
			const deg = 110;
			const cos = Math.cos(deg * Math.PI / 180);
			const sin = Math.sin(deg * Math.PI / 180);
			const R = this.radius;
			this._earPos = [
				{
					x: R * sin,
					y: -R * cos
				},
				{
					x: -R * sin,
					y: -R * cos
				}
			];
		}
		else
		{
			this._earPos = [];
		}

		let createObj = {
			id: this.id,
			radius: this.radius,
			x: x,
			y: y,
			earPos: this._earPos,
			earRadius: this._earRadius,
			cmd: "addBall"
		};
		game.postMessage(createObj);
		this._position = { x, y };
	}

	getEarShape()
	{
		let ret = [];
		for (let cc of this._earPos)
		{
			let x = cc.x;
			let y = cc.y;
			let x2;
			let y2;

			let cos = Math.cos(this.angle);
			let sin = Math.sin(this.angle);
			x2 = x * cos - y * sin + this.position.x;
			y2 = x * sin + y * cos + this.position.y;
			ret.push({ x: x2, y: y2, r: this._earRadius });
		}
		return ret;
	}

	/**变换球的颜色。假定：不会变成炸弹，当前也不是炸弹，并且球的物理属性都是一样 */
	changeColor(define: IBALL_DEFINE)
	{
		this._define = define;
		this.color = define.color;
		let rotation = this.angle * 180 / Math.PI;
		this.bitmap.image = getImageRotated2(this._define.id, rotation);
	}

	getDefine()
	{
		return this._define;
	}

	update()
	{
		let rotation = this.angle * 180 / Math.PI;
		this.bitmap.image = getImageRotated2(this._define.id, rotation);
	}

	isOutOfSpace()
	{
		let pos = this.position;
		return pos.y > GC.SCREEN_HEIGHT || pos.x < 0 || pos.x > GC.SCREEN_WIDTH;
	}

	/**
	 * remove self
	 */
	remove()
	{
		this._game.postMessage({ cmd: 'delBall', id: this.id });
	}
	/**综合了所有条件的判断：当前球在爆炸的时候，能产生能量吗？ */
	canHasEnergy()
	{
		return !this.noEnergy && !this.isBomb && this.color == this._game.getMainBallDefine().color;
	}

	clear()
	{

	}
}

///<reference path="../../typings/tsd.d.ts"/>
import * as res from "../resource"
import {Ball} from "./Ball"
import {Game} from "./Game"
import * as util from "../util"
import {BALL_BITMAP_RESAMPLE} from "./Ball"
export class BallRenderer extends createjs.DisplayObject
{
	lineRenderer: any;
	maskRenderer: any;

	private _game: Game;
	private _blinkShowFlag = false; /**true 表示，闪烁的球要亮起来。每隔XXX毫秒切换一下，造成闪烁的效果 */
	private _blinkLastTime = 0;
	constructor(game: Game)
	{
		super();
		this._game = game;
		this.hitArea = new createjs.Shape();
		this.setBounds(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
		if (!COIN_IMAGE_RAW)
		{
			COIN_IMAGE_RAW = new Image();
			COIN_IMAGE_RAW.src = COIN_IMAGE_SRC;
			COIN_IMAGE_RAW.onload = () =>
			{
				COIN_IMAGE = util.scaleImage(COIN_IMAGE_RAW, res.GLOBAL_SCALE);
			}

			DOT_IMAGE_RAW = new Image();
			DOT_IMAGE_RAW.src = DOT_IMAGE_SRC;
			DOT_IMAGE_RAW.onload = () =>
			{
				DOT_IMAGE = util.scaleImage(DOT_IMAGE_RAW, res.GLOBAL_SCALE);
			};
		}
	}

	draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean)
	{
		if (!this.visible) return;
		if (Date.now() - this._blinkLastTime >= 500)
		{
			this._blinkLastTime = Date.now();
			this._blinkShowFlag = !this._blinkShowFlag;
		}
		let firstBomb = false;
		let isTimeOver = this._game["_isTimeOver"];
		let delayHighlight = isTimeOver && !!this.maskRenderer && this.maskRenderer.visible;
		var isBallHighlight = (ball: Ball) =>
		{
			let wantBlink = ball.blink || this._game.nextLinkIgnoreColor && !this._game['_isLinking'];
			let wantHighlight = ball.status == 'linking' || ball.status == 'delay_bomb' || ball.skillHighlight || (ball.isBomb && isTimeOver && firstBomb) || (wantBlink && this._blinkShowFlag);
			return wantHighlight;
		}

		var drawBall = (ball: Ball, highlight: boolean) => 
		{
			let pos = ball.position;
			let image = ball.bitmap.image;
			if (BALL_BITMAP_RESAMPLE === 1 && ball.drawScale === 1)
			{
				let x = (pos.x - ball.bitmap.regX + 0.5) | 0;
				let y = (pos.y - ball.bitmap.regY + 0.5) | 0;
				ctx.drawImage(image, x, y);
			}
			else
			{
				let invResample = 1 / BALL_BITMAP_RESAMPLE * ball.drawScale;
				let x = (pos.x - ball.bitmap.regX * invResample + 0.5) | 0;
				let y = (pos.y - ball.bitmap.regY * invResample + 0.5) | 0;
				ctx.drawImage(image, 0, 0, image.width, image.height, x, y, image.width * invResample, image.height * invResample);
			}
			if (highlight)
			{
				//if (ball.isBomb && isTimeOver) { firstBomb = false; }
				let canvas2: HTMLCanvasElement;
				if (0 && g_TempCanvas && g_TempCanvas.width == image.width && g_TempCanvas.height == image.height)
				{
					canvas2 = g_TempCanvas;
				}
				else
				{
					g_TempCanvas = canvas2 = document.createElement('canvas');
					canvas2.width = image.width;
					canvas2.height = image.height;
				}

				let ctx2 = canvas2.getContext('2d');
				ctx2.clearRect(0, 0, image.width, image.height);
				ctx2.drawImage(image, 0, 0);
				ctx2.globalCompositeOperation = 'source-atop';
				ctx2.fillStyle = 'rgba(200,200,200,0.8)';
				ctx2.fillRect(0, 0, image.width, image.height);
				if (BALL_BITMAP_RESAMPLE === 1 && ball.drawScale === 1)
				{
					let x = (pos.x - ball.bitmap.regX + 0.5) | 0;
					let y = (pos.y - ball.bitmap.regY + 0.5) | 0;
					ctx.drawImage(canvas2, x, y);
				}
				else
				{
					let invResample = 1 / BALL_BITMAP_RESAMPLE * ball.drawScale;
					let x = (pos.x - ball.bitmap.regX * invResample + 0.5) | 0;
					let y = (pos.y - ball.bitmap.regY * invResample + 0.5) | 0;
					ctx.drawImage(canvas2, 0, 0, image.width, image.height, x, y, image.width * invResample, image.height * invResample);
				}
			}
		}

		let balls = this._game.balls;
		if (balls)
		{
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			let isTimeOver = this._game["_isTimeOver"];
			let delayHighlightBalls = [];
			for (let i = 0; i < balls.length; ++i)
			{
				let ball = balls[i];
				if (ball.status != 'bombed' && ball.bitmap.image)
				{
					let highlight = isBallHighlight(ball);
					if (highlight)
					{
						if (ball.isBomb && isTimeOver) firstBomb = false; //这个有点奇葩，就是为了在时间结束的时候高亮第一个炸弹
						if (delayHighlight)
						{
							delayHighlightBalls.push(ball);
						}
						else
						{
							drawBall(ball, true);
						}
					}
					else
					{
						drawBall(ball, false);
					}
				}
			}
			if (this.lineRenderer)
			{
				this.lineRenderer.draw(ctx);
			}

			for (let i = 0; i < balls.length; ++i)
			{
				let ball = balls[i];
				if (ball.status == 'linking' || ball.status == 'delay_bomb')
				{
					let pos = ball.position;
					if (ball.linkCount < 3)
					{
						if (DOT_IMAGE)
						{
							let x = (pos.x - DOT_IMAGE.width / 2) | 0;
							let y = (pos.y - DOT_IMAGE.height / 2) | 0;
							ctx.drawImage(DOT_IMAGE, x, y);
						}
					}
					if (ball.linkCount >= 3)
					{
						if (COIN_IMAGE)
						{
							let x = (pos.x - COIN_IMAGE.width / 2) | 0;
							let y = (pos.y - COIN_IMAGE.height / 2) | 0;
							ctx.drawImage(COIN_IMAGE, x, y);
						}
					}
				}
			}
			if (this.maskRenderer && this.maskRenderer.visible)
			{
				this.maskRenderer.draw(ctx);
			}
			if (delayHighlight)
			{

				for (var ball of delayHighlightBalls)
				{
					drawBall(ball, true);
				}
			}
		}
		return true;
	}
	isVisible() { return this.visible; }
}

const COIN_IMAGE_SRC = 'images/Game/金币icon.png';
const DOT_IMAGE_SRC = 'images/Game/连接点.png';
let COIN_IMAGE_RAW: HTMLImageElement;
let DOT_IMAGE_RAW: HTMLImageElement;
let COIN_IMAGE: HTMLCanvasElement;
let DOT_IMAGE: HTMLCanvasElement;

let g_TempCanvas: HTMLCanvasElement;
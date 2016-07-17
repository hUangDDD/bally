///<reference path="../../typings/tsd.d.ts"/>
import * as res from "../resource"
import {MiniImageLoader} from "../MiniImageLoader"
/**原图高度 */
const IMAGE_HEIGHT = 37;
/**原图左中右的宽度 */
const IMAGE_LEFT_WIDTH = 17;
const IMAGE_CENTER_WIDTH = 3;
const IMAGE_RIGHT_WIDTH = 17;
/**中间缩放部分的宽度 */
const DRAW_CENTER_WIDTH = 233;

export class FeverBar extends createjs.DisplayObject
{
	image = new MiniImageLoader('images/Game/Fever.png',image=>image);
	percent = 0;
	constructor()
	{
		super();
		this.x = 196 * res.GLOBAL_SCALE;
		this.y = 1000 * res.GLOBAL_SCALE;
		this.setBounds(0,0,res.GraphicConstant.SCREEN_WIDTH,res.GraphicConstant.SCREEN_HEIGHT);
		this.image.init();
	}
	
	set value(val){
		if (val < 0) val = 0;
		else if (val > 1) val = 1; 
		this.percent = val;
	}
	get value(){return this.percent;}
	
	draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean)
	{
		if (!this.isVisible) return false;
		if (this.percent <= 0) return false;
		if (!this.image.result) return false;
		const image = this.image.result;
		const SCALE = res.GLOBAL_SCALE;
		const DRAW_HEIGHT = (IMAGE_HEIGHT * SCALE) |0;
		let x = this.x|0;
		let y = this.y|0;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		//draw left
		{
			let DRAW_WIDTH = (IMAGE_LEFT_WIDTH * SCALE)|0;
			ctx.drawImage(image,0,0,IMAGE_LEFT_WIDTH,IMAGE_HEIGHT,x,y,DRAW_WIDTH,DRAW_HEIGHT);
			x += DRAW_WIDTH;
		}
		//draw center
		{
			let DRAW_WIDTH = (DRAW_CENTER_WIDTH * this.percent * SCALE)|0;
			ctx.drawImage(image,IMAGE_LEFT_WIDTH,0,IMAGE_CENTER_WIDTH,IMAGE_HEIGHT,x,y,DRAW_WIDTH,DRAW_HEIGHT);
			x += DRAW_WIDTH;
		}
		//draw right
		{
			let DRAW_WIDTH = (IMAGE_RIGHT_WIDTH * SCALE)|0;
			ctx.drawImage(image,IMAGE_LEFT_WIDTH + IMAGE_CENTER_WIDTH,0,IMAGE_RIGHT_WIDTH,IMAGE_HEIGHT,x,y,DRAW_WIDTH,DRAW_HEIGHT);
			x += DRAW_WIDTH;
		}
		return true;
	}
	isVisible(){return this.visible;}
}
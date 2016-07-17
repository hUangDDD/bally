import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
export class PaymentMask
{
	spr = new createjs.Container()
	constructor()
	{
		let bgMask = new createjs.Shape();
		let g = bgMask.graphics;
		g.beginFill('rgba(0,0,0,0.8)');
		g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
		g.endFill();
		this.spr.addChild(bgMask);
		bgMask.addEventListener('mousedown', () => { });


		let text = new createjs.Text('请稍等...', '60px SimHei', 'white');
		text.x = 320;
		text.y = 480;
		text.textAlign = 'center';
		this.spr.addChild(text);
		this.spr.visible = false;
	}
}
import {HallUI} from "../HallUI"
import * as res from "../../resource"
import {ImageButton} from "../../ImageButton"

export class Need10sDialog
{
	spr = new createjs.Container();
	constructor(onOk, onCancel)
	{
		var mask = new createjs.Shape();
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.85)');
			g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
			g.endFill();
		}
		mask.on('mousedown', () => { });
		this.spr.addChild(mask);

		var bg = new createjs.Bitmap(HallUI.getImage('hall/+10s_dlg_bg'));
		bg.set({ x: 29, y: 232 });
		this.spr.addChild(bg);

		var okbtn = new ImageButton(HallUI.getImage('hall/+10s_dlg_btn'));
		okbtn.set({ x: 325, y: 662 });
		this.spr.addChild(okbtn);
		okbtn.onClick = () =>
		{
			if (onOk) onOk();
		}
		var cancel_btn = new ImageButton(HallUI.getImage('hall/+10s_dlg_cancel_btn'));
		cancel_btn.set({ x: 81, y: 278 });
		this.spr.addChild(cancel_btn);
		cancel_btn.onClick = () =>
		{
			if (onCancel) onCancel();
		}
	}
	close()
	{
		if (this.spr.parent)
		{
			this.spr.parent.removeChild(this.spr);
		}
	}
}
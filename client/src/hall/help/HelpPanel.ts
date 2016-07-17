import {HallUI} from "../HallUI"
import * as res from "../../resource"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
const GC = res.GraphicConstant;
/*
export class HelpPanel
{
	spr = new createjs.Container();
	constructor()
	{
		var image = HallUI.getImage('hall/help_image');
		var bitmap = new createjs.Bitmap(image);
		this.spr.addChild(bitmap);
		let maskCanvas = document.createElement('canvas');
		maskCanvas.width = GC.SCREEN_WIDTH;
		maskCanvas.height = GC.SCREEN_HEIGHT;
		let ctx = maskCanvas.getContext('2d');

		ctx.fillStyle = `rgba(0,0,0,0)`;
		ctx.fillRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);

		ctx.fillStyle = 'rgba(0,0,0,0.01)';
		ctx.beginPath();
		ctx.rect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);

		//draw rect
		let x, y, width, height;
		x = 57; y = 845; width = 101; height = 92;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.arc(x + width, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
		ctx.lineTo(x, y + height);
		ctx.arc(x, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
		ctx.closePath();

		x = 488; y = 845; width = 101; height = 92;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.arc(x + width, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
		ctx.lineTo(x, y + height);
		ctx.arc(x, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
		ctx.closePath();

		x = 263; y = 835; width = 118; height = 111;
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.arc(x + width, y + height / 2, height / 2, -Math.PI / 2, Math.PI / 2);
		ctx.lineTo(x, y + height);
		ctx.arc(x, y + height / 2, height / 2, Math.PI / 2, -Math.PI / 2);
		ctx.closePath();
		ctx.fill('evenodd');
		var mask = new createjs.Bitmap(maskCanvas);
		this.spr.addChild(mask);
		mask.addEventListener('mousedown', () => { this.show(false) });

		var tutorial_button = new ImageButton(HallUI.getImage('hall/help_tutorial_button'));
		this.spr.addChild(tutorial_button);
		tutorial_button.set({ x: 547, y: 48 });
		tutorial_button.onClick = () =>
		{
			GameLink.instance.sendPacket({ cmd: 'reqTutorialPlay' });
			this.show(false);
		};

		this.spr.visible = false;
	}
	show(isshow)
	{
		this.spr.visible = isshow;
	}
}*/
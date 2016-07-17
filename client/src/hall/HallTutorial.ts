import {HallUI} from "./HallUI"
import * as res from "../resource"
const GC = res.GraphicConstant;

const define = [
	{ x: 110, y: 738, text: '冒险界面可以领取任\n务从而获得大量奖励。\n点击右边的果冻可以\n选择携带的果冻。' },
	{ x: 110, y: 738, text: '引导结束，由于您出\n色完成了引导，赠送\n您10颗爱心。前往冒\n险界面开始您的冒险\n吧！' },
];

export class HallTutorial
{
	spr = new createjs.Container();
	private petIcon: createjs.Bitmap;
	private petTextFrame: createjs.Bitmap;
	private petText: createjs.Text;
	private stepIndex = 0;
	private hasGift;
	constructor(hasGift)
	{
		this.hasGift = hasGift;
		this.spr.addEventListener('click', () => { this.onClick(); });
		let maskCanvas = document.createElement('canvas');
		maskCanvas.width = GC.SCREEN_WIDTH;
		maskCanvas.height = GC.SCREEN_HEIGHT;
		let ctx = maskCanvas.getContext('2d');

		ctx.fillStyle = `rgba(0,0,0,0.01)`;
		ctx.fillRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);

		ctx.fillStyle = 'rgba(0,0,0,0.6)';
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
		this.spr.addChild(new createjs.Bitmap(maskCanvas));
		this._showPet();
	}

	onClick()
	{
		if (this.stepIndex == 0)
		{
			this.stepIndex = 1;
			this._showPet();
		}
		else if (this.stepIndex == 1)
		{
			if (this.hasGift)
			{
				this._playHeartAnimation();
			}
			this._remove();
		}
	}
	private _showPet()
	{
		let d = define[this.stepIndex];
		this._setPet(d.x, d.y, d.text);
	}
	//设置宠物说话。
	private _setPet(x: number, y: number, text: string)
	{
		if (!this.petIcon)
		{
			this.petIcon = new createjs.Bitmap(HallUI.getImage('tutorial/pet'));
			this.petIcon.regX = this.petIcon.image.width / 2;
			this.petIcon.regY = this.petIcon.image.height / 2;

			this.petTextFrame = new createjs.Bitmap(HallUI.getImage('tutorial/frame'));

			this.petText = new createjs.Text('', '22px SimHei', 'white');
			this.petText.lineHeight = 22;

			this.spr.addChild(this.petIcon);
			this.spr.addChild(this.petTextFrame);
			this.spr.addChild(this.petText);
		}
		this.petIcon.x = x;
		this.petIcon.y = y;
		this.petTextFrame.x = x + 25;
		this.petTextFrame.y = y - 180;
		this.petText.x = x + 30;
		this.petText.y = y - 176;
		this.petText.text = text;

		this.petIcon.visible = true;
		this.petText.visible = true;
		this.petTextFrame.visible = true;
	}
	private _remove()
	{
		if (this.spr.parent)
		{
			this.spr.parent.removeChild(this.spr);
		}
	}

	private _playHeartAnimation()
	{
		let spr = HallUI.instance.spr;
		let image = HallUI.getImage('hall/weekly_task_prize2');
		let to = { x: 446, y: 144 };
		let from = { x: 337, y: 707 };
		for (let i = 0; i < 10; ++i)
		{
			let bitmap = new createjs.Bitmap(image);
			bitmap.regX = image.width / 2;
			bitmap.regY = image.height / 2;
			bitmap.set(from);
			spr.addChild(bitmap);
			createjs.Tween.get(bitmap).wait(i * 60).to(to, 600, createjs.Ease.cubicInOut).call(x =>
			{
				bitmap.parent.removeChild(bitmap);
			});
		}
	}
}
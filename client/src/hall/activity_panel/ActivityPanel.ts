import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"
import * as main from "../../main"
export class ActivityPanel
{
	spr = new createjs.Container();
	private _inited = false;
	private _iframe: HTMLIFrameElement;
	private _iframe_holder: HTMLDivElement;
	constructor()
	{
		const ADD = 110;
		//black mask
		{
			let bgMask = new createjs.Shape();
			let g = bgMask.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
			this.spr.addChild(bgMask);
			bgMask.addEventListener('mousedown', () => { });
		}

		//background
		{
			let bg = new createjs.Bitmap(HallUI.getImage('hall/panel_background'));
			bg.set({ x: 35, y: 89 + ADD });
			this.spr.addChild(bg);
		}

		{
			let title = new createjs.Bitmap(HallUI.getImage('hall/activity_title'));

			title.set({ x: 320, y: 300, regX: title.image.width / 2 });
			this.spr.addChild(title);
		}

		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885 + ADD });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				this.show(false);
			}
		}
		this.spr.visible = false;
	}

	show(isshow)
	{
		if (isshow && !this._inited)
		{
			this.init();
			this._inited = true;
		}
		this.spr.visible = !!isshow;
		this._iframe_holder.style.display = this._iframe.style.display = isshow ? 'block' : 'none';
		if (isshow)
		{
			this._iframe.src = 'activity.html';
		}
		else
		{
			this._iframe.src = "about:blank";
		}
	}

	private init()
	{
		//如此复杂就是为了修复在ios上iframe的bug
		var holder = this._iframe_holder = main.createOverlayHtml('div') as HTMLDivElement;
		var iframe = this._iframe = document.createElement('iframe');
		$(holder).css({
			overflow: 'auto',
			'-webkit-overflow-scrolling': 'touch',
			border: '0',
			margin: '0',
			padding: '0'
		});

		iframe.style.backgroundColor = 'rgba(0,0,0,0)';
		$(iframe).css({
			width: '100%',
			height: '100%',
			border: '0',
			margin: '0',
			padding: '0'
		});
		holder.appendChild(iframe);
		main.addToTopLayer(holder);
		main.addResizeCallback(this.onScale.bind(this));
	}

	private onScale(scale: number)
	{
		var px = (x) => ((x * scale) | 0).toString() + 'px';
		var holder = this._iframe_holder;
		holder.style.left = px(60);
		holder.style.top = px(255 + 110);
		holder.style.width = px(524);
		holder.style.height = px(444);
		//holder.width = px(524);
		//holder.height = px(444);
		//iframe.style.border = '2px solid black';
	}
}
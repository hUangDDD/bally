import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"

interface INeedValueDialogConfig
{
	onOk?: Function;
	onCancel?: Function;
	noAutoClose?: boolean
}

export class DownloadAppConfirm
{
	spr = new createjs.Container();
	constructor(config: INeedValueDialogConfig)
	{
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
			bg.set({ x: 35, y: 89 + 110 });
			this.spr.addChild(bg);
		}
		//title
		{
			let image = HallUI.getImage('hall/dialog_title');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				x: 320, y: 210  + 110,
				regX: image.width / 2, regY: image.height / 2
			});
			this.spr.addChild(bitmap);
		}
		//text
		let text = '将游戏下载到手机轻松快捷进\n入游戏！初次下载游戏将获得\n20000金币奖励！';
		let text2 = new createjs.Text(text, '30px SimHei', '#142d3e');
		text2.set({ x: 100, y: 300 + 110, lineHeight: 30 });
		this.spr.addChild(text2);

		{
			let okButton = new ImageButton(HallUI.getImage('hall/mail/btngetmail'));
			okButton.set({ x: 320, y: 622 + 110 });
			okButton.onClick = () =>
			{
				if (config.onOk) config.onOk();
				if (!config.noAutoClose) this.close();
			}
			this.spr.addChild(okButton);
		}

		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885  + 140});
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				if (config.onCancel) config.onCancel();
				if (!config.noAutoClose) this.close();
			}
		}
	}
	close()
	{
		if (this.spr.parent) this.spr.parent.removeChild(this.spr)
	}
}
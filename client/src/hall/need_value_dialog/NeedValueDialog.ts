import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"

interface INeedValueDialogConfig
{
	type: 'coin' | 'diamond' | 'heart' | '+10s';
	hasValue: number;
	needValue: number;
	onOk?: Function;
	onCancel?: Function;
	noAutoClose?: boolean
}

export class NeedValueDialog
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
			bg.set({ x: 35, y: 89 });
			this.spr.addChild(bg);
		}
		//title
		{
			let image = config.type === '+10s' ? HallUI.getImage('hall/+10s_dialog_title') : HallUI.getImage('hall/dialog_title');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				x: 320, y: 210,
				regX: image.width / 2, regY: image.height / 2
			});
			this.spr.addChild(bitmap);
		}
		//text
		{
			/*let image;
			let mmm = {
				'coin': 'hall/want_more_coin',
				'diamond': 'hall/want_more_diamond',
				'heart': 'hall/want_more_heart',
				'+10s': 'hall/want_10s'
			};*/
			let ttt = {
				'coin': '没有足够的金币！',
				'diamond': '没有足够的钻石！',
				'heart': '没有足够的体力！',
			};

			let text = new createjs.Text(ttt[config.type], '30px SimHei', '#142d3e');
			text.set({ x: 320, y: 348, textAlign: 'center' });
			this.spr.addChild(text);
			/*
						image = HallUI.getImage(mmm[config.type]);
						if (image)
						{
							let bitmap = new createjs.Bitmap(image);
							bitmap.set({
								x: 320, y: 348,
								regX: image.width / 2, regY: image.height / 2
							});
							this.spr.addChild(bitmap);
						}
			*/
		}
		//value panel
		{
			if (config.type !== 'heart')
			{
				//let bitmap = new createjs.Bitmap(HallUI.getImage(
				//	(config.type === 'diamond' || config.type === '+10s') ? 'hall/NeedMoreValueDialog_item_diamond' : 'hall/NeedMoreValueDialog_item_coin'
				//));

				//bitmap.set({ x: 143, y: 408 });
				//this.spr.addChild(bitmap);

				let text1 = new createjs.Text('拥有：','30px SimHei','#142d3e');
				text1.set({x:200,y:424});
				this.spr.addChild(text1);

				let text2 = new createjs.Text('需要：','30px SimHei','#142d3e');
				text2.set({x:200,y:495});
				this.spr.addChild(text2);

				let hasText = new createjs.Text(config.hasValue + '', '23px SimHei', 'white');
				hasText.set({
					x: 346, y: 424,
					textAlign: 'center'
				});
				this.spr.addChild(hasText);

				let needText = new createjs.Text(config.needValue + '', '23px SimHei', 'white');
				needText.set({
					x: 346, y: 495,
					textAlign: 'center'
				});
				this.spr.addChild(needText);
			}
		}

		{
			let needButton = new ImageButton(HallUI.getImage('hall/payment/buy_button'));
			needButton.set({ x: 328, y: 622 });
			needButton.onClick = () =>
			{
				if (config.onOk) config.onOk();
				if (!config.noAutoClose) this.close();
			}
			this.spr.addChild(needButton);
		}

		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885 });
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
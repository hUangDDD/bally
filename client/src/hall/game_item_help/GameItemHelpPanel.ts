import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"
export class GameItemHelpPanel
{
	spr = new createjs.Container();
	constructor()
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

		{
			let bitmap = new createjs.Bitmap(HallUI.getImage('hall/game_item_help_title'));
			bitmap.set({ x: 240, y: 198 });
			this.spr.addChild(bitmap);
		}
		//text
		{
			let bitmap = new createjs.Bitmap(HallUI.getImage('hall/game_item_help_text'));
			bitmap.set({ x: 70, y: 261 });
			this.spr.addChild(bitmap);
		}

		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885 });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				if (this.spr.parent)
				{
					this.spr.parent.removeChild(this.spr);
				}
			}
		}
	}
}
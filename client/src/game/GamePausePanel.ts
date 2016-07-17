import {HallUI} from "../hall/HallUI"
import {ImageButton} from "../ImageButton"
import {GameStage} from "../GameStage";
import {GameLink} from "../GameLink"
import {SoundManager} from "../SoundManager"
import * as res from "../resource"
export class GamePausePanel
{
	spr = new createjs.Container();
	constructor(game)
	{
		{
			let bg = new createjs.Bitmap(HallUI.getImage('hall/dialog_bg'));
			bg.set({
				x: (res.GraphicConstant.SCREEN_WIDTH - bg.image.width) / 2,
				y: 212
			});
			this.spr.addChild(bg);
		}

		let pause_text = new createjs.Bitmap(game.getImage('pause_text'));
		pause_text.set({ x: 227, y: 369 });
		this.spr.addChild(pause_text);

		let title = new createjs.Bitmap(HallUI.getImage('hall/dialog_title'));
		title.x = (res.GraphicConstant.SCREEN_WIDTH - title.image.width) / 2;
		title.y = 76 + 212;
		this.spr.addChild(title);

		let btnok = new ImageButton(game.getImage('continue_button'));
		btnok.set({ x: 454, y: 511 });
		this.spr.addChild(btnok);

		let btncancel = new ImageButton(game.getImage('exit_button'));
		btncancel.set({ x: 202, y: 511 });
		this.spr.addChild(btncancel);

		btnok.onClick = () =>
		{
			game._resumeGame();
			this.hide();
		};
		btncancel.onClick = () =>
		{
			GameStage.instance.closeGame();
			GameLink.instance.sendCancelGame();
			SoundManager.playBg('bgMain');
			this.hide();
		};
	}

	show()
	{
		this.spr.visible = true;
	}

	hide()
	{
		this.spr.visible = false;
	}
}
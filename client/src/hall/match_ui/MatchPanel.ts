import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
import {MyInfoPanel} from "./MyInfoPanel"
import * as MatchRules from "../../../shared/MatchRules"

const BASE_POS = { x: 20, y: 263 };
export class MatchPanel
{
	spr = new createjs.Container();
	private button2Lock: createjs.DisplayObject;
	private button3Lock: createjs.DisplayObject;
	private myInfoPanel: MyInfoPanel;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.instance.getImage('hall/match_panel_background'));
		background.set(BASE_POS);
		this.spr.addChild(background);

		let title = new createjs.Bitmap(HallUI.getImage('hall/match_title_text'));
		title.set({ x: 227, y: 280 });
		this.spr.addChild(title);

		this.myInfoPanel = new MyInfoPanel();
		this.spr.addChild(this.myInfoPanel.spr);

		var button1 = new ImageButton(HallUI.getImage('hall/match/match_button1'));
		button1.set({ x: 325 - 180, y: 634 });
		this.spr.addChild(button1);

		var button2 = new ImageButton(HallUI.getImage('hall/match/match_button2'));
		button2.set({ x: 325, y: 634 });
		this.spr.addChild(button2);

		var button3 = new ImageButton(HallUI.getImage('hall/match/match_button3'));
		button3.set({ x: 325 + 180, y: 634 });
		this.spr.addChild(button3);

		addPriceText(button1, MatchRules.MATCH_PRICE['11'], MatchRules.MATCH_AWARD['11']);
		addPriceText(button2, MatchRules.MATCH_PRICE['44'], MatchRules.MATCH_AWARD['44']);
		addPriceText(button3, MatchRules.MATCH_PRICE['master'], MatchRules.MATCH_AWARD['master']);

		this.button2Lock = addButtonMask(button2, '分数首次达到\n250,000解锁');
		this.button3Lock = addButtonMask(button3, '分数首次达到\n750,000解锁');

		Object.defineProperty(this.button2Lock, 'visible', {
			get: () =>
			{
				var link = GameLink.instance;
				if (link && link.historicalHighScore >= MatchRules.MATCH_ENTER_SCORE["44"])
					return false;
				return true;
			}
		});

		Object.defineProperty(this.button3Lock, 'visible', {
			get: () =>
			{
				var link = GameLink.instance;
				if (link && link.historicalHighScore >= MatchRules.MATCH_ENTER_SCORE["master"])
					return false;
				return true;
			}
		});

		button1.onClick = () =>
		{
			GameLink.instance.sendEnterMatch("11");
		}
		button2.onClick = () =>
		{
			GameLink.instance.sendEnterMatch("44");
		}
		button3.onClick = () =>
		{
			GameLink.instance.sendEnterMatch("master");
		}

		function addButtonMask(button: ImageButton, text:string)
		{

			var lockmask = new createjs.Bitmap(HallUI.getImage('hall/match_button_lock_mask'));
			lockmask.set({
				regX: lockmask.image.width / 2,
				regY: lockmask.image.height / 2,
				x: 0, y: 0
			});

			//var locktext = new createjs.Bitmap(lockTextImage);
			//locktext.set({
			//	regX: lockTextImage.width / 2,
			//	regY: lockTextImage.height / 2,
			//	x: 0, y: 70
			//});

			var locktext = new createjs.Text(text,'24px SimHei','white');
			locktext.lineHeight = 24;
			locktext.y = 60;
			locktext.x = -70;

			var cc = new createjs.Container();
			cc.addChild(lockmask);
			cc.addChild(locktext);
			button.scaledContainer.addChild(cc);
			return cc;
		}

		function addPriceText(button: ImageButton, price1, price2)
		{
			var text1 = new createjs.Text(price1.toString(), '20px SimHei', 'white');
			text1.set({ x:-18, y: 35 });
			var text2 = new createjs.Text(price2.toString(), '20px SimHei', 'white');
			text2.set({ x: -18, y: 95 });
			button.addDisplayObject(text1);
			button.addDisplayObject(text2);
		}

	}

	show(isShow)
	{
		this.spr.visible = !!isShow;
	}
}
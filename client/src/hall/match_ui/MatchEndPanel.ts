import {HallUI} from "../HallUI"
import {GameLink} from "../../GameLink"
import * as FixSizeBitmap from "../../FixSizeBitmap"
import {BitmapText} from "../shared/BitmapText"
import * as util from "../../util"
import {ImageButton} from "../../ImageButton"
export class MatchEndPanel
{
	spr = new createjs.Container();
	constructor(obj: {
		win?: boolean,
		matchPlayerResultList: any[]
	})
	{
		let background = new createjs.Bitmap(HallUI.getImage('hall/match_end_background'));
		this.spr.addChild(background);

		let backpanel=new createjs.Bitmap(HallUI.getImage('hall/match_endpanel_background'));
		backpanel.set({x:74, y:284});
		this.spr.addChild(backpanel);

		let titleImage = HallUI.getImage(obj.win ? 'hall/match_end_win_text' : 'hall/match_end_loss_text');
		let title = new createjs.Bitmap(titleImage);
		title.set({
			x: 320,
			y: 245,
			regX: titleImage.width / 2,
		});
		this.spr.addChild(title);

		if (obj.matchPlayerResultList)
		{
			//for (var i = 0; i < obj.matchPlayerResultList.length; ++i)
			for (var i = 0; i < 4; ++i)
			{
				var ppp = this.createPlayerPanel(i, obj.matchPlayerResultList && obj.matchPlayerResultList[i]);
				ppp.set({ x: 60, y: 333 + i * 104 });
				this.spr.addChild(ppp);
				/*if (medals[i]) {
					var med =new createjs.Bitmap(HallUI.getImage(medals[i]));
					med.set({x:319, y:333 + i * 104});
					this.spr.addChild(med);
				}*/
			}
		}

		//buttons
		var returnButton = new ImageButton(HallUI.getImage('hall/return_button'));
		returnButton.set({ x: 199, y: 860 });
		this.spr.addChild(returnButton);

		var matchAgainButton = new ImageButton(HallUI.getImage('hall/match_end_match_again_button'));
		matchAgainButton.set({ x: 397, y: 860 });
		this.spr.addChild(matchAgainButton);

		returnButton.onClick = () =>
		{
			this.close();
			HallUI.instance._onClickBottomButton('match');
		}
		matchAgainButton.onClick = () =>
		{
			this.close();
			HallUI.instance._onClickBottomButton('match');
			var link = GameLink.instance;
			if (link.lastEnterMatch)
			{
				link.sendEnterMatch(link.lastEnterMatch);
			}
		};
	}


	private createPlayerPanel(index: number, p?: any)
	{
		var cc = new createjs.Container();
		var self = p && p.key === GameLink.instance.key;
		var background = new createjs.Bitmap(HallUI.getImage(self ? 'hall/match_end_my_panel' : 'hall/match_end_other_panel'));
		cc.addChild(background);


		if (p)
		{
			if (!self) {
				var addIcon =new ImageButton(HallUI.getImage('hall/add_friend'));
				addIcon.set({x:27, y:49});
				addIcon.onClick= () => {
					GameLink.instance.sendReqAddFriend(p);		
				}
				cc.addChild(addIcon);
			}
			//face
			var faceicon = new createjs.Bitmap(null);
			FixSizeBitmap.MakeSuitableSize(faceicon, 70, 70, HallUI.getImage('hall/default_user_headicon'));
			faceicon.hitArea = new createjs.Shape();
			faceicon.set({ x: 96, y: 51 });
			var facemask = new createjs.Shape();
			var g = facemask.graphics;
			g.beginFill('white');
			g.drawRoundRect(-35, -35, 70, 70, 10);
			g.endFill();
			facemask.x = faceicon.x;
			facemask.y = faceicon.y;
			faceicon.mask = facemask;

			if (p.faceurl)
			{
				let image = new Image();
				image.src = p.faceurl;
				faceicon.image = image;
			}
			cc.addChild(faceicon);
			//score title
			var scoreTitle=new createjs.Text('获得分数', '18px SimHei', '#00355b');
			scoreTitle.set({x:369, y:25});
			cc.addChild(scoreTitle);

			//score
			var scoreText = new BitmapText(BitmapText.buildCharDefines('0123456789,', HallUI.getImage('hall/match_end_score_chars'), 18, 30));
			scoreText.text = util.intToString(p.score | 0);
			scoreText.set({ x: 169, y: 58 });
			cc.addChild(scoreText);
			//name
			var nameText = new createjs.Text('', '25px SimHei', '00355b');
			nameText.set({ x: 169, y: 23 });
			nameText.text = p.nickname || '';
			cc.addChild(nameText);
			//coin bg
			var coinBg = new createjs.Bitmap(HallUI.getImage('hall/match_end_coin_bg'));
			coinBg.set({ x: 370, y: 52 });
			cc.addChild(coinBg);

			var coin = new createjs.Bitmap(HallUI.getImage('hall/match_end_coin'));
			coin.set({ x: 373, y: 43 });
			cc.addChild(coin);

			var coinText = new createjs.Text('', '15px SimHei', 'white');
			coinText.set({ x: 465, y: 62 });
			coinText.textAlign = 'right';
			cc.addChild(coinText);
			coinText.text = (p.coin | 0).toString();
			if (index >= 0 && index <= 2)
			{
				var medalImage = HallUI.getImage('hall/match_end_medal_' + index);
				var medal = new createjs.Bitmap(medalImage);
				medal.set({ x: 287, y: -3 });
				cc.addChild(medal);
			}
		}

		return cc;
	}

	close()
	{
		if (this.spr.parent)
		{
			this.spr.parent.removeChild(this.spr);
		}
	}
}
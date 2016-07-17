import {HallUI} from "../HallUI"
import {GameLink} from "../../GameLink"
import * as util from "../../util"
import * as FixSizeBitmap from "../../FixSizeBitmap"

export class MyInfoPanel
{
	spr = new createjs.Container();
	private _faceIcon: createjs.Bitmap;
	constructor()
	{
		this.spr.set({ x: 66, y: 364 });
		let background = new createjs.Bitmap(HallUI.instance.getImage('hall/match_myinfo_background'));
		this.spr.addChild(background);

		//let iconFrame = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_icon_background'));
		//iconFrame.set({ x: 33, y: 7 });
		//this.spr.addChild(iconFrame);

		var faceicon = this._faceIcon = new createjs.Bitmap(null);
		FixSizeBitmap.MakeSuitableSize(this._faceIcon, 70, 70, HallUI.getImage('hall/default_user_headicon'));
		this._faceIcon.set({ x: 33 + 5 + 58, y: 12 + 38 });
		this._faceIcon.mouseEnabled = false;
		this._faceIcon.hitArea = new createjs.Shape();
		var facemask = this._faceIcon.mask = new createjs.Shape();
		{
			let g = facemask.graphics;
			g.beginFill('white');
			g.drawRoundRect(faceicon.x - 35, faceicon.y - 35, 70, 70, 10);
			g.endFill();
		}

		this.spr.addChild(this._faceIcon);
		var faceurl = "";
		this._faceIcon.addEventListener('tick', () =>
		{
			if (GameLink.instance && GameLink.instance.faceurl !== faceurl)
			{
				faceurl = GameLink.instance.faceurl;
				if (faceurl)
				{
					var image = new Image();
					image.src = faceurl;
					this._faceIcon.image = image;
				}
				else
				{
					this._faceIcon.image = null;
				}

			}
		})

		//let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask'));
		//face_mask.set({
		//	x: 33, y: 7,
		//});

		//this.spr.addChild(face_mask);


		//texts
		var text1 = new createjs.Text('本周最高分', '25px SimHei', 'white');
		text1.set({ x: 149, y: 25 });
		this.spr.addChild(text1);

		var text2 = new createjs.Text('排名', '25px SimHei', 'white');
		text2.set({ x: 375, y: 25 });
		this.spr.addChild(text2);

		var score = new createjs.Text('', '25px SimHei', 'white');
		score.set({ x: 310, y: 63, textAlign: 'right' });
		this.spr.addChild(score);
		Object.defineProperty(score, 'text', {
			get: () =>
			{
				if (GameLink.instance) return (GameLink.instance.weekHighScore | 0).toString();
				return '';
			}
		});

		var rankPosition = new createjs.Text('', '25px SimHei', 'white');
		rankPosition.set({ x: 434, y: 63, textAlign: 'right' });
		this.spr.addChild(rankPosition);
		Object.defineProperty(rankPosition, 'text', {
			get: () =>
			{
				if (GameLink.instance && GameLink.instance.weekRankPosition > 0)
				{
					return GameLink.instance.weekRankPosition.toString();
				}
				return '';
			}
		});
	}
}
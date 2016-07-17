import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
import * as util from "../../util"
import * as GameUtil from "../../game/GameUtil"
import * as FixSizeBitmap from "../../FixSizeBitmap"
const ADD_TO_Y = 120;
export class FriendInfoPanel
{
	spr = new createjs.Container();
	key: string;
	private _textLines: createjs.Text[];
	private _nameText: createjs.Text;
	private _weekScoreText: createjs.Text;
	private _btnAddHeart: ImageButton;
	private _btnRemoveFriend: ImageButton;
	private _digits: any[];
	private _faceIcon: createjs.Bitmap;
	constructor()
	{
		this._digits = util.cutRowImages(HallUI.getImage('hall/week_score_number_digit'), 11);
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
			bg.set({ x: 35, y: 89 + ADD_TO_Y });
			this.spr.addChild(bg);
		}
		//head frame
		{
			//let frame = new createjs.Bitmap(HallUI.getImage('hall/friend_icon_background'));
			//frame.set({ x: 35 + 48, y: 89 + 161 + ADD_TO_Y });
			//this.spr.addChild(frame);
		}

		this._faceIcon = new createjs.Bitmap(null);
		FixSizeBitmap.MakeSuitableSize(this._faceIcon, 90, 90, HallUI.getImage('hall/default_user_headicon'));
		this._faceIcon.set({ x: 35 + 48 + 4 + 45, y: 89 + 161 + 3 + 45 + ADD_TO_Y });
		this._faceIcon.mouseEnabled = false;
		this._faceIcon.hitArea = new createjs.Shape();
		this.spr.addChild(this._faceIcon);

		var facemask = this._faceIcon.mask = new createjs.Shape();
		{
			let g = facemask.graphics;
			g.beginFill('white');
			g.drawRoundRect(this._faceIcon.x - 45, this._faceIcon.y - 45, 90, 90, 10);
			g.endFill();
		}

		//let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask2'));
		//face_mask.set({
		//	x: 35 + 48, y: 89 + 161 + ADD_TO_Y,
		//});
		//this.spr.addChild(face_mask);

		//title
		{
			let title = new createjs.Bitmap(HallUI.getImage('hall/friend_info_title'));
			title.set({ x: 239 + 35, y: 108 + 89 + ADD_TO_Y });
			this.spr.addChild(title);
		}
		//text bg
		{
			let bgbg = new createjs.Bitmap(HallUI.getImage('hall/friend_info_bg'));
			bgbg.set({ x: 35 + 47, y: 89 + 274 + ADD_TO_Y });
			this.spr.addChild(bgbg);
		}
		//text lines
		{
			this._textLines = [];
			for (let i = 0; i < 7; ++i)
			{
				let t = new createjs.Text('99998', '28px SimHei', 'white');
				t.x = 221 + 35;
				t.y = 273 + i * 38 + 89 + ADD_TO_Y;
				this._textLines.push(t);
				{
					/*let outline = t.clone();
					outline.color = 'white';
					outline.outline = 3;

					this.spr.addChild(outline);
					Object.defineProperty(outline, 'text', { get: () => t.text });
					*/
				}
				this.spr.addChild(t);
			}
		}
		//name text
		{
			let nameText = this._nameText = new createjs.Text('aaaa', '28px SimHei', 'white');
			nameText.x = 35 + 194;
			nameText.y = 89 + 17 + ADD_TO_Y + 160;

			{
			
			}
			this.spr.addChild(nameText);
		}
		{
			let weekScoreText = this._weekScoreText = new createjs.Text('9999', '28px Arial', 'white');
			weekScoreText.x = 35 + 194;
			weekScoreText.y = 89 + 221 + ADD_TO_Y;
			this.spr.addChild(weekScoreText);
		}

		//button
		{
			this._btnRemoveFriend = new ImageButton(HallUI.getImage('hall/btn_remove_friend'));
			this._btnRemoveFriend.set({ x: 35 + 145, y: 89 + 574 + ADD_TO_Y });
			this.spr.addChild(this._btnRemoveFriend);

			this._btnRemoveFriend.onClick = () =>
			{
				HallUI.instance.showConfirmDialog('是否确认解除好友关系', () =>
				{
					HallUI.instance.closeConfirmDialog();
					GameLink.instance.sendRemoveFriend(this.key);
					this.show(false);
				})
			}

			this._btnAddHeart = new ImageButton(HallUI.getImage('hall/btn_add_heart'));
			this._btnAddHeart.set({ x: 35 + 429, y: 89 + 574 + ADD_TO_Y });
			this.spr.addChild(this._btnAddHeart);

			this._btnAddHeart.onClick = () =>
			{
				GameLink.instance.sendFriendHeart(this.key);
				this.show(false);
			}

		}

		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885 + ADD_TO_Y });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				this.show(false);
			}
		}
		this.spr.visible = false;
	}

	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
	}
	//	_numbers: any[] = [];

	setInfo(obj)
	{
		if (obj.key === this.key)
		{
			this._textLines[0].text = obj.selPet;
			this._textLines[1].text = obj.highScore;
			this._textLines[2].text = obj.maxCombo;
			this._textLines[3].text = obj.maxLink;
			this._textLines[4].text = obj.petCount;
			this._textLines[5].text = obj.petTotalLevel;
			this._textLines[6].text = obj.totalKill;
			let name = obj.nickname;
			if (name.length > 12)
			{
				name = name.substr(0, 12) + "...";
			}
			this._nameText.text = name;
			this._weekScoreText.visible = true;
			this._weekScoreText.text = obj.weekScore;
			this._btnAddHeart.visible = !!obj.canSendHeart;
			this._btnRemoveFriend.visible = !!obj.showRemoveFriend;
			if (obj.faceurl)
			{
				this._faceIcon.visible = true;
				let image = new Image();
				image.src = obj.faceurl;
				this._faceIcon.image = image;
			}
			else
			{
				this._faceIcon.image = null;
				this._faceIcon.visible = true;
			}
			/*
						for (let x of this._numbers) this.spr.removeChild(x);
			
						this._numbers = GameUtil.createDigitBitmap(obj.weekScore, this._digits, true);
						if (this._numbers.length > 0)
						{
							let offset = -this._numbers[0].x;
							this._numbers[0].x = 0;
							for (let i = 1; i < this._numbers.length; ++i)
							{
								this._numbers[i].x += offset;
							}
						}
			
						for (let i = 0; i < this._numbers.length; ++i)
						{
							let item = this._numbers[i];
							item.x += 35 + 185;
							item.y += 89 + 221 + 36;
							this.spr.addChild(item);
						}
						*/
		}
	}

	clear()
	{
		this._nameText.text = '';
		this._weekScoreText.text = '';
		for (let t of this._textLines)
		{
			t.text = '';
		}
		this._btnAddHeart.visible = false;
		this._btnRemoveFriend.visible = false;
	}
}
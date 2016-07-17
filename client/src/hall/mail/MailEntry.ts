import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import {MakeSuitableSize} from "../../FixSizeBitmap"
import {GameLink} from "../../GameLink"
/*
	{ id: 'hall/weekly_task_prize0', src: 'images/hall/_0022_图层-42-副本-3.png' },//钻石
	{ id: 'hall/weekly_task_prize1', src: 'images/hall/_0046_图层-11.png' },//金币
	{ id: 'hall/weekly_task_prize2', src: 'images/hall/_0077_图层-28-副本-2.png' },//心
*/

export class MailEntry
{
	spr = new createjs.Container();
	width = 0;
	height = 0;
	id: any;
	private _icon: createjs.Bitmap;
	private _faceIcon: createjs.Bitmap;
	private _text: createjs.Text;
	private _timeText: createjs.Text;
	private _recvButton: ImageButton;
	private _agreeButton: ImageButton;
	private _rejectButton: ImageButton;
	constructor()
	{
		{
			let background = new createjs.Bitmap(HallUI.getImage('hall/mail/bkg'));
			this.width = background.image.width;
			this.height = background.image.height;
			this.spr.addChild(background);
		}

		{
			this._icon = new createjs.Bitmap(null);
			this._icon.set({ x: 58, y: 60 });
			this.spr.addChild(this._icon);
		}
		{
			this._faceIcon = new createjs.Bitmap(null);
			this._faceIcon.set({ x: 58, y: 60 });
			MakeSuitableSize(this._faceIcon, 60, 60, HallUI.getImage('hall/default_user_headicon'));
			this.spr.addChild(this._faceIcon);
			this._faceIcon.hitArea = new createjs.Shape();
		}

		{
			this._text = new createjs.Text('', '22px SimHei', '#142d3e');
			this._text.lineHeight = 22;
			this._text.set({ x: 113, y: 22 });
			this.spr.addChild(this._text);
		}

		{
			this._timeText = new createjs.Text('2009/1/2 1:3:4', '14px SimHei', '#142d3e');
			this._timeText.set({ x: 433, y: 88 });
			this._timeText.textAlign = 'center';
			this._timeText.lineHeight = 12;
			this.spr.addChild(this._timeText);
		}

		{
			let btn = new ImageButton(HallUI.getImage('hall/mail/btngetmail'));
			btn.set({ x: 433, y: 50 });
			btn.scaleX = btn.scaleY = 0.8;
			btn.onClick = () => this.onClickRecv();

			this.spr.addChild(btn);
			this._recvButton = btn;
		}

		{
			this._agreeButton = new ImageButton(HallUI.getImage('hall/agree_button'));
			this._agreeButton.set({ x: 473, y: 50 });
			this.spr.addChild(this._agreeButton);
			this._agreeButton.onClick = () => this.onClickRecv();
		}
		{
			this._rejectButton = new ImageButton(HallUI.getImage('hall/reject_button'));
			this._rejectButton.set({ x: 393, y: 50 });
			this.spr.addChild(this._rejectButton);
			this._rejectButton.onClick = () => this.onClickReject();
		}
	}
	onClickRecv()
	{
		GameLink.instance.sendReqRecvMail(this.id);
	}
	onClickReject()
	{
		GameLink.instance.sendReqRejectMail(this.id);
	}
	setContent(mail/*id, type: 'heart' | 'coin' | 'diamond', text: string, time: number*/)
	{
		this.id = mail.id;
		this._recvButton.visible = true;
		//set icon
		if (mail.type === 'addFriend')
		{
			this._faceIcon.visible = true;
			this._icon.visible = false;
			this._agreeButton.visible = true;
			this._rejectButton.visible = true;
			this._recvButton.visible = false;
			if (mail.fromKeyFace)
			{
				let img = this._faceIcon.image = new Image()
				img.src = mail.fromKeyFace;
			}
			else
			{
				this._faceIcon.image = null;
			}
		}
		else
		{
			this._agreeButton.visible = false;
			this._rejectButton.visible = false;
			this._recvButton.visible = true;
			this._faceIcon.visible = false;
			this._icon.visible = true;
			let imgid;
			switch (mail.type)
			{
				case 'heart':
					imgid = 'hall/new_weekly_task_prize2'
					break;
				case 'coin':
					imgid = 'hall/new_weekly_task_prize0'
					break;
				case 'diamond':
					imgid = 'hall/new_weekly_task_prize1';
					break;
			}
			if (imgid)
			{
				this._icon.image = HallUI.getImage(imgid);
			}

			if (this._icon.image)
			{
				this._icon.set({
					regX: this._icon.image.width / 2,
					regY: this._icon.image.height / 2
				});
			}
		}

		//common things
		this._text.text = this._breakLineText(mail.text);
		let d = new Date(mail.time);
		d.setTime(mail.time);
		this._timeText.text = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
	}

	_breakLineText(text: string)
	{
		const WIDTH = 240;
		const CHAR_WIDTH = 22;
		let newText = '';
		let x = 0;
		for (let c of text)
		{
			let width = c.charCodeAt(0) <= 0xff ? CHAR_WIDTH / 2 : CHAR_WIDTH;
			if (x + width <= WIDTH)
			{
				x += width;
				newText += c;
			}
			else
			{
				x = width;
				newText += '\n' + c;
			}
		}
		return newText;
	}
}
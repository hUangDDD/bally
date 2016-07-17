import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"
import {VerticalScrollPanel} from "../shared/VerticalScrollPanel"
import {MailEntry} from "./MailEntry"
import {GameLink} from "../GameLink"
export class MailPanel
{
	spr = new createjs.Container();
	private _mailListPanel: VerticalScrollPanel;
	private _mailEntries: MailEntry[] = [];
	constructor()
	{
		const ADD_TO_Y = 110;
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
		//title text
		{
			let title = new createjs.Bitmap(HallUI.getImage('hall/mail/title'));
			title.set({ x: 260, y: 116 + ADD_TO_Y });
			this.spr.addChild(title);
		}

		{
			//let mail_text = new createjs.Bitmap(HallUI.getImage('hall/mail_text'));
			//mail_text.set({ x: 66, y: 710 + ADD_TO_Y });
			//this.spr.addChild(mail_text);
			let mail_text = new createjs.Text('邮箱只保留30天内的邮件，\n请及时接受邮件奖励', '27px SimHei', '#142d3e');
			mail_text.lineHeight = 30;
			mail_text.set({ x: 66, y: 710 + ADD_TO_Y });
			this.spr.addChild(mail_text);
		}

		//mail list panel
		{
			let panel = this._mailListPanel = new VerticalScrollPanel();
			//panel.setVisualizeMask(true);
			panel.setPos({ x: 44, y: 246 + ADD_TO_Y });
			panel.setSize(539, 440);
			this.spr.addChild(panel.spr);
		}
		//recv all button
		{
			let btn = new ImageButton(HallUI.getImage('hall/mail/btngetallmail'));
			btn.set({ x: 473, y: 740 + ADD_TO_Y });
			this.spr.addChild(btn);
			btn.onClick = () => this._onClickRecvAll();
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
		/*
				let mails = [];
				let tp = ['coin', 'heart', 'diamond']
				for (let i = 0; i < 10; ++i)
				{
					mails.push({
						type: tp[i % tp.length],
						text: 'aa邮件   fsfasfsf dsfads fsdf ds中文' + i,
						time: Date.now()
					});
				}
				mails[0].text = '一二三四五六七八九十，一二三四五六七八九十，一二三四五六七八九十';
				mails[1].text = '一1三四五2七八3十，一二三4五六5八九十，一二三四五六七八九十';
				mails[2].text = '一....2七八3十，一二三4五六5八九十，一二三四五六七八九十';
				this.setMails(mails);
		*/

	}
	show(isShow: boolean = true)
	{
		if (isShow && !this.isShowing())
		{
			GameLink.instance.sendReqMail();
		}
		this.spr.visible = isShow;
	}

	isShowing()
	{
		return !!this.spr.visible;
	}

	setMails(mails: any[])
	{
		let count = mails.length;
		while (count < this._mailEntries.length)
		{
			let entry = this._mailEntries.pop();
			this._mailListPanel.removeChild(entry.spr);
		}
		const HEIGHT = 112;
		const SPAN = 10;
		while (count > this._mailEntries.length)
		{
			let entry = new MailEntry();
			this._mailEntries.push(entry);
			let i = this._mailEntries.length;
			entry.spr.set({
				x: 10,
				y: (i - 1) * (HEIGHT + SPAN)
			});
			this._mailListPanel.addChild(entry.spr);
		}
		this._mailListPanel.contentHeight = count * (HEIGHT + SPAN);


		for (let i = 0; i < count; ++i)
		{
			let m = mails[i];
			this._mailEntries[i].setContent(m);
		}
	}


	private _onClickRecvAll()
	{
		GameLink.instance.sendReqRecvAllMail();
	}
}
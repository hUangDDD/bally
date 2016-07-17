import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import {VerticalScrollPanel} from "../shared/VerticalScrollPanel"
import {OneFriendEntry} from "./OneFriendEntry"
import {GameLink} from "../GameLink"
const FRIEND_ENTRY_X = 10;
const FRIEND_ENTRY_Y = 10;
const FRIEND_ENTRY_Y_GAP = 18;

export class RankListPanel
{
	spr = new createjs.Container();
	private _friendListPanel: VerticalScrollPanel;
	private _friendEntries: OneFriendEntry[] = [];
	constructor()
	{
		//black mask
		{
			let bgMask = new createjs.Shape();
			let g = bgMask.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, 640, 960);
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

		//title text
		{
			let title = new createjs.Bitmap(HallUI.getImage('hall/rank_list_panel_title'));
			title.set({ x: 320 - title.image.width / 2, y: 186 });
			this.spr.addChild(title);
		}
		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: 640 / 2, y: 885 });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				this.show(false);
			}
		}

		{
			this._friendListPanel = new VerticalScrollPanel();
			this._friendListPanel.setVisualizeMask(true);
			this._friendListPanel.setPos({ x: 49, y: 249 });
			this._friendListPanel.setSize(535, 443);
			this.spr.addChild(this._friendListPanel.spr);
		}

		this.spr.visible = false;
	}

	setFriendList(friends: any[])
	{
		this._setFriendCount(friends.length);
		for (let i = 0; i < friends.length; ++i)
		{
			this._friendEntries[i].setFriendInfo(friends[i]);
		}
	}

	private _setFriendCount(n)
	{
		let someEntry;
		if (n < this._friendEntries.length)
		{
			for (let i = n; i < this._friendEntries.length; ++i)
			{
				let entry = this._friendEntries[i];
				this._friendListPanel.removeChild(entry.spr);
				someEntry = entry;
			}
		}
		else if (n > this._friendEntries.length)
		{
			for (let i = this._friendEntries.length; i < n; ++i)
			{
				let entry = new OneFriendEntry();
				entry.spr.x = FRIEND_ENTRY_X;
				entry.spr.y = FRIEND_ENTRY_Y + i * (FRIEND_ENTRY_Y_GAP + entry.height);
				this._friendListPanel.addChild(entry.spr);
				this._friendEntries.push(entry);
				someEntry = entry;
			}
		}
		if (someEntry)
		{
			this._friendEntries.length = n;
			var friendContentHeight = FRIEND_ENTRY_Y + n * (FRIEND_ENTRY_Y_GAP + someEntry.height);
			this._friendListPanel.contentHeight = friendContentHeight;
		}

	}

	show(isshow)
	{
		if (isshow)
		{
			this.setFriendList(GameLink.instance.getWeekRankList());
		}
		this.spr.visible = isshow;
	}

	refresh()
	{
		if (this.spr.visible)
		{
			this.setFriendList(GameLink.instance.getWeekRankList());
		}
	}
}
import {HallUI} from "../HallUI"
import {VerticalScrollPanel} from "../shared/VerticalScrollPanel"
import {OneFriendEntry} from "./OneFriendEntry"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
import {HelpPanel} from "./HelpPanel"
/** 面板的位置 */
const BASE_POS = { x: 17, y: 202 - 14 };

const FRIEND_ENTRY_X = 10;
const FRIEND_ENTRY_Y = 10;
const FRIEND_ENTRY_Y_GAP = 18;

export class FriendPanel
{
	spr = new createjs.Container();
	//private _imageLamaTip: createjs.Bitmap;
	private _btnInviteFriends: ImageButton;
	private _friendListPanel: VerticalScrollPanel;
	private _friendEntries: OneFriendEntry[] = [];
	//private _btnToggleFriendSort: ImageButton;

	private _btnWeekSort: any;
	private _btnHistoricalSort: any;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_panel_background'));
		background.set(BASE_POS);

		//let title = new createjs.Bitmap(HallUI.getImage('hall/friend_title_text'));
		//title.set({ x: 30 + BASE_POS.x, y: 95 + BASE_POS.y })

		let _btnInviteFriends = this._btnInviteFriends = new ImageButton(HallUI.instance.getImage('hall/friend_invite'));
		/*
				this._btnToggleFriendSort = new ImageButton(HallUI.getImage('hall/btn_weekScore'));
				this._btnToggleFriendSort.set({ x: 490, y: 316 });
				this._btnToggleFriendSort.onClick = () =>
				{
					HallUI.instance.toggleFriendSort();
					this._btnToggleFriendSort.image = HallUI.instance._currentFriendSort === "weekHighScore" ? HallUI.getImage('hall/btn_weekScore') : HallUI.getImage('hall/btn_historicalScore');
				};
		*/
		var sortButtonBgImage = HallUI.getImage('hall/sort_btn_bg');
		this._btnWeekSort = {
			image1: HallUI.getImage('hall/week_sort_btn_sel'),
			image2: HallUI.getImage('hall/week_sort_btn'),
			bg: new createjs.Bitmap(sortButtonBgImage),
			btn: new ImageButton(HallUI.getImage('hall/week_sort_btn_sel'))
		};

		this._btnHistoricalSort = {
			image1: HallUI.getImage('hall/historical_sort_btn_sel'),
			image2: HallUI.getImage('hall/historical_sort_btn'),
			bg: new createjs.Bitmap(sortButtonBgImage),
			btn: new ImageButton(HallUI.getImage('hall/historical_sort_btn_sel'))
		};

		this._btnWeekSort.btn.set({ x: 389, y: 325 });
		this._btnWeekSort.bg.set({
			x: 389, y: 325,
			regX: sortButtonBgImage.width / 2,
			regY: sortButtonBgImage.height / 2
		});
		this._btnHistoricalSort.btn.set({ x: 508, y: 325 });
		this._btnHistoricalSort.bg.set({
			x: 508, y: 325,
			regX: sortButtonBgImage.width / 2,
			regY: sortButtonBgImage.height / 2
		});
		this.refreshSortButton();
		this._btnWeekSort.btn.onClick = () =>
		{
			HallUI.instance.setFriendSort('weekHighScore');
			this.refreshSortButton();
		};
		this._btnHistoricalSort.btn.onClick = () =>
		{
			HallUI.instance.setFriendSort('historicalHighScore');
			this.refreshSortButton();
		};

		//this._imageLamaTip = new createjs.Bitmap(HallUI.getImage('hall/lama_tip_text'));

		let friendListPanel = this._friendListPanel = new VerticalScrollPanel();
		friendListPanel.setPos({ x: 33 + BASE_POS.x, y: 157 + BASE_POS.y });
		friendListPanel.setSize(540, 450);
		friendListPanel.setVisualizeMask(false);
		friendListPanel.addChild(_btnInviteFriends);
		//friendListPanel.addChild(this._imageLamaTip);

		//let helpButton = new ImageButton(HallUI.getImage('hall/game_item_help_button'));
		//helpButton.set({ x: 569, y: 219 });
		//helpButton.onClick = () => { this.onClickHelp(); }

		this.spr.addChild(background);
		//this.spr.addChild(title);
		this.spr.addChild(this._btnWeekSort.bg, this._btnWeekSort.btn);
		this.spr.addChild(this._btnHistoricalSort.bg, this._btnHistoricalSort.btn);
		this.spr.addChild(friendListPanel.spr);
		//this.spr.addChild(this._btnToggleFriendSort);
		//this.spr.addChild(helpButton);
		_btnInviteFriends.onClick = () => this._onClickInviteFriend();


		//sample data
		let ff = [];
		for (let i = 0; i < 10; ++i)
		{
			ff.push({ name: `名字名字:${i}`, index: i });
		}
		this.setFriends(ff);
	}
	/*
	private onClickHelp()
	{
		let id = '';
		if (HallUI.instance._currentFriendSort === "weekHighScore")
		{
			id = 'hall/help_text_weekly_highscore_award'
		}
		else
		{
			id = 'hall/help_text_historical_highscore_award'
		}
		let helpPanel = new HelpPanel(id);
		HallUI.instance.spr.addChild(helpPanel.spr);
	}*/

	private refreshSortButton()
	{

		var setup = function (obj, str)
		{
			if (HallUI.instance.currentFriendSort === str)
			{
				obj.btn.image = obj.image1;
				obj.bg.visible = true;
			}
			else
			{
				obj.btn.image = obj.image2;
				obj.bg.visible = false;
			}
		}
		setup(this._btnWeekSort, 'weekHighScore');
		setup(this._btnHistoricalSort, 'historicalHighScore');
	}

	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
	}

	setFriends(friends: any[])
	{
		this._setFriendCount(friends.length);
		for (let i = 0; i < friends.length; ++i)
		{
			this._friendEntries[i].setFriendInfo(friends[i]);
		}
	}
	private _onClickInviteFriend()
	{
		HallUI.instance.showAddFriend();
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
		this._friendEntries.length = n;

		let friendContentHeight = 0;
		if (n > 0 && someEntry)
		{
			friendContentHeight = FRIEND_ENTRY_Y + n * (FRIEND_ENTRY_Y_GAP + someEntry.height);
			this._btnInviteFriends.x = 540 / 2;
			this._btnInviteFriends.y = friendContentHeight + this._btnInviteFriends.image.height / 2;
			//this._imageLamaTip.x = 16;
			//this._imageLamaTip.y = this._btnInviteFriends.y + 50;

			this._friendListPanel.contentHeight = friendContentHeight + 63 + 40 //+ this._imageLamaTip.image.height;
		}
	}
}
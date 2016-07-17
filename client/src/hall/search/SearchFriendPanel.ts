import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import {GraphicConstant as GC} from "../../resource"
import * as main from "../../main"
import {SearchResultPanel} from "./SearchResultPanel"
import {GameLink} from "../../GameLink"
import * as share from "../../ShareFunctions"
export class SearchFriendPanel
{
	spr = new createjs.Container();
	_inputField: HTMLInputElement;
	_resultPanel: SearchResultPanel;
	constructor()
	{
		let mask = new createjs.Shape();
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
		}
		mask.addEventListener('mousedown', () => { });
		this.spr.addChild(mask);

		let background = new createjs.Bitmap(HallUI.getImage('hall/dialog_bg'));
		background.set({ x: 45, y: 219 });
		this.spr.addChild(background);

		let title = new createjs.Bitmap(HallUI.getImage('hall/search_friend_title_text'));
		title.set({ x: 239, y: 291 });
		this.spr.addChild(title);

		let search_text = new createjs.Text('搜索好友：', '30px SimHei', '#142d3e');
		search_text.set({ x: 73, y: 384 });
		this.spr.addChild(search_text);




		let search_btn = new ImageButton(HallUI.getImage('hall/search_button'));
		search_btn.set({ x: 527, y: 400 });
		search_btn.onClick = () => this._onClickSearch();
		this.spr.addChild(search_btn);

		let share_btn = new ImageButton(HallUI.getImage('hall/share_button'));
		share_btn.set({ x: 527, y: 520 });
		share_btn.onClick = () => this._onClickSearch();
		this.spr.addChild(share_btn);
		share_btn.onClick = () =>
		{
			GameLink.instance.sendTriggerEvent('SHARE_AWARD');
			share.share();
		}

		let share_text = new createjs.Text('通过分享链接进入游戏的玩家将\n自动与您建立好友关系', '29px SimHei', '#142d3e');
		share_text.lineHeight = 30;
		share_text.set({ x: 70, y: 469 });
		this.spr.addChild(share_text);

		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885 + 120 });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				if (this._resultPanel.isShowing())
				{
					this._resultPanel.show(false);
					this._inputField.style.display = 'block';
				}
				else
				{
					this.show(false);
				}
			}
		}

		//create input field
		{
			let input = document.createElement('input');
			input.setAttribute('type', 'text');
			input.setAttribute('style', 'border: 0;border-bottom: solid 2px white;background-color: rgba(0, 0, 0, 0);')
			input.style.position = 'absolute';
			document.getElementById('canvasWrapper').appendChild(input);
			this._inputField = input;
		}
		main.addResizeCallback((s) => this._onScale(s));

		this.spr.visible = false;
		this._inputField.style.display = 'none';

		this._resultPanel = new SearchResultPanel();
		this.spr.addChild(this._resultPanel.spr);
	}

	private _onClickSearch()
	{
		let name = $(this._inputField).val();
		name = name && name.toString().trim();
		if (!name) return;
		GameLink.instance.sendSearchFriend(name);
		this._resultPanel.show();
		this._resultPanel.clear();
		this._inputField.style.display = 'none';
	}

	private _onScale(scale: number)
	{
		let px = (x) => (x * scale).toString() + 'px';
		let input = this._inputField;
		$(input).css({
			left: px(213),
			top: px(383),
			width: px(247),
			height: px(30),
			'font-size': px(24)
		});
	}

	show(bShow?: boolean)
	{
		if (typeof bShow === 'undefined') bShow = true;
		let oldShow = this.spr.visible;
		this.spr.visible = bShow;
		this._inputField.style.display = bShow ? 'block' : 'none';
		if (!oldShow && bShow)
		{
			$(this._inputField).val("");
			this._resultPanel.show(false);
		}
	}

	setSearchResult(ret)
	{
		if (this._resultPanel.isShowing())
		{
			this._resultPanel.setFriends(ret);
		}
	}
}
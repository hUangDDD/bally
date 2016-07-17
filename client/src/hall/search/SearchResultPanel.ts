import {HallUI} from "../HallUI"
import {VerticalScrollPanel} from "../shared/VerticalScrollPanel"
import {MakeSuitableSize} from "../../FixSizeBitmap"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
const ADD_TO_Y = 120;
export class SearchResultPanel
{
	spr = new createjs.Container();
	_searchResultText: createjs.Text;
	_scrollPane: VerticalScrollPanel;
	_items: any[] = [];
	constructor()
	{
		{
			let bg = new createjs.Bitmap(HallUI.getImage('hall/panel_background'));
			bg.set({ x: 43, y: 89 + ADD_TO_Y });
			this.spr.addChild(bg);
		}
		//title text
		{
			let title = new createjs.Bitmap(HallUI.getImage('hall/search_friend_title_text'));
			title.set({ x: 250, y: 186 + ADD_TO_Y });
			this.spr.addChild(title);
		}

		{
			this._scrollPane = new VerticalScrollPanel();
			this._scrollPane.setPos({ x: 56, y: 244 + ADD_TO_Y });
			this._scrollPane.setSize(538, 454);
			//this._scrollPane.setVisualizeMask(true);
			this.spr.addChild(this._scrollPane.spr);
		}

		this._searchResultText = new createjs.Text('正在搜索中...', '32px SimHei', '#ff277e');
		this._searchResultText.set({ x: 320, y: 731 + ADD_TO_Y });
		this._searchResultText.textAlign = 'center';
		this.spr.addChild(this._searchResultText);
		/*
		this.setFriends([
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
			{nickname:'user99',faceurl:'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2583109695,1104231484&fm=116&gp=0.jpg'},
		]);*/
	}

	clear()
	{
		this._searchResultText.text = '正在搜索中...';
		for (let x of this._items)
		{
			this._scrollPane.removeChild(x);
		}
		this._items.length = 0;
	}

	setFriends(objs: any[])
	{
		this.clear();
		this._searchResultText.text = `搜索到${objs.length}个好友`;
		let each_height = 76;
		let y = 0;
		for (let obj of objs)
		{
			let item = this.createItem(obj);
			this._items.push(item);
			this._scrollPane.addChild(item);
			item.y = y;
			y += each_height;
		}
		this._scrollPane.contentHeight = y;
	}

	show(bShow?)
	{
		if (typeof bShow === 'undefined') bShow = true;
		this.spr.visible = bShow;
	}

	isShowing()
	{
		return this.spr.visible;
	}

	createItem(obj)
	{
		let icon = new createjs.Bitmap(null);
		icon.hitArea = new createjs.Shape();
		icon.set({ x: 33 + 30, y: 8 + 30 });
		MakeSuitableSize(icon, 60, 60, HallUI.getImage('hall/default_user_headicon'));
		if (obj.faceurl)
		{
			let image = icon.image = new Image();
			image.src = obj.faceurl;
		}

		let name = new createjs.Text('', '30px SimHei', '#ff277e');
		name.set({ x: 109, y: 31 });
		name.text = obj.nickname;
		if (name.text.length > 9)
		{
			name.text = name.text.substr(0, 9) + '...';
		}

		let btn = new ImageButton(HallUI.getImage('hall/add_friend_button'));
		btn.onClick = () =>
		{
			if (obj.key)
			{
				GameLink.instance.sendReqAddFriend(obj.key);
				this.playAddFriendAnimation();
			}
			btn.visible = false;
		}
		btn.set({ x: 454, y: 38 });

		let spr = new createjs.Container();
		spr.addChild(icon);
		spr.addChild(name);
		spr.addChild(btn);
		spr.setBounds(0, 0, 300, 76);
		return spr;
	}

	playAddFriendAnimation()
	{
		let text = new createjs.Text('好友申请已经发送', '42px SimHei', '#ff1469');
		text.textAlign = 'center';
		text.x = 320;
		text.y = 600;
		text.alpha = 1;

		HallUI.instance.spr.addChild(text);
		createjs.Tween.get(text).to({ alpha: 0, y: 350 }, 1000).call(() =>
		{
			if (text.parent) text.parent.removeChild(text);
		});

	}
}
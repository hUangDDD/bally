import {ImageLoader} from "../ImageLoader"
import {GameStage} from "../GameStage"
import {res as HALLRES} from "./HallRes"
import {HeadBarUI} from "./HeadBarUI"
import {FriendPanel} from "./friend/FriendPanel"
import {FriendInfoPanel} from "./friend/FriendInfoPanel"
import {HeartBarUI} from "./HeartBarUI"
import {DailyTaskBarUI} from "./DailyTaskBarUI"
//import {BottomBarUI} from "./BottomBarUI"
import {WeeklyTaskPanel} from "./weekly_task/WeeklyTaskPanel"
import {PetPanel} from "./pet/PetPanel"
import {ReadyGamePanel} from "./ready_game/ReadyGamePanel"
import {GameLink} from "../GameLink"
import {PetLevelUpPanel} from "./pet_levelup/PetLevelUpPanel"
import {ScorePanel} from "./score/ScorePanel"
import {MailPanel} from "./mail/MailPanel"
import {ConfirmDialog} from "./confirm_dialog/ConfirmDialog"
import {ShopUI} from "./shop/ShopUI"
import {SoundManager} from "../SoundManager"
import * as LoginUI from "../LoginUI"
import {HallTutorial} from "./HallTutorial"
import * as PetRules from "../shared/PetRules"
import {PaymentPanel} from "./payment/PaymentPanel"
import {PaymentMask} from "./payment/PaymentMask"
import {SearchFriendPanel} from "./search/SearchFriendPanel"
import {GameItemHelpPanel} from "./game_item_help/GameItemHelpPanel"
import * as util from "../util"
import {HallLoadUI} from "./HallLoadUI"
import {NeedValueDialog} from "./need_value_dialog/NeedValueDialog"
import {HighScoreUpAnimation} from "./gameover/HighScoreUpAnimation"
import {HighScorePositionUpAnimation} from "./gameover/HighScorePositionUpAnimation"
import {MatchingPanel} from "./match_ui/MatchingPanel"
import {SmallButtonBar} from "./SmallButtonBar"
import {MatchPanel} from "./match_ui/MatchPanel"
import {ActivityPanel} from "./activity_panel/ActivityPanel"
import {RankListPanel} from "./rank_list_panel/RankListPanel"
//import {HelpPanel} from "./help/HelpPanel"
import {SmallBottomButtonBar} from "./SmallBottomButtonBar";
import {NewBottomBar} from "./NewBottomBar"
import {MatchEndPanel} from "./match_ui/MatchEndPanel"
import {Need10sDialog} from "./need_value_dialog/Need10sDialog"
import {TutorialConfirmDialog} from "./confirm_dialog/TutorialConfirmDialog"
type PANEL_TYPE = "friend" | "weekly_task" | "pet" | "ready_game" | "score" | "match";

const NORMAL_BACKGROUND_URL = 'images/hall/背景图.jpg'
//const PET_BACKGROUND_URL = 'images/hall/1561降低.jpg';
const LOADING_BACKGROUND_URL = 'images/海报1.jpg';

export class HallUI
{
	static instance: HallUI;
	spr: createjs.Container = new createjs.Container();
	private _imageLoader: ImageLoader;
	private _isLoadComplete = false;

	//ui
	private _headBar: HeadBarUI;   /** 顶部的 经验、金币、钻石 , maybe alway show*/
	private _rankListPanel: RankListPanel;
	private _mailPanel: MailPanel;
	private _activityPanel: ActivityPanel;
	private _friendInfoPanel: FriendInfoPanel;
	private _friendPanel: FriendPanel;

	private _weeklyTaskPanel: WeeklyTaskPanel;
	private _matchPanel: MatchPanel;
	private _petPanel: PetPanel;
	private _scorePanel: ScorePanel;
	private _heartBar: HeartBarUI; /** friend, ready_game,score*/
	private _smallBottomButtonBar: SmallBottomButtonBar;
	//private _dailyTaskBar: DailyTaskBarUI; /** friend, ready_game,score*/
	private _smallButtonBar: SmallButtonBar;
	private _readyGamePanel: ReadyGamePanel;
	//private _bottomBar: BottomBarUI; /** always show */
	private _newBottomBar: NewBottomBar;
	private _shop: ShopUI;
	private _paymentPanel: PaymentPanel;
	private _paymentMask: PaymentMask;
	private _searchFriendPanel: SearchFriendPanel;
	private _confirmDialog: ConfirmDialog;
	private _matchingPanel: MatchingPanel;
	//	private _helpPanel: HelpPanel;


	private _currentPanelType: PANEL_TYPE;
	private _petImages: HTMLImageElement[] = [];

	private _loadUI: HallLoadUI = new HallLoadUI();

	//private _delayPlayWeeklyTaskSatisfiedAnimation = false;

	//public get dailyTaskBar() { return this._dailyTaskBar; }
	public get heartbar() { return this._heartBar; }
	//public get bottomBar() { return this._bottomBar; }
	constructor()
	{
		window['hall'] = this;
		HallUI.instance = this;
		this._imageLoader = new ImageLoader(HALLRES);
		this._imageLoader.onComplete = () => this._onLoadComplete();
		this._imageLoader.onError = () => { if (this._loadUI) this._loadUI._onLoadError(); };
		this._imageLoader.onProgress = (n, total) => { if (this._loadUI) this._loadUI._onLoadProgress(n, total); };
		this.spr.addChild(this._loadUI.spr);
		this._updateCssBackground();
	}

	show(isShow = true)
	{
		this.spr.visible = isShow;
		this._updateCssBackground();
	}

	clear()
	{

	}

	static getImage(id: string): HTMLImageElement
	{
		return HallUI.instance.getImage(id);
	}
	getImage(id: string): HTMLImageElement
	{
		return this._imageLoader.getImage(id);
	}

	getPetImage(idx: number): HTMLImageElement
	{
		return this._petImages[idx];
	}

	private _onLoadComplete()
	{
		console.log('HallUI: load complete');
		this._updateCssBackground();
		SoundManager.init();
		LoginUI.show();
		//is lama
		let enuid = util.getParameterByName('enuid');
		let nickname = decodeURIComponent(util.getParameterByName('nickname'));
		let face = util.getParameterByName('face');
		let type = util.getParameterByName('type');
		//console.log('type=' + type);
		if (enuid && nickname && face)
		{
			GameLink.instance.loginLaMa(enuid, face, nickname, type);
		}

		for (let i = 0; i < PetRules.MAX_PET_COUNT; ++i)
		{
			this._petImages[i] = this.getImage('hall/pet' + i);
		}

		this._isLoadComplete = true;

		//init here
		this.spr.removeChild(this._loadUI.spr);
		this._loadUI = null;

		//this._bottomBar = new BottomBarUI();
		//this.spr.addChild(this._bottomBar.spr);

		this._newBottomBar = new NewBottomBar();
		this.spr.addChild(this._newBottomBar.spr);

		this._friendPanel = new FriendPanel();
		this.spr.addChild(this._friendPanel.spr);

		this._weeklyTaskPanel = new WeeklyTaskPanel();
		this.spr.addChild(this._weeklyTaskPanel.spr);

		this._matchPanel = new MatchPanel();
		this.spr.addChild(this._matchPanel.spr);

		this._petPanel = new PetPanel();
		this.spr.addChild(this._petPanel.spr);

		this._scorePanel = new ScorePanel();
		this.spr.addChild(this._scorePanel.spr);

		this._readyGamePanel = new ReadyGamePanel();
		this.spr.addChild(this._readyGamePanel.spr);

		this._heartBar = new HeartBarUI();
		this.spr.addChild(this._heartBar.spr);

		this._smallButtonBar = new SmallButtonBar();
		this.spr.addChild(this._smallButtonBar.spr);

		this._smallBottomButtonBar = new SmallBottomButtonBar();
		this.spr.addChild(this._smallBottomButtonBar.spr);

		//this._bottomBar.onButtonClick = n => this._onClickBottomButton(n);



		this._mailPanel = new MailPanel();
		this.spr.addChild(this._mailPanel.spr);

		this._rankListPanel = new RankListPanel();
		this.spr.addChild(this._rankListPanel.spr);

		this._friendInfoPanel = new FriendInfoPanel();
		this.spr.addChild(this._friendInfoPanel.spr);


		this._shop = new ShopUI();
		this.spr.addChild(this._shop.spr);

		this._paymentPanel = new PaymentPanel();
		GameStage.instance.stage.addChild(this._paymentPanel.spr);

		this._paymentMask = new PaymentMask();
		this.spr.addChild(this._paymentMask.spr);

		this._searchFriendPanel = new SearchFriendPanel();
		this.spr.addChild(this._searchFriendPanel.spr);

		this._confirmDialog = new ConfirmDialog();
		this.spr.addChild(this._confirmDialog.spr);

		this._headBar = new HeadBarUI();
		this.spr.addChild(this._headBar.spr);

		this._matchingPanel = new MatchingPanel();
		this.spr.addChild(this._matchingPanel.spr);

		this._activityPanel = new ActivityPanel();
		this.spr.addChild(this._activityPanel.spr);

		this._currentPanelType = 'friend'
		this._changePanelType("friend");


		//let lvPanel = new PetLevelUpPanel(PetLevelUpPanel.SAMPLE_DATA);
		//this.spr.addChild(lvPanel.spr);

		this._updateCssBackground();

		SoundManager.playBg('bgMain');
	}

	private _changePanelType(type: PANEL_TYPE)
	{
		// heartbar 要在哪几种type的面板中显示
		const HEARTBAR_SHOW_TYPE = ["friend", "ready_game"];
		const DAILY_TASKBAR_SHOW_TYPE = ["friend", "ready_game", 'match'];
		this._smallBottomButtonBar.show(['friend', 'ready_game', 'match'].indexOf(type) >= 0);
		this._heartBar.show(HEARTBAR_SHOW_TYPE.indexOf(type) >= 0);
		//this._dailyTaskBar.show(DAILY_TASKBAR_SHOW_TYPE.indexOf(type) >= 0);
		this._smallButtonBar.spr.visible = DAILY_TASKBAR_SHOW_TYPE.indexOf(type) >= 0;
		this._friendPanel.show(type === "friend");
		this._weeklyTaskPanel.show(type === "weekly_task");
		this._petPanel.show(type === 'pet');
		this._readyGamePanel.show(type === 'ready_game');
		this._scorePanel.show(type === 'score');
		//this._bottomBar.onPanelTypeChanged(type);
		this._newBottomBar.onPanelTypeChanged(type);
		this._matchPanel.show(type === 'match');
		this._newBottomBar.show(['friend', 'ready_game', 'pet', 'match', 'weekly_task', 'score'].indexOf(type) >= 0);
		//this._bottomBar.show(type !== 'friend' && type !== 'ready_game' && type !== 'pet' && type !== 'match' && type !== 'weekly_task' && type !== 'score');
		this._smallButtonBar.onPanelChanged(type);
		if (type === 'score')
		{
			let snd = SoundManager.playBg('bgGameOver', true);
		}
		else if (type === 'pet')
		{
			SoundManager.playBg('bgPet');
		}
		else 
		{
			SoundManager.playBg('bgMain');
		}
		/*
		if (this._delayPlayWeeklyTaskSatisfiedAnimation)
		{
			this._delayPlayWeeklyTaskSatisfiedAnimation = false;
			if (type !== 'weekly_task')
			{
				//this.playWeeklyTaskSatisfied();
			}
		}*/
	}

	public _onClickBottomButton(buttonName: string)
	{
		//	this._helpPanel.show(false);
		if (buttonName === 'weekly_task')
		{
			this._currentPanelType = 'weekly_task';
			this._changePanelType('weekly_task');
		}
		else if (buttonName === 'game')
		{

			if (this._currentPanelType === 'friend')
			{
				this._currentPanelType = 'ready_game';
				this._changePanelType('ready_game');
			}
			else 
			{
				this._currentPanelType = 'friend';
				this._changePanelType('friend');
			}
		}
		else if (buttonName === 'start')
		{
			if (this._currentPanelType === 'ready_game')
			{
				GameLink.instance.sendReqStartGame({
					items: this._readyGamePanel.getSelectItems()
				});
			}
			else
			{
				this._currentPanelType = 'ready_game';
				this._changePanelType('ready_game');
			}

		}
		else if (buttonName === 'pet')
		{
			this._currentPanelType = 'pet';
			this._changePanelType('pet');
		}
		else if (buttonName === 'carry')
		{
			this._petPanel.onClickCarry();
			this._currentPanelType = 'friend';
			this._changePanelType('friend');
		}
		else if (buttonName === 'shop')
		{
			this._shop.show(true);
		}
		else if (buttonName === 'match')
		{
			this._currentPanelType = 'match';
			this._changePanelType('match');
		}
		else if (buttonName === 'returnFromPet')
		{
			this._currentPanelType = 'friend';
			this._changePanelType('friend');
		}
		else if (buttonName === 'returnFromMatch')
		{
			this._currentPanelType = 'friend';
			this._changePanelType('friend');
		}
		else if (buttonName === 'returnFromWeeklyTask')
		{
			this._currentPanelType = 'friend';
			this._changePanelType('friend');
		}
		else if (buttonName === 'returnFromScore')
		{
			this._currentPanelType = 'friend';
			this._changePanelType('friend');
		}
		this._updateCssBackground();
	}
	showPetShop()
	{
		this._shop.show(true);
	}
	_updateCssBackground()
	{
		if (!this._isLoadComplete)
		{
			//GameStage.instance.setCssBackground(LOADING_BACKGROUND_URL);
			GameStage.instance.setCssBackgroundImage(window['loader_image']);
			return;
		}
		if (this.spr.visible)
		{
			//if (this._currentPanelType === 'pet')
			//{
			//	GameStage.instance.setCssBackground(PET_BACKGROUND_URL);
			//}
			//else
			{
				GameStage.instance.setCssBackground(NORMAL_BACKGROUND_URL);
			}
		}
	}
	showScorePanel(obj)
	{
		this._currentPanelType = 'friend';
		this._changePanelType('friend');
		
		//this._delayPlayWeeklyTaskSatisfiedAnimation = !!obj.weeklyTaskSatisfied;
		if (!obj.tutorial)
		{
			this._scorePanel.showData(obj);
			//播放分数提升和排名提升的动画
			let positionChangedObject = null;
			let scoreChangedObject = null;
			if (obj.weekHighScoreChanged)
			{
				positionChangedObject = GameLink.instance.genScorePositionChangeInfo(obj.weekHighScoreChanged.oldScore, obj.weekHighScoreChanged.newScore);
				scoreChangedObject = {
					oldScore: obj.weekHighScoreChanged.oldScore,
					newScore: obj.weekHighScoreChanged.newScore,
					type: 'weekly'
				};
			}
			if (obj.historicalHighScoreChanged)
			{
				scoreChangedObject = {
					oldScore: obj.historicalHighScoreChanged.oldScore,
					newScore: obj.historicalHighScoreChanged.newScore,
					type: 'historical'
				};
			}
			//如果两个动画都要播放，则顺序播放
			if (positionChangedObject && scoreChangedObject)
			{
				this.playHighScoreUpAnimation(scoreChangedObject.oldScore, scoreChangedObject.newScore, scoreChangedObject.type, () =>
				{
					this.playHighScorePositionUpAnimation(positionChangedObject);
				});
			}
			else
			{
				if (positionChangedObject) this.playHighScorePositionUpAnimation(positionChangedObject);
				if (scoreChangedObject) this.playHighScoreUpAnimation(scoreChangedObject.oldScore, scoreChangedObject.newScore, scoreChangedObject.type);
			}
		}
		if (obj.tutorial)
		{
			this.showTutorial(obj.tutorialGift);
		}
	}

	showGameReadyPanel()
	{
		this._currentPanelType = 'ready_game';
		this._changePanelType('ready_game');
	}

	showMailPanel()
	{
		this._mailPanel.show();
	}

	//为了让GameLink知道需不需要刷新邮件。
	//当邮件发生了变化的时候，如果邮件面板显示着的话，自动刷新一下
	isMailPanelShowing()
	{
		return this._mailPanel.isShowing();
	}

	updateMailCount(count: number)
	{
		this._heartBar.setMailCount(count);
	}

	updateMail(mails: any[])
	{
		this._mailPanel.setMails(mails);
	}

	//当玩家的基本数据发生变化的时候
	updateBasicInfo()
	{
		this._headBar.refresh();
	}
	//由于nextHeartTime和时间有关，不能每次没事就refresh，所以独立开来
	updateHeartInfo()
	{
		this._heartBar.refresh();
	}

	//当玩家宠物数据发生了变化
	updatePetInfo()
	{
		this._petPanel.refresh();
		this._headBar.refresh();
		let hasLockedPet = false;
		let pets = GameLink.instance.pets;
		if (pets)
		{
			for (let p of pets)
			{
				if (p && typeof p.unlockPrice === 'number')
				{
					hasLockedPet = true;
				}
			}
		}
		//this._bottomBar.setPetLockIcon(hasLockedPet);
	}

	updateWeeklyTask(tasks: any[], totalCount: number, obj)
	{
		if (totalCount > 0 && tasks.length === 0)
		{
			this._weeklyTaskPanel.setTaskCount(1);
			this._weeklyTaskPanel.taskLines[0].setNoTask();
			this._smallButtonBar.showWeeklyTaskNewIcon(true);
			return;
		}
		let showNewIcon = false;//是不是要显示 冒险按钮上的new tip
		let weeklyTaskPrize = [];
		if (Array.isArray(obj.weeklyTaskPrize))
		{
			weeklyTaskPrize.length = totalCount;
			for (let i = 0; i < obj.weeklyTaskPrize.length; ++i)
			{
				let t = obj.weeklyTaskPrize[i];
				if (t)
				{
					weeklyTaskPrize[t.idx] = t;
				}
			}
		}
		this._weeklyTaskPanel.setTaskCount(totalCount > tasks.length ? totalCount : tasks.length);
		let i;
		let lastRunningTask = -1;
		let endTaskCount = 0;
		for (i = 0; i < tasks.length; ++i)
		{
			let line = this._weeklyTaskPanel.taskLines[i];
			let task = tasks[i];
			let status = task.status;
			line.idx = i;
			line.task = task;
			if (status === 'end')
			{
				line.setFinishedTask(task.desc);
				++endTaskCount;
			}
			else if (status === 'satisfied')
			{
				line.setSatisfisedTask(task.desc);
				showNewIcon = true;
			}
			else if (status === 'running')
			{
				lastRunningTask = i;
				if ('failCount' in task && task.failCount > 0)
				{
					line.setPointTask(task.desc, task.fail, task.failCount, task.prizeType);
				}
				else
				{
					line.setProgressTask(task.desc, task.count, task.maxCount, task.prizeType);
				}
			}
		}
		for (; i < totalCount; ++i)
		{
			let line = this._weeklyTaskPanel.taskLines[i];
			if (i === tasks.length)
			{
				line.setUnknownTask(true);
			}
			else if (weeklyTaskPrize[i])
			{
				line.setUnknownTask(false, weeklyTaskPrize[i].type, weeklyTaskPrize[i].count);
			}
			else
			{
				line.setUnknownTask(false);
			}
		}
		if (lastRunningTask !== -1)
		{
			this._weeklyTaskPanel.makeTaskVisible(lastRunningTask);
		}
		this._weeklyTaskPanel.setProgress(endTaskCount, totalCount);
		this._weeklyTaskPanel.setPetProgress(endTaskCount / totalCount);

		this._weeklyTaskPanel.setTaskPrize(weeklyTaskPrize.map(x => x && x.type));
		this._smallButtonBar.showWeeklyTaskNewIcon(showNewIcon);
	}

	showConfirmDialog(text: string, onOk?: Function, onCancel?: Function, config?)
	{
		this._confirmDialog.show(text, onOk, onCancel, config);
	}

	closeConfirmDialog()
	{
		this._confirmDialog.hide();
	}

	showNoCoinDialog(text: string)
	{
		let config = { cancelImage: HallUI.getImage('hall/buy_button'), okImage: HallUI.getImage('hall/cancel_button') };
		this.showConfirmDialog(text, null, () =>
		{
			this.closeConfirmDialog();
			this.showBuyCoin();
		}, config)
	}
	showNoHeartDialog(text: string)
	{
		let config = { cancelImage: HallUI.getImage('hall/buy_button'), okImage: HallUI.getImage('hall/cancel_button') };
		this.showConfirmDialog(text, null, () =>
		{
			this.closeConfirmDialog();
			this.showBuyHeart();
		}, config)
	}
	showNoDiamondDialog(text: string)
	{
		let config = { cancelImage: HallUI.getImage('hall/buy_button'), okImage: HallUI.getImage('hall/cancel_button') };
		this.showConfirmDialog(text, null, () =>
		{
			this.closeConfirmDialog();
			this.showBuyDiamond();
		}, config)
	}

	showBuyGiftSuccess(obj)
	{
		if (obj.gift)
		{
			this._shop.showBuyGiftAnimation(obj.gift);
		}
	}
	_currentFriendSort = "weekHighScore";
	refreshFriends()
	{
		this._friendPanel.setFriends(GameLink.instance.getFriendList(this._currentFriendSort as any));
	}

	toggleFriendSort()
	{
		this._currentFriendSort = this._currentFriendSort === 'historicalHighScore' ? 'weekHighScore' : 'historicalHighScore';
		this.refreshFriends();
	}

	setFriendSort(sortType: 'historicalHighScore' | 'weekHighScore')
	{
		if (this._currentFriendSort !== sortType)
		{
			this._currentFriendSort = sortType;
			this.refreshFriends();
		}
	}
	get currentFriendSort() { return this._currentFriendSort; }
	//当用户点击好友头像的时候，显示详细信息的面板
	showFriendInfoPanel(friendKey: string)
	{
		this._friendInfoPanel.key = friendKey;
		this._friendInfoPanel.show();
		this._friendInfoPanel.clear();
		//发送一个请求并且等待回应的信息
		GameLink.instance.sendQueryFriend(friendKey);
	}

	recvFriendInfo(obj)
	{
		this._friendInfoPanel.setInfo(obj);
	}

	showTutorial(hasGift?)
	{
		//this.spr.addChild(new HallTutorial(hasGift).spr);
	}

	showBuyCoin()
	{
		this._paymentPanel.showAsBuyCoin();
	}
	showBuyHeart()
	{
		this._paymentPanel.showAsBuyHeart();
	}
	showBuyDiamond()
	{
		this._paymentPanel.showAsBuyDiamond();
	}
	showAddFriend()
	{
		this._searchFriendPanel.show();
	}
	recvSearchFriendResult(ret)
	{
		this._searchFriendPanel.setSearchResult(ret);
	}
	recvPlayAnimation(obj)
	{
		function remove(ss)
		{
			if (ss.parent)
			{
				ss.parent.removeChild(ss);
			}
		}
		if (obj.type === 'buyHeart')
		{
			let image = this.getImage('hall/full_heart');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				regX: image.width / 2,
				regY: image.height / 2,
				x: 317,
				y: 459
			});
			GameStage.instance.stage.addChild(bitmap);
			createjs.Tween.get(bitmap).to({ x: 418, y: 129 }, 300).call(remove, [bitmap]);
			for (var i = 1; i < 4; ++i)
			{
				var bitmap2 = bitmap.clone();
				GameStage.instance.stage.addChild(bitmap2);
				bitmap2.visible = false;
				createjs.Tween.get(bitmap2).wait(i * 70).set({ visible: true }).to({ x: 418, y: 129 }, 300).call(remove, [bitmap2]);
			}
		}
		else if (obj.type === 'buyCoin')
		{
			let image = this.getImage('hall/weekly_task_prize1');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				regX: image.width / 2,
				regY: image.height / 2,
				x: 317,
				y: 459
			});
			GameStage.instance.stage.addChild(bitmap);
			createjs.Tween.get(bitmap).to({ x: 313, y: 78 }, 300).call(remove, [bitmap]);

			for (var i = 1; i < 4; ++i)
			{
				var bitmap2 = bitmap.clone();
				GameStage.instance.stage.addChild(bitmap2);
				bitmap2.visible = false;
				createjs.Tween.get(bitmap2).wait(i * 70).set({ visible: true }).to({ x: 313, y: 78 }, 300).call(remove, [bitmap2]);
			}
		}
	}

	showGameItemHelp()
	{
		let p = new GameItemHelpPanel();
		this.spr.addChild(p.spr);
	}
	//当boughtItems改变的时候调用这个
	refreshPayment()
	{
		this._paymentPanel.refresh();
		this._newBottomBar.showShopFreeIcon(GameLink.instance.hasFreeGift());
		this._shop.setIsFree(GameLink.instance.hasFreeGift());
	}

	showPaymentMask()
	{
		this._paymentMask.spr.visible = true;
	}
	hidePaymentMask()
	{
		this._paymentMask.spr.visible = false;
	}

	whenWantCoin(needValue)
	{
		let dlg = new NeedValueDialog({
			type: 'coin',
			hasValue: GameLink.instance.coin,
			needValue: needValue,
			onOk: () => { this.showBuyCoin(); }
		});
		GameStage.instance.stage.addChild(dlg.spr);
	}

	whenWantDiamond(needValue)
	{
		let dlg = new NeedValueDialog({
			type: 'diamond',
			hasValue: GameLink.instance.diamond,
			needValue: needValue,
			onOk: () => { this.showBuyDiamond(); }
		});
		GameStage.instance.stage.addChild(dlg.spr);
	}
	whenWantHeart(needValue)
	{
		let dlg = new NeedValueDialog({
			type: 'heart',
			hasValue: GameLink.instance.heart,
			needValue: needValue,
			onOk: () => { this.showBuyHeart(); }
		});
		GameStage.instance.stage.addChild(dlg.spr);
	}

	whenWant10s(needValue, onOk, onCancel)
	{
		var dlg;
		var _onOk = () =>
		{
			if (GameLink.instance.diamond >= needValue)
			{
				if (onOk) onOk();
				dlg.close();
				return;
			}
			this.showBuyDiamond();
		};
		var _onCancel = () =>
		{
			if (onCancel) onCancel();
			dlg.close();
		}
		dlg = new Need10sDialog(_onOk, _onCancel);
		GameStage.instance.stage.addChild(dlg.spr);
	}

	playHighScoreUpAnimation(from: number, to: number, type: string, onAnimationEnd?: Function)
	{
		let anim = new HighScoreUpAnimation({ scoreFrom: from, scoreTo: to, type: type, onAnimationEnd: onAnimationEnd });
		this.spr.addChild(anim.spr);
	}

	playHighScorePositionUpAnimation(obj)
	{
		let anim = new HighScorePositionUpAnimation(obj);
		this.spr.addChild(anim.spr);
	}
	/*
		playWeeklyTaskSatisfied()
		{
			let image = HallUI.getImage('hall/weekly_task_satisfied_label');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				regX: image.width / 2,
				regY: image.height / 2,
				scaleX: 0,
				scaleY: 0,
				x: 76,
				y: 880
			});
			this.spr.addChild(bitmap);
			createjs.Tween.get(bitmap).to({ x: 224, y: 777, scaleX: 1, scaleY: 1 }, 1000).wait(1000).to({
				scaleX: 0,
				scaleY: 0,
				x: 76,
				y: 880
			}, 1000).call(() =>
			{
				this.spr.removeChild(bitmap);
			});;
		}
	*/
	showMatchingPanel(isShow: boolean, count?: number, type?: string)
	{
		if (isShow)
		{
			this._matchingPanel.show();
			this._matchingPanel.setMatchingPlayerCount(count);
			if (type === '11')
			{
				this._matchingPanel.setTwoPlayersMode();
			}
			else
			{
				this._matchingPanel.setFourPlayersMode();
			}
		}
		else
		{
			this._matchingPanel.hide();
		}
	}
	updateMatchPanel(players:any[]) {
		this._matchingPanel && this._matchingPanel.update(players);
	}

	showActivityPanel()
	{
		this._activityPanel.show(true);
	}

	showRankListPanel()
	{
		this._rankListPanel.show(true);
	}

	refreshRankListPanel()
	{
		this._rankListPanel.refresh();
	}
	showHelp()
	{
		var dlg = new TutorialConfirmDialog({
			onOk: () =>
			{
				GameLink.instance.sendReqTutorialPlay();
			}
		});
		this.spr.addChild(dlg.spr);
	}
	showMatchEndPanel(obj)
	{
		var panel = new MatchEndPanel(obj);
		this.spr.addChild(panel.spr);
	}
}
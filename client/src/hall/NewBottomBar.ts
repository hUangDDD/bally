import {HallUI} from "./HallUI"
import {ImageButton} from "../ImageButton"
export class NewBottomBar
{
	spr = new createjs.Container();


	private _gameButton: ImageButton;
	private _matchButton: ImageButton;
	private _returnAtPetButton: ImageButton;
	private _carryButton: ImageButton;
	private _petShopButton: ImageButton;
	private _returnAtMatchButton: ImageButton;
	private _returnAtWeeklyTask: ImageButton;
	private _returnAtScore: ImageButton;
	private _shopFreeIcon: createjs.Bitmap;
	private _shopFreeIconAnimation: createjs.Tween;
	private _continueGameButton: ImageButton;
	constructor()
	{
		var gameButton = new ImageButton(HallUI.getImage('hall/new_bottom_start_game_button'));
		gameButton.set({
			x: 452,
			y: 1020
		});
		this.spr.addChild(gameButton);
		var matchButton = new ImageButton(HallUI.getImage('hall/new_bottom_start_match_button'));
		matchButton.set({
			x: 178,
			y: 1020
		});
		this.spr.addChild(matchButton);

		this._gameButton = gameButton;
		this._matchButton = matchButton;

		this._returnAtPetButton = new ImageButton(HallUI.getImage('hall/return_button'));
		this._returnAtPetButton.set({ x: 98, y: 1016 });
		this.spr.addChild(this._returnAtPetButton);

		this._carryButton = new ImageButton(HallUI.getImage('hall/carry_button'));
		this._carryButton.set({ x: 293, y: 1016 });
		this.spr.addChild(this._carryButton);

		this._petShopButton = new ImageButton(HallUI.getImage('hall/pet_shop_button'));
		this._petShopButton.set({ x: 514, y: 1016 });
		this.spr.addChild(this._petShopButton);

		let shopFreeIcon = this._petShopButton.addIcon(HallUI.getImage('hall/shop_free_icon'));
		shopFreeIcon.set({ x: 60, y: -66 });
		let shopFreeIconAnimation = createjs.Tween.get(shopFreeIcon, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
		this._shopFreeIcon = shopFreeIcon;
		this._shopFreeIconAnimation = shopFreeIconAnimation;

		this._returnAtMatchButton = new ImageButton(HallUI.getImage('hall/big_return_button'));
		this._returnAtMatchButton.set({ x: 320, y: 995 });
		this.spr.addChild(this._returnAtMatchButton);

		this._returnAtWeeklyTask = new ImageButton(HallUI.getImage('hall/return_button'));
		this._returnAtWeeklyTask.set({ x: 320, y: 986 });
		this.spr.addChild(this._returnAtWeeklyTask);

		this._returnAtScore = new ImageButton(HallUI.getImage('hall/return_to_home_button'));
		this._returnAtScore.set({
			x: 178,
			y: 1020
		});
		this.spr.addChild(this._returnAtScore);
		this._continueGameButton = new ImageButton(HallUI.getImage('hall/continue_game_button'));
		this._continueGameButton.set({
			x: 452,
			y: 1020
		});
		this.spr.addChild(this._continueGameButton);

		gameButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('start');
		}
		matchButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('match');
		}

		this._returnAtPetButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('returnFromPet');
		}
		this._carryButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('carry');
		}
		this._petShopButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('shop');
		}
		this._returnAtMatchButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('returnFromMatch');
		};
		this._returnAtWeeklyTask.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('returnFromWeeklyTask');
		};
		this._returnAtScore.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('returnFromScore');
		}
		this._continueGameButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('start');
		}
	}

	showShopFreeIcon(isshow: boolean)
	{
		this._shopFreeIcon.visible = isshow;
		this._shopFreeIconAnimation.setPaused(!isshow);
	}

	show(isshow: boolean)
	{
		this.spr.visible = isshow;
	}

	onPanelTypeChanged(panelType: string)
	{
		this._matchButton.visible = panelType !== 'pet' && panelType !== 'match' && panelType !== 'weekly_task' && panelType !== 'score';
		this._gameButton.visible = panelType !== 'pet' && panelType !== 'match' && panelType !== 'weekly_task' && panelType !== 'score';
		this._carryButton.visible = panelType === 'pet';
		this._petShopButton.visible = panelType === 'pet';
		this._returnAtPetButton.visible = panelType === 'pet';
		this._returnAtMatchButton.visible = panelType === 'match';
		this._returnAtWeeklyTask.visible = panelType === 'weekly_task';
		this._returnAtScore.visible = panelType === 'score';
		this._continueGameButton.visible = panelType === 'score';
	}
}
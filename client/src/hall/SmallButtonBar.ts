import {HallUI} from "./HallUI"
import {ImageButton} from "../ImageButton"
import {DownloadAppConfirm} from "./confirm_dialog/DownloadAppConfirm"
import {GameLink} from "../GameLink"
import {SoundManager} from "../SoundManager"
const BASE_POS = { x: 0, y: 0 };
export class SmallButtonBar
{
	spr = new createjs.Container();
	private _btnConfig: ImageButton;
	private _weeklyTaskTipAnimation: createjs.Tween;
	private _weeklyTaskNewIcon: createjs.DisplayObject;
	constructor()
	{
		this.spr.set(BASE_POS);
		//let btnConfig = this._btnConfig = new ImageButton(HallUI.getImage('hall/gear'));
		//btnConfig.set({ x: 45, y: 179 });

		/*let downloadButton = new ImageButton(HallUI.instance.getImage('hall/download_button_image'));
		downloadButton.set({ x: 500, y: 179 });
		downloadButton.onClick = () =>
		{
			let dlg = new DownloadAppConfirm({
				onOk: () =>
				{

					this.onClickDownload();
				}
			});
			HallUI.instance.spr.addChild(dlg.spr);
		};*/

		let weekly_task_button = new ImageButton(HallUI.getImage('hall/small_weekly_task_button'));
		weekly_task_button.set({ x: 342, y: 176 });

		let activity_button = new ImageButton(HallUI.getImage('hall/small_activity_button'));
		activity_button.set({ x: 342 + 100, y: 176 });

		//let rank_button = new ImageButton(HallUI.getImage('hall/small_rank_button'));
		//rank_button.set({ x: 140 + 90 + 90, y: 48 });


		let help_button = new ImageButton(HallUI.getImage('hall/small_help_button'));
		help_button.set({ x: 342 + 100 + 100, y: 176 });

		weekly_task_button.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('weekly_task');
		}

		//this.spr.addChild(btnConfig);
		//this.spr.addChild(downloadButton);
		this.spr.addChild(weekly_task_button);
		this.spr.addChild(activity_button);
		//this.spr.addChild(rank_button);
		this.spr.addChild(help_button);

		//btnConfig.image = SoundManager.muted ? HallUI.getImage('hall/sound_off') : HallUI.getImage('hall/sound_on');
		//btnConfig.onClick = () =>
		//{
		//	SoundManager.muted = !SoundManager.muted;
		//	btnConfig.image = SoundManager.muted ? HallUI.getImage('hall/sound_off') : HallUI.getImage('hall/sound_on');
		//}

		activity_button.onClick = () =>
		{
			HallUI.instance.showActivityPanel();
		}

		//rank_button.onClick = () =>
		//{
		//	HallUI.instance.showRankListPanel();
		//}

		help_button.onClick = () =>
		{
			HallUI.instance.showHelp();
		}

		let newTextIcon = weekly_task_button.addIcon(HallUI.instance.getImage('hall/new_text_tip'), { x: -30, y: -25 });
		this._weeklyTaskTipAnimation = createjs.Tween.get(newTextIcon, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
		this._weeklyTaskNewIcon = newTextIcon;

		this.showWeeklyTaskNewIcon(false);
	}

	showWeeklyTaskNewIcon(isshow: boolean)
	{
		this._weeklyTaskNewIcon.visible = isshow;
		this._weeklyTaskTipAnimation.setPaused(!isshow);
	}

	onPanelChanged(type:string)
	{
		if (type === 'match')
		{
			this.spr.y  = 75;
		}
		else
		{
			this.spr.y = 0;
		}
	}

	/*
		private onClickDownload()
		{
			GameLink.instance.sendTriggerEvent('DOWNLOAD_APP_AWARD');
			var agent = navigator.userAgent.toLowerCase();
			if (agent.indexOf("android") >= 0)
			{
				location.href = 'App1.App1.apk';
			}
			else if (agent.indexOf("iphone") >= 0)
			{
				alert('请点击某处，添加到桌面。');
			}
			else
			{
				alert('没有下载，请好自为之。');
			}
		}
	
	*/
} 
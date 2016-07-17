import {HallUI} from "./HallUI"
import {GameLink} from "../GameLink"
import * as PetRules from "../../shared/PetRules"
import {ImageButton} from "../ImageButton"
import {DownloadAppConfirm} from "./confirm_dialog/DownloadAppConfirm"
export class SmallBottomButtonBar
{
	spr = new createjs.Container();
	constructor()
	{
		var spr = this.spr;
		var iconBg = new createjs.Bitmap(HallUI.getImage('hall/bottom_pet_icon_bg'));
		iconBg.set({
			x: 135,
			y: 842,
			regX: iconBg.image.width / 2,
			regY: iconBg.image.height / 2
		});
		spr.addChild(iconBg);

		var petIcon = new createjs.Bitmap(null);
		petIcon.set({
			x: 135,
			y: 842,
		});
		var petImage = null;
		Object.defineProperty(petIcon, 'image', {
			get: () =>
			{
				var pet = GameLink.instance.currentPet;
				if (pet >= 0)
				{
					petImage = HallUI.instance.getPetImage(pet);
				}
				else
				{
					petImage = null;
				}
				return petImage;
			}
		});
		Object.defineProperty(petIcon, 'regX', { get: () => petImage ? petImage.width / 2 : 0 });
		Object.defineProperty(petIcon, 'regY', { get: () => petImage ? petImage.height / 2 : 0 });
		spr.addChild(petIcon);
		//出战
		var outText = new createjs.Bitmap(HallUI.getImage('hall/out_text'));
		outText.set({ x: 114, y: 863 });
		spr.addChild(outText);

		//petname
		var petName = new createjs.Text('', '24px SimHei', '#0d5272');
		petName.set({
			x: 190, y: 808
		});
		Object.defineProperty(petName, 'text', {
			get: () =>
			{
				var pet = GameLink.instance.currentPet;
				if (pet >= 0 && pet < PetRules.PET_NAMES.length)
				{
					return PetRules.PET_NAMES[pet];
				}
				return '';
			}
		})
		spr.addChild(petName);

		//lv text
		var lvText = new createjs.Text('', '24px SimHei', 'white');
		lvText.set({
			x: 190, y: 838
		});
		Object.defineProperty(lvText, 'text', {
			get: () =>
			{
				var pet = GameLink.instance.getPetInfo(GameLink.instance.currentPet);
				if (pet)
				{
					return 'LV.' + pet.level;
				}
				return '';
			}
		});
		spr.addChild(lvText);

		var clickableArea = new createjs.Shape();
		this.spr.addChild(clickableArea);
		{
			var hitArea = new createjs.Shape();
			var g = hitArea.graphics;
			g.beginFill('rgba(0,0,0,0.3)');
			g.drawRect(96, 805, 200, 81);
			g.endFill();
			clickableArea.hitArea = hitArea;
		}


		var petButton = new ImageButton(HallUI.getImage('hall/new_pet_button'));
		petButton.set({
			x: 434, y: 840
		});
		spr.addChild(petButton);

		var downloadButton = new ImageButton(HallUI.getImage('hall/new_download_button'));
		downloadButton.set({
			x: 556, y: 845
		});
		spr.addChild(downloadButton);

		petButton.onClick = () =>
		{
			HallUI.instance._onClickBottomButton('pet');
		}
		downloadButton.onClick = () =>
		{
			let dlg = new DownloadAppConfirm({
				onOk: () =>
				{

					this.onClickDownload();
				}
			});
			HallUI.instance.spr.addChild(dlg.spr);
		}
		clickableArea.on('click', () =>
		{
			HallUI.instance._onClickBottomButton('pet');
		})
	}

	show(isshow: boolean)
	{
		this.spr.visible = !!isshow;
	}

	private onClickDownload()
	{
		GameLink.instance.sendTriggerEvent('DOWNLOAD_APP_AWARD');
		var agent = navigator.userAgent.toLowerCase();
		if (agent.indexOf("android") >= 0)
		{
			location.href = 'App1.App1.apk';
		}
		else if (agent.indexOf("iphone") >= 0 || agent.indexOf("ipad") >= 0)
		{
			addToHomescreen({ startDelay: 0 }).show(true);
		}
		else
		{
			alert('没有下载，请好自为之。');
		}
	}
}

declare var addToHomescreen: any;
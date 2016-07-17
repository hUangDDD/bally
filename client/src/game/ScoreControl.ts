///<reference path="../../typings/tsd.d.ts"/>
import * as GameUtil from "./GameUtil"


const SET_VALUE_DELAY = 1000;

export class ScoreControl
{
	spr:createjs.Text;
	private showValue = 0;
	private realValue = 0;
	private digitTween:createjs.Tween;
	constructor(font)
	{
		this.spr = new createjs.Text('0',font,'white');
		this.spr.textAlign = 'right';
	}
	
	update()
	{

	}
	
	addValue(n,delay?)
	{
		this.realValue += n;
		
		if (this.digitTween)
		{
			this.digitTween.setPaused(true);
			this.digitTween = null;
		}
		let obj = new GameUtil.ScoreTweenHelper(this.showValue,(val)=>{
			this.showValue = val;
			this.spr.text = GameUtil.intToString(this.showValue);
		});
		let tween = this.digitTween = createjs.Tween.get(obj);
		if (delay && delay > 0)
		{
			//tween = tween.wait(delay);
		}
		tween.to({value:this.realValue},SET_VALUE_DELAY);
	}
}




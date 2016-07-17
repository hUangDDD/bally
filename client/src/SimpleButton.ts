///<reference path="../typings/createjs/createjs.d.ts"/>
import * as res from './resource'
const GLOBAL_SCALE = res.GLOBAL_SCALE;
export class SimpleButton extends createjs.Container
{
	static BUTTON_SIZE = {width:100 * GLOBAL_SCALE,height:40 * GLOBAL_SCALE};
	buttondown:boolean = false;
	label:createjs.Text;
	shape:createjs.Shape;
	onclick:Function;
	constructor(text:string)
	{
		super();
		this.addEventListener("mousedown",e=>this.onMouseDown(e as createjs.MouseEvent));
		this.addEventListener("mouseup",e=>this.onMouseUp(e as createjs.MouseEvent));
		this.addEventListener("click",e=>this.onClick());
		this.label = new createjs.Text(text);
		this.shape = new createjs.Shape();
		
		this.addChild(this.shape);
		this.addChild(this.label);
		this.label.x = SimpleButton.BUTTON_SIZE.width / 2;
		this.label.font = `${20 * GLOBAL_SCALE}px Arial`;
		this.label.textAlign = "center";
		this.label.y = (SimpleButton.BUTTON_SIZE.height - this.label.getMeasuredHeight())/2;
		this.repaint();
	}
	private onClick()
	{
		if (this.onclick) this.onclick();
	}
	onMouseDown(e:createjs.MouseEvent)
	{
		this.buttondown = true;
		var stage = this.stage;
		var self = this;
		function func(e) {
			self.removeEventListener("removed",func);
			stage.removeEventListener("stagemouseup",func);
			self.onMouseUp(e as createjs.MouseEvent);
		}
		this.addEventListener("removed",func);
		stage.addEventListener("stagemouseup",func);
		this.repaint();
	}
	onMouseUp(e:createjs.MouseEvent)
	{
		this.buttondown = false;
		this.repaint();
	}
	repaint()
	{
		var g = this.shape.graphics;
		g.clear();
		g.beginStroke("black");
		g.setStrokeStyle(2);
		g.beginFill(this.buttondown?"rgba(255,0,0,0.2)":"rgba(0,255,0,0.2)");
		g.drawRect(0,0,SimpleButton.BUTTON_SIZE.width,SimpleButton.BUTTON_SIZE.height);
		g.endFill();
		g.endStroke();
	}
}
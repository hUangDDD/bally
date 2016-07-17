///<reference path="../../typings/tsd.d.ts"/>
import * as res from "../resource"
export class LineRenderer extends createjs.DisplayObject
{
	lines:{x:number,y:number}[]
	lineWidth = 20;
	constructor()
	{
		super()
		this.lineWidth = 20 * res.GLOBAL_SCALE;
	}
	isVisible()
	{
		return true;
	}
	draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean)
	{
		if (this.lines && this.lines.length >= 2)
		{
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.lineWidth = this.lineWidth;
			for(let i=1;i<this.lines.length;++i)
			{
				let p0 = this.lines[i-1];
				let p1 = this.lines[i];
				let dx = p1.x - p0.x;
				let dy = p1.y - p0.y;
				
				let vLength = Math.sqrt(dx*dx+dy*dy);
				let v = {x:-dy / vLength*this.lineWidth,y:dx / vLength * this.lineWidth};
				
				/*ctx.strokeStyle = grad;
				ctx.beginPath();
				ctx.moveTo(p0.x,p0.y);
				ctx.lineTo(p1.x,p1.y);
				ctx.stroke();*/
				let add = function(a,b){return {x:a.x+b.x,y:a.y+b.y}};
				let sub = function(a,b){return {x:a.x-b.x,y:a.y-b.y}};
				
				{
					let hv = {x:v.x/2,y:v.y/2};
					let v0 = add(p0,hv);
					let v1 = add(p1,hv);
					let v2 = sub(p1,hv);
					let v3 = sub(p0,hv);
					let grad = ctx.createLinearGradient(v2.x,v2.y,v1.x,v1.y);
					grad.addColorStop(0,"rgba(255,255,255,0)");
					grad.addColorStop(0.45,"rgba(3,159,255,1)");
					grad.addColorStop(0.5,"rgba(205,255,255,1)");
					grad.addColorStop(0.55,"rgba(3,159,255,1)");
					grad.addColorStop(1,"rgba(255,255,255,0)");
					ctx.fillStyle = grad;
					
					ctx.beginPath();
					ctx.moveTo(v0.x,v0.y);
					ctx.lineTo(v1.x,v1.y);
					ctx.lineTo(v2.x,v2.y);
					ctx.lineTo(v3.x,v3.y);
				}
				ctx.fill();
			}
			
		}
		return true;
	}
}
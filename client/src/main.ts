///<amd-module name='main'/>
import * as res from "./resource"
import {GameStage} from "./GameStage"
import * as LoginUI from "./LoginUI"
import * as share from "./ShareFunctions"
let canvas: HTMLCanvasElement;
let canvasWrapDiv: HTMLDivElement;
let currentScale = 1;
let onScaleCallbackList = [];
export function addResizeCallback(f: (scale: number) => void)
{
	onScaleCallbackList.push(f);
	window.setTimeout(() => f(currentScale), 0);
}

export function resetSize() 
{
	if (isInputFocus()) return;
	var canvasRatio = res.GraphicConstant.SCREEN_HEIGHT / res.GraphicConstant.SCREEN_WIDTH;
	var windowRatio = window.innerHeight / window.innerWidth;
	var width;
	var height;
	var left = 0;
	var top = 0;
	if (windowRatio < canvasRatio) 
	{
		height = window.innerHeight;
		width = height / canvasRatio;
		left = (window.innerWidth - width) / 2;
	}
	else
	{
		width = window.innerWidth;
		height = width * canvasRatio;
		top = (window.innerHeight - height) / 2;
	}
	currentScale = width / 640;
	LoginUI.setScale(currentScale);
	//canvas.style.position = 'relative';
	canvasWrapDiv.style.width = width + 'px';
	canvasWrapDiv.style.height = height + 'px';
	canvasWrapDiv.style.left = left + 'px';
	canvasWrapDiv.style.top = top + 'px';
	canvasWrapDiv.style.backgroundSize = `${width}px`;
	canvas.style.backgroundSize = `${width}px`;
	for (let f of onScaleCallbackList)
	{
		f(currentScale);
	}
}

export function createOverlayHtml(tag: string)
{
	let elem = document.createElement(tag);
	elem.className = 'contentOnly';
	elem.style.position = 'absolute';
	elem.style.width = '100%';
	elem.style.height = '100%';
	return elem;
}

export function addToTopLayer(elem: HTMLElement)
{
	document.getElementById('canvasWrapper').appendChild(elem);
}

function initHtml() 
{
	canvas = document.getElementsByTagName('canvas')[0];
	canvasWrapDiv = document.getElementById('canvasWrapper') as HTMLDivElement;
	canvas.width = res.GraphicConstant.SCREEN_WIDTH;
	canvas.height = res.GraphicConstant.SCREEN_HEIGHT;
	canvas.style.backgroundColor = 'rgba(0,0,0,0)';
	canvas.style.position = 'absolute';
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	canvasWrapDiv.style.position = 'relative';
	//canvasWrapDiv.style.overflow = 'hidden';
	share.init();
}

window["ballybally_main"] = function ()
{
	$(function ()
	{
		initHtml();
		resetSize();
		window.addEventListener('resize', resetSize);
		$('#canvasWrapper').css('display', '');

		if (navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0)
			createWechatAlertMask();
		else
		{
			new GameStage(canvas);
		}
	})
}

function isInputFocus()
{
	let element = document.activeElement;
	if (element && element.tagName === 'INPUT' && element.getAttribute('type') === 'text')
	{
		return true;
	}
	return false;
}

function createWechatAlertMask()
{
	var div = document.createElement('div');
	$(div).css({
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		position: 'absolute',
		'background-color': 'rgba(0,0,0,0.8)'
	});
	var img = document.createElement('img');
	img.src = "images/111.png";
	$(img).css({
		right: 40,
		top: 20,
		position: 'absolute'
	});
	div.appendChild(img);
	document.body.appendChild(div);
}
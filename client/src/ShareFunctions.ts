///<reference path="../typings/tsd.d.ts"/>
import {GameLink} from "./GameLink"
let isAddBaiduScript = false;
let isAddJiaThisScript = false;
let shareLink = 'http://www.baidu.com';
let shareText = '这游戏不错，进来加个好友一起来玩。';
let defaultShareText = '这游戏不错，进来加个好友一起来玩。';
export function init()
{
	$(".arthref").hide();
	$(".arthref").click(function (e)
	{
		if (e.target && e.target.tagName == 'A') return;
		hideBaidu();
	})
	$("#jiathis_share_layer").click(function (e)
	{
		if (e.target && e.target.tagName == 'A') return;
		hideJiaThis();
	})
}

function getShareText()
{
	return shareText;
}

function getShareLink()
{
	let url = location.protocol + '//' + location.host + location.pathname;
	url += '?from=' + encodeURIComponent(GameLink.instance.key);
	return url;
}

function getShareImage()
{
	return location.protocol + '//' + location.host + location.pathname + '/images/Balls/1.png';
}

export function shareBaidu()
{
	window["_bd_share_config"] = {
		common: {
			bdText: getShareText(),
			bdDesc: getShareText(),
			bdUrl: getShareLink(),
			bdPic: getShareImage(),
			bdSign: "off"
		},
		share: [{
			tag: "share_1",
			bdSize: 32
		}]
	};
	$(".arthref").show();
	if (!isAddBaiduScript)
	{
		isAddBaiduScript = true;
		(document.getElementsByTagName('head')[0] || document.body).appendChild(document.createElement('script'))["src"] = 'http://bdimg.share.baidu.com/static/api/js/share.js?cdnversion=' + ~(-new Date() / 36e5);
	}
}
export function hideBaidu()
{
	$(".arthref").hide();
}

export function shareJiaThis() 
{
	var jiathis_config = {
		url: getShareLink(),
		title: getShareText(),
		summary: '',
		pic: getShareImage(),
		shortUrl: false,
		hideMore: true
	}
	window['jiathis_config'] = jiathis_config;
	if (!isAddJiaThisScript)
	{
		isAddJiaThisScript = true;
		let script = document.createElement('script');
		script.src = 'http://v3.jiathis.com/code_mini/jia.js';
		document.head.appendChild(script);
	}
	$('#jiathis_share_layer').show();
	$(".jiathis_style_32x32").css("padding-left", ((window.innerWidth - 500) * 0.5) + "px").css('padding-top', (window.innerHeight * 0.5 - 60) + 'px');
}

export function hideJiaThis()
{
	$('#jiathis_share_layer').hide();
}

export function share(text?) 
{
	shareText = text || defaultShareText;
	shareJiaThis();
}



window["shareBaidu"] = shareBaidu;
window["hideBaidu"] = hideBaidu;
declare var LmbJsBridge: any;
try
{
	if (self && self['LmbJsBridge'])
	{
		LmbJsBridge.init();
	}
}
catch (e)
{

}
let isSet = false;
export function regShareWhenLogin()
{
	if (isSet) return;
	isSet = true;
	try
	{
		if (self['LmbJsBridge'])
		{
			let url = 'http://ad.lmbang.com/Business-Thirdservice?url=' + encodeURIComponent(getShareLink());
			LmbJsBridge.onShare({
				title: getShareText(),
				content: getShareText() + url,
				img: getShareImage(),
				share_type: 'LMBQ,LMBF,QQF,SNS,WCHATF,WCHATQ,SINA',
				link: url,
				id: ''
			});
		}
	}
	catch (e)
	{
		//alert('share error:' + e);
	}
}
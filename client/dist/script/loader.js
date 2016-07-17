/// <reference path="../../typings/jquery/jquery.d.ts" />
$(function ()
{
	$.getJSON("api/builder/version?q=" + Date.now().toString() + Math.random().toString()).then(function (obj)
	{
		console.log('get version', obj);
		window['_APP_VERSION'] = obj.version;
		window['_APP_VERSION_OBJECT'] = obj;
		getContent(obj.url, obj.version);
	}).fail(function ()
	{
		alert('载入失败');
	})
});

function getContent(url, version)
{
	if (!url) url = "api/builder/content?q=" + version;
	$.getJSON(url).then(function (obj2)
	{
		$("<style>").text(obj2.css).appendTo(document.head);
		document.body.innerHTML = obj2.body;
		//try{(function(){eval(obj2.javascript)})();}catch(e){alert(e);alert(e.stack)}
		$("<script>").text(obj2.javascript).appendTo(document.head);
		//console.log("content", obj2);
	}).fail(function ()
	{
		alert('载入失败!');
	})
}

$(function ()
{
	var bg = new Image();
	bg.src = 'images/海报1.jpg';
	$(bg).css({
		position: 'fixed',
		top: 0,
		left: 0,
	});
	$(document.body).append(bg);
	window['loader_image'] = bg;
	var canvasRatio = 960 / 640;
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
	$(bg).css({
		top: top + 'px',
		left: left + 'px',
		width: width + 'px',
		height: height + 'px'
	});
});
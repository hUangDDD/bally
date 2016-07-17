///<reference path="../typings/tsd.d.ts"/>
window["loginui"] = this;
var currentScale = 1;
export function show() 
{
	$("#login_panel").show();
}

export function hide()
{
	$("#login_panel").hide();
}

export function showInput(bShow: boolean) 
{
	let x = $("#login_input_panel");
	if (bShow) x.show();
	else x.hide();
}

export function setText(text)
{
	$("#login_message").text(text);
	$("#login_msg_bg").css({
		display: text ? 'block' : 'none'
	});
}

export function flyTip(text) 
{
	let px = n => (n * currentScale).toString() + "px";
	var text_margin = 4;
	var text_side_margin = 8;
	$("#login_message").css({
		top: px(443 + text_margin),
		left: px(78 + text_side_margin),
		width: px(457 - text_side_margin * 2),
		height: px(70 - text_margin * 2),
		'text-align': 'center',
		'font-size': px(28)
	});
	$("#login_msg_bg").css({
		top: px(443),
		left: px(78),
		width: px(457),
		height: px(70),
	});

	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var img = document.createElement('img');
	var span = document.createElement('span');
	img.src = 'images/login/错误提示底.png';
	$(span).text(text).css({
		position: 'absolute',
		margin: px(8),
		top: 0,
		left: 0,
	});
	$(img).css({
		position: 'absolute',
		width: '100%',
		height: '100%',
		left: 0,
		top: 0
	});
	$(div2).css({
		width: '100%',
		height: '100%',
		position: 'relative',
	});
	$(div).css({
		position: 'absolute',
		top: px(673),
		left: px(78),
		width: px(457),
		height: px(70),
		'text-align': 'center',
		'font-size': px(28),
		color:'red'
	});
	div2.appendChild(img);
	div2.appendChild(span);
	div.appendChild(div2);
	

	var opacity = 0;
	var top = 700;
	var top2 = 673;
	var top3 = 673 - 100;
	var obj = {};
	div.style.opacity = '0';
	Object.defineProperty(obj, 'opacity', {
		get: () => opacity, set: (val) =>
		{
			opacity = val;
			div.style.opacity = val;
		}
	});
	Object.defineProperty(obj, 'top', {
		get: () => top, set: (val) =>
		{
			top = val;
			div.style.top = px(val);
		}
	})

	createjs.Tween.get(obj).to({ top: top2, opacity: 1 }, 200).wait(1000).to({ top: top3, opacity: 1 }, 200).call(() => { 
		$(div).remove();
	});
	$('#login_panel').append(div);
}
window['flytip'] = flyTip;
export function enableInput(bEnable: boolean) 
{
	let arr = [
		$("#login_username"),
		$("#login_password"),
		$("#login_register_button"),
		$("#login_login_button"),
	];
	for (let x of arr)
	{
		if (!bEnable) x.attr('disabled', "true");
		else x.removeAttr('disabled');
	}
}

export function getUsername()
{
	return $("#login_username").val();
}

export function setUsername(text) 
{
	$("#login_username").val(text);
}
export function getPassword()
{
	return $("#login_password").val();
}

export function setPassword(text) 
{
	$("#login_password").val(text);
}

export function onButtonLogin(func) 
{
	$("#login_login_button").click(func);
}

export function onButtonRegister(func) 
{
	$("#login_register_button").click(func);
}

export function setScale(scale: number)
{
	currentScale = scale;
	let dialog = $("#login_dialog");
	let px = n => (n * scale).toString() + "px";
	let percent = (scale * 100).toString() + '%';
	dialog.css('top', px(234));
	dialog.css('width', px(608));
	dialog.css('height', px(680));
	$("#login_panel img").each((index, elem) =>
	{
		//(elem as HTMLElement).draggable = false;
	})
	/*
	$('#login_username_image').css({
		width: px(109),
		height: px(44),
		top: px(168),
		left: px(45)
	});
	$('#login_password_image').css({
		width: px(105),
		height: px(44),
		top: px(236),
		left: px(45)
	});
*/
	$("#login_username").css({
		width: px(296),
		height: px(38),
		top: px(304),
		left: px(200),
		"font-size": px(32)
	});
	$("#login_password").css({
		width: px(296),
		height: px(38),
		top: px(374),
		left: px(200),
		"font-size": px(32)
	});
	$("#login_register_button").css({
		width: px(220),
		height: px(100),
		top: px(537),
		left: px(73)
	});
	$("#login_login_button").css({
		width: px(220),
		height: px(100),
		top: px(537),
		left: px(304)
	});
	var text_margin = 4;
	var text_side_margin = 8;
	$("#login_message").css({
		top: px(443 + text_margin),
		left: px(78 + text_side_margin),
		width: px(457 - text_side_margin * 2),
		height: px(70 - text_margin * 2),
		'text-align': 'center',
		'font-size': px(28)
	});
	$("#login_msg_bg").css({
		top: px(443),
		left: px(78),
		width: px(457),
		height: px(70),
	});
}
/// <reference path="server/typings/node/node.d.ts" />
var child_process = require('child_process');
var pathjoin = require('path').join;




{
	console.log('开始编译客户端....');
	var ret = child_process.spawnSync('node', ['../node_modules/typescript/bin/tsc'], {
		cwd: pathjoin(__dirname, 'client')
	});
	if (!checkCompileError(ret))
	{
		process.exit(1);
		return;
	}
}

{
	console.log('开始编译服务器端....');
	var ret = child_process.spawnSync('node', ['../node_modules/typescript/bin/tsc'], {
		cwd: pathjoin(__dirname, 'server')
	});
	if (!checkCompileError(ret))
	{
		process.exit(1);
		return;
	}
}

//检查一下spawnSync的返回值，是不是表示编译出错的情况
//如果一切正常返回true
function checkCompileError(ret) 
{
	if (ret.error)
	{
		console.error('执行编译指令出错', ret.error);
	}
	else if (ret.status !== 0)
	{
		console.error('编译出错');
		console.error(ret.stderr.toString());
		console.error(ret.stdout.toString());
	}
	else
	{
		console.log('编译成功');
		return true;
	}
	return false;
}
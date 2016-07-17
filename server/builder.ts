///<reference path="typings/tsd.d.ts"/>
import * as pathlib from "path"
import * as fs from "fs"
import * as chokidar from "chokidar"
import * as crypto from "crypto"
var UglifyJS = require("uglify-js");
const joinpath = pathlib.join;


const BUILD_PATH = joinpath(__dirname, '../../../client/dist/build');
const WATCH_PATH = joinpath(__dirname, '../../../client/dist/');
const IMAGE_PATH = joinpath(__dirname, '../../../client/dist/images');
const BUILD_DELAY = 200;

let watch_file_list: string[] = [];
let webworker_result = "";
let build_result: { body: string, css: string, javascript: string };
let build_version = '';
safeBuild();
function build()
{
	let path = pathlib.resolve(BUILD_PATH);
	let option_file_path = pathlib.join(path, 'buildoption.json');

	watch_file_list = [option_file_path];
	let info = JSON.parse(fs.readFileSync(option_file_path, 'utf8'));

	let body_files = info.body.map(x => pathlib.join(path, x));
	let css_files = info.css.map(x => pathlib.join(path, x));
	let javascript_files = info.javascript.map(x => pathlib.join(path, x));
	let webworker_files = info.webworker.map(x => pathlib.join(path, x));

	watch_file_list = watch_file_list.concat(body_files, css_files, javascript_files, webworker_files);

	let body = concat(body_files);
	let css = concat(css_files);
	let javascript = concat(javascript_files);
	webworker_result = concat(webworker_files);
	javascript += `
	function __GET_GAME_CONFIG()
	{
		return ${JSON.stringify(getBuildConfigObject())};
	}
	`
	webworker_result += `
	function __GET_GAME_CONFIG()
	{
		return ${JSON.stringify(getBuildConfigObject())};
	}
	`

	if (0)
	{
		let options = {
			fromString: true,
			warnings: false,
			mangleProperties: false
		};
		{
			let new_javascript = UglifyJS.minify(javascript, options);
			console.log(`compress javascript from ${javascript.length / 1024}KB to ${new_javascript.code.length / 1024}KB`);
			javascript = new_javascript.code;
		}

		{
			let new_webworker_result = UglifyJS.minify(webworker_result, options);
			console.log(`compress webworker js from ${webworker_result.length / 1024}KB to ${new_webworker_result.code.length / 1024}KB`);
			webworker_result = new_webworker_result.code;
		}
	}



	fs.writeFileSync(joinpath(path, '__bundle.js'), javascript, { encoding: 'utf8' });
	fs.writeFileSync(joinpath(path, '__worker_bundle.js'), webworker_result, { encoding: 'utf8' });
	/*
	javascript += `
	window.FILE_VERSIONS = ${JSON.stringify(genImageVersions())}
	`;*/
	return { body, css, javascript };
}
//这个是游戏相关的内容
function getBuildConfigObject(): any 
{
	let config: any = {};
	let pr = require('../shared/PetRules');
	pr.initConfig(config);
	let wt = require('../shared/WeeklyTaskDefine');
	wt.initConfig(config);
	return config;
}

function concat(arr: string[])
{
	let ret = arr.map(
		name => { return fs.readFileSync(name, 'utf8') }
	);
	return ret.join("\r\n");
}

function safeBuild()
{
	console.log('files changed, start building');
	try
	{
		let _build_result = build();
		let _build_time = Date.now().toString() + Math.random().toString();
		let md5 = crypto.createHash('md5');
		build_result = _build_result;
		md5.update(build_result.body, 'utf8');
		md5.update(build_result.css, 'utf8');
		md5.update(build_result.javascript, 'utf8');
		build_version = md5.digest('hex');
		console.log('build ok. version=', build_version);
	}
	catch (e)
	{
		console.error('build error:', e);
		notifyToBuild();
	}
}

let timer: any = null;
function notifyToBuild() 
{
	if (timer != null)
	{
		clearTimeout(timer);
	}
	timer = setTimeout(() =>
	{
		timer = null;
		safeBuild();
	}, BUILD_DELAY);
}

export function watchAndBuild() 
{
	let watcher = chokidar.watch(WATCH_PATH, {
		useFsEvents: false,
		ignorePermissionErrors: true,
	});
	watcher.on('all', function (event, path)
	{
		if (watch_file_list.indexOf(path) >= 0)
		{
			notifyToBuild();
		}
	});
}

export function getWebWorkerJavascript()
{
	return webworker_result;
}

export function getBuildResult()
{
	return build_result;
}

export function getBuildVersion()
{
	return build_version;
}

if (require.main == module)
{
	build();
	watchAndBuild();
}
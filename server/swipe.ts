///<reference path="typings/tsd.d.ts"/>
import {res as res_define} from '../client/src/hall/HallRes';
import * as fs from 'fs'
var path=require('path').posix;

let files={};
function walk(base, p) {
	var realpath=path.join(base, p);
	var dirList = fs.readdirSync(realpath);
	dirList.forEach(function(item){	
		//var filepath = p+"/"+item;
		var fn=path.join(realpath, item);
		if (fs.statSync(fn).isDirectory()) return walk(base, path.join(p, item));
		files[path.join(p, item)]=1;
	});
}
console.log(__dirname, path.resolve('../../../client/dist/'));
walk(path.resolve('../../../client/dist/'), 'images');

for (let i=0; i<res_define.length; i++) {
	if (files[res_define[i].src]) files[res_define[i].src]='used';
	else {
		console.log('missed', res_define[i].src);
	}
}

for (let n in files) {
	if (files[n]!='used') console.log('unused', n);
}
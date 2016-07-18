"use strict";
///<reference path="typings/tsd.d.ts"/>
const HallRes_1 = require('../client/src/hall/HallRes');
const fs = require('fs');
var path = require('path');
let files = {};
function walk(base, p) {
    var realpath = path.join(base, p);
    var dirList = fs.readdirSync(realpath);
    dirList.forEach(function (item) {
        //var filepath = p+"/"+item;
        var fn = path.join(realpath, item);
        if (fs.statSync(fn).isDirectory())
            return walk(base, path.join(p, item));
        files[path.join(p, item)] = 1;
    });
}
console.log( path.join(__dirname, '../../../client/dist/'));
walk(path.resolve('../../../client/dist/'), 'images/hall');
for (let i = 0; i < HallRes_1.res.length; i++) {
    var src=HallRes_1.res[i].src.replace(/\//g, '\\');
    if (files[src])
        files[src] = 'used';
    else {
        console.log('missed', src);
    }
}
var count=0;
for (let n in files) {
    if (files[n] != 'used') {
        count++;
        console.log('unused', n);
    }
}
console.log(count);

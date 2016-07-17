"use strict";
///<reference path="typings/tsd.d.ts"/>
const http = require("http");
const express = require('express');
const GameServer_1 = require("./GameServer");
const repl = require("repl");
const builder_api = require("./builder.api");
const builder = require("./builder");
const cash = require("./cash");
const bodyParser = require("body-parser");
const jrpc = require("./jrpc");
const ManagerApi = require("./ManagerApi");
var compression = require("compression");
function createExpressApp() {
    var app = express();
    app.use((req, resp, next) => {
        //console.log(`${req.method} ${req.path}`);
        next();
    });
    var mainhtml = 'build/main.html';
    var path = __dirname + '/../../../client/dist';
    app.all('/api/builder/version', builder_api.builder_version_express_handler());
    app.all('/api/builder/content', builder_api.builder_content_express_handler());
    app.get('/api/query_userinfo', ManagerApi.query_user_info_handler());
    app.get('/api/add_mail', ManagerApi.add_mail_handler());
    //下面两个地址，其实其实取决于 builder.api 中的地址
    //app.use(/\/builder\/content\/.*/, compression());
    //app.use(/\/builder\/webworker\/.*/, compression());
    app.all(/\/builder\/content\/.*/, compression(), builder_api.builder_content_express_handler());
    app.all(/\/builder\/webworker\/.*/, compression(), (req, resp) => {
        resp.contentType('application/javascript');
        resp.end(builder.getWebWorkerJavascript());
    });
    app.use(express.static(path, { index: mainhtml }));
    app.all('/payend', bodyParser.urlencoded({ extended: false }), cash.pay_end_express_handler());
    builder.watchAndBuild();
    return app;
}
if (require.main === module) {
    console.log(`
+=================================+
+  帮助内容：                     +
+  --ss=统计服务器地址            +
+  --mongo=mongo数据库服务器地址  +
+  --port=29999                   +
+=================================+	
`);
    let server = http.createServer();
    let app = createExpressApp();
    let gameServer = new GameServer_1.GameServer(server);
    server.on('request', app);
    let port = require("yargs").argv.port;
    if (port) {
        port = parseInt(port);
    }
    port = port | 0;
    if (port === 0)
        port = 29999;
    server.listen(port, function () {
        console.log('server start on ' + port);
        console.log('看看我的ip：' + getLocalIp());
        jrpc.serverData(getLocalIp(), port);
    });
    repl.start({ useGlobal: true });
}
function getLocalIp() {
    function isPrivateIp(ip) {
        var p = ip.split('.');
        var s0 = parseInt(p[0]), s1 = parseInt(p[1]);
        if (s0 == 10)
            return true;
        if (s0 == 172 && s1 >= 16 && s1 < 31)
            return true;
        if (s0 == 192 && s1 == 168)
            return true;
    }
    var localDevice = ['vmware', 'pseudo', 'emulator', 'virtual pc', 'hyper'];
    var os = require('os');
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        if (typeof k === 'string') {
            let k_small = k.toLowerCase();
            for (var i = 0; i < localDevice.length; i++)
                if (k_small.indexOf(localDevice[i]) >= 0)
                    break;
            if (i < localDevice.length)
                continue;
        }
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    var p = [];
    for (let i in addresses) {
        if (isPrivateIp(addresses[i])) {
            p.push(addresses[i]);
            addresses[i] = undefined;
        }
    }
    for (let i = 0; i < addresses.length; i++) {
        if (addresses[i])
            return addresses[i];
    }
    return p[0];
}

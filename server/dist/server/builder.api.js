"use strict";
const builder = require("./builder");
function builder_version_express_handler() {
    return (req, resp) => {
        if (req.method != 'GET' && req.method != 'POST') {
            resp.status(500).json({ errmsg: "unsupported http method" });
            return;
        }
        let version = builder.getBuildVersion();
        let url = 'builder/content/' + version;
        let webworker_url = 'builder/webworker/' + version;
        resp.json({ version: version, url: url, webworker_url: webworker_url });
    };
}
exports.builder_version_express_handler = builder_version_express_handler;
function builder_content_express_handler() {
    return (req, resp) => {
        if (req.method != 'GET' && req.method != 'POST') {
            resp.status(500).json({ errmsg: "unsupported http method" });
            return;
        }
        resp.removeHeader('cache-control');
        resp.set('max-age', '3600');
        resp.set('etag', builder.getBuildVersion().toString());
        resp.json(builder.getBuildResult());
    };
}
exports.builder_content_express_handler = builder_content_express_handler;

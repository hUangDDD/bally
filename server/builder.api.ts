import * as builder from "./builder"
import * as express from "express"
export function builder_version_express_handler(): express.RequestHandler
{
	return (req, resp) =>
	{
		if (req.method != 'GET' && req.method != 'POST')
		{
			resp.status(500).json({ errmsg: "unsupported http method" });
			return;
		}
		let version = builder.getBuildVersion();
		let url = 'builder/content/' + version;
		let webworker_url = 'builder/webworker/' + version;
		resp.json({ version, url, webworker_url });
	}
}

export function builder_content_express_handler(): express.RequestHandler
{
	return (req, resp) =>
	{
		if (req.method != 'GET' && req.method != 'POST')
		{
			resp.status(500).json({ errmsg: "unsupported http method" });
			return;
		}
		resp.removeHeader('cache-control');
		resp.set('max-age', '3600');
		resp.set('etag', builder.getBuildVersion().toString());
		resp.json(builder.getBuildResult());
	}
}
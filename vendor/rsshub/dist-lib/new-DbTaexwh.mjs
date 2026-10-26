import "./types-DNj6Etbg.mjs";
import { n as baseUrl, r as processItems, t as apiBaseUrl } from "./util-xeUCn-9A.mjs";
//#region lib/routes/tmtpost/new.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("new", baseUrl).href;
	const listApiUrl = new URL("v1/lists/new", apiBaseUrl).href;
	return await processItems(limit, {}, listApiUrl, targetUrl);
};
const route = {
	path: "/new",
	name: "最新",
	url: "www.tmtpost.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/tmtpost/new",
	parameters: void 0,
	description: void 0,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.tmtpost.com"],
		target: "/new"
	}],
	view: 0
};
//#endregion
export { handler, route };

import "./types-DNj6Etbg.mjs";
import { r as processItems, t as baseUrl } from "./util-n4gNRv9n.mjs";
//#region lib/routes/gcores/videos.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("videos", baseUrl).href;
	const apiUrl = new URL("gapi/v1/videos", baseUrl).href;
	return await processItems(limit, {
		"page[limit]": limit,
		sort: "-published-at",
		include: "category,user,media",
		"filter[list-all]": 1
	}, apiUrl, targetUrl);
};
const route = {
	path: "/videos",
	name: "视频",
	url: "www.gcores.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/gcores/videos",
	parameters: void 0,
	description: void 0,
	categories: ["game"],
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
		source: ["www.gcores.com/videos"],
		target: "/gcores/videos"
	}],
	view: 3
};
//#endregion
export { handler, route };

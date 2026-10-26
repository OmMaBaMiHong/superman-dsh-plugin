import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { r as baseUrl, t as ProcessFeedItems } from "./util-DNrH-n99.mjs";
import { load } from "cheerio";
//#region lib/routes/dgtle/feed.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("feed", baseUrl).href;
	const apiUrl = new URL("feed/getHotDynamic", baseUrl).href;
	const response = await rofetch(apiUrl, { query: { last_id: 0 } });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const items = ProcessFeedItems(limit, response.data.dataList, $);
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: $("meta[name=\"keywords\"]").attr("content")?.split(/,/, 1)[0] ?? void 0,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/feed",
	name: "兴趣",
	url: "www.dgtle.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/dgtle/feed",
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
		source: ["www.dgtle.com/feed"],
		target: "/feed"
	}],
	view: 0
};
//#endregion
export { handler, route };

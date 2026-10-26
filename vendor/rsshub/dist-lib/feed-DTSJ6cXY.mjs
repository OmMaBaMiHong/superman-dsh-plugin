import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as rootUrl, t as ProcessItems } from "./utils-DlON7c1Q.mjs";
import { load } from "cheerio";
//#region lib/routes/yicai/feed.ts
const route = {
	path: "/feed/:id?",
	categories: ["traditional-media"],
	example: "/yicai/feed/669",
	parameters: { id: "主题 id，可在对应主题页中找到，默认为一财早报" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["yicai.com/feed/:id", "yicai.com/feed"],
		target: "/feed/:id"
	}],
	name: "关注",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
全部主题词见 [此处](https://www.yicai.com/feed/alltheme)
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "669";
	const currentUrl = `${rootUrl}/feed/${id}`;
	const apiUrl = `${rootUrl}/api/ajax/getlistbytid?id=${id}&page=0&pagesize=${ctx.req.query("limit") ?? 30}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = await ProcessItems(apiUrl);
	return {
		title: `第一财经主题 - ${$("title").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

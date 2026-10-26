import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as rootUrl, t as ProcessItems } from "./utils-DlON7c1Q.mjs";
import { load } from "cheerio";
//#region lib/routes/yicai/vip.ts
const route = {
	path: "/vip/:id?",
	categories: ["traditional-media"],
	example: "/yicai/vip/428",
	parameters: { id: "频道 id，可在对应频道页中找到，默认为一元点金" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["yicai.com/vip/product/:id", "yicai.com/"],
		target: "/vip/:id"
	}],
	name: "VIP 频道",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "428";
	const currentUrl = `${rootUrl}/vip/product/${id}`;
	const apiUrl = `${rootUrl}/api/ajax/getlistbypid?id=${id}&type=3&page=1&pagesize=${ctx.req.query("limit") ?? 30}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = await ProcessItems(apiUrl);
	return {
		title: `第一财经VIP频道 - ${$("title").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

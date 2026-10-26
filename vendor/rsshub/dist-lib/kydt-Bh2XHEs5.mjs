import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/xmu/kydt.ts
const route = {
	path: "/kydt",
	categories: ["university"],
	example: "/xmu/kydt",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["soe.xmu.edu.cn/kxyj/kydt.htm"] }],
	name: "科研动态",
	maintainers: ["linsenwang"],
	handler
};
async function handler() {
	const host = "https://soe.xmu.edu.cn/kxyj/kydt.htm";
	const $ = load(await rofetch(host));
	const list = $("div.news li").toArray().map((item) => {
		item = $(item);
		const title = item.find("h4").first().text();
		const time = item.find("h6").first().text();
		const a = item.find("a").first().attr("href");
		return {
			title,
			link: new URL(a, host).href,
			pubDate: time
		};
	});
	return {
		allowEmpty: true,
		title: "厦门大学经济学院科研动态",
		link: host,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))(".v_news_content").first().html();
			return item;
		})))
	};
}
//#endregion
export { route };

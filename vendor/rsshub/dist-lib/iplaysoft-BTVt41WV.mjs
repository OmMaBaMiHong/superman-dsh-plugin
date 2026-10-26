import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/iplaysoft/index.ts
const handler = async (ctx) => {
	const feed = await parser.parseURL("https://feed.iplaysoft.com");
	const limit = Number(ctx.req.query("limit") || "20");
	const filteredItems = feed.items.filter((item) => {
		if (!item?.link || !item?.pubDate) return false;
		return new URL(item.link).hostname.match(/.*\.iplaysoft\.com$/);
	}).slice(0, limit);
	return {
		title: "异次元软件世界",
		description: "软件改变生活",
		language: "zh-CN",
		link: "https://www.iplaysoft.com",
		item: await Promise.all(filteredItems.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			$(".entry-content").find("div[style*=\"overflow:hidden\"]").remove();
			return {
				title: item.title,
				description: $(".entry-content").html(),
				link: item.link,
				author: item.author,
				pubDate: parseDate(item.pubDate)
			};
		})))
	};
};
const route = {
	path: "/",
	name: "首页",
	url: "www.iplaysoft.com",
	maintainers: [
		"williamgateszhao",
		"cscnk52",
		"LokHsu"
	],
	handler,
	example: "/iplaysoft",
	parameters: {},
	categories: ["program-update"],
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
		source: ["www.iplaysoft.com"],
		target: "/"
	}],
	view: 0
};
//#endregion
export { handler, route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/jandan/index.ts
const route = {
	path: "/",
	example: "/jandan",
	name: "Feed",
	maintainers: [
		"nczitzk",
		"bigfei",
		"pseudoyu"
	],
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["i.jandan.net"],
		target: "/jandan"
	}],
	handler
};
async function handler() {
	const rootUrl = "http://i.jandan.net";
	const feed = await parser.parseURL(`${rootUrl}/feed/`);
	return {
		title: "煎蛋",
		link: rootUrl,
		item: await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link || "", async () => {
			if (!item.link) return;
			const $ = load(await rofetch(item.link));
			$(".wechat-hide").prev().nextAll().remove();
			$("img").replaceWith((i, e) => {
				const src = $(e).attr("src");
				const alt = $(e).attr("alt");
				return `<img src="${src?.replace(/https?:\/\/(\w+)\.moyu\.im/, "https://$1.sinaimg.cn")}" alt="${alt}">`;
			});
			return {
				title: item.title || "",
				description: $(".entry").html() || "",
				pubDate: item.pubDate,
				link: item.link,
				author: item["dc:creator"],
				category: item.categories
			};
		})))
	};
}
//#endregion
export { route };

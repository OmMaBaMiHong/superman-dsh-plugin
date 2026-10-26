import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/nsd.ts
const baseUrl = "https://nsd.pku.edu.cn/sylm/gd/";
const pageType = (href) => {
	if (!href.startsWith("http")) return "in-site";
	const url = new URL(href);
	if (url.hostname === "mp.weixin.qq.com") return "wechat-mp";
	if (url.hostname === "news.pku.edu.cn") return "pku-news";
	return "unknown";
};
const route = {
	path: "/nsd/gd",
	categories: ["university"],
	example: "/pku/nsd/gd",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nsd.pku.edu.cn/"] }],
	name: "观点 - 国家发展研究院",
	maintainers: ["MisLink"],
	handler,
	url: "nsd.pku.edu.cn/"
};
async function handler() {
	const $ = load((await got_default(baseUrl)).data);
	const list = $("div.maincontent > ul > li").toArray().map((item) => {
		const href = $(item).find("a").attr("href");
		const type = pageType(href);
		return {
			title: $(item).find("a").text().trim(),
			link: type === "in-site" ? baseUrl + href : href,
			pubDate: parseDate($(item).find("span").first().text(), "YYYY-MM-DD"),
			type
		};
	});
	const items = await Promise.all(list.map((item) => {
		switch (item.type) {
			case "wechat-mp": return finishArticleItem(item);
			case "pku-news": return cache_default.tryGet(item.link, async () => {
				item.description = load((await got_default(item.link)).data)("div.pageArticle > div.col.lf").html();
				return item;
			});
			case "in-site": return cache_default.tryGet(item.link, async () => {
				item.description = load((await got_default(item.link)).data)("div.article").html();
				return item;
			});
			default: return item;
		}
	}));
	return {
		title: "观点 - 北京大学国家发展研究院",
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };

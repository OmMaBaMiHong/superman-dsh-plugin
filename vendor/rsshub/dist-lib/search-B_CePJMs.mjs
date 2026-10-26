import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/guangdiu/search.ts
const host = "https://guangdiu.com";
const route = {
	path: "/search/:query?",
	categories: ["shopping"],
	example: "/guangdiu/search/q=百度网盘",
	parameters: { query: "链接参数，对应网址问号后的内容" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "关键字搜索",
	maintainers: ["Huzhixin00"],
	handler
};
async function handler(ctx) {
	const query = ctx.req.param("query") ?? "";
	const url = `${host}/${query ? `search.php?${query}` : ""}`;
	const $ = load((await got_default(url)).data);
	const list = $("#mainleft > div.zkcontent > div.gooditem").toArray().map((item) => ({
		title: $(item).find("a.goodname").text().trim(),
		link: `${host}/${$(item).find("a.goodname").attr("href")}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.description = $("#dabstract").html() + $("a.dgotobutton").html("前往购买");
		item.pubDate = parseRelativeDate($("span.latesttime").text());
		return item;
	})));
	return {
		title: `逛丢 - ${/q=(.+)/.exec(query)[1]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };

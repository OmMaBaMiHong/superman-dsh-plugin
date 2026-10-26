import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/guangdiu/cheaps.ts
const host = "https://guangdiu.com";
const route = {
	path: "/cheaps/:query?",
	categories: ["shopping"],
	example: "/guangdiu/cheaps/k=clothes",
	parameters: { query: "链接参数，对应网址问号后的内容" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "九块九",
	maintainers: ["fatpandac"],
	handler
};
async function handler(ctx) {
	const query = ctx.req.param("query") ?? "";
	const url = `${host}/cheaps.php${query ? `?${query}` : ""}`;
	const $ = load((await got_default(url)).data);
	return {
		title: "逛丢 - 九块九",
		link: url,
		item: $("div.cheapitem.rightborder").toArray().map((item) => ({
			title: $(item).find("div.cheaptitle").text().trim() + $(item).find("a.cheappriceword").text(),
			link: $(item).find("a.cheappriceword").attr("href"),
			description: $(item).find("div.cheapimga").html(),
			pubDate: parseRelativeDate($(item).find("span.cheapaddtimeword").text())
		}))
	};
}
//#endregion
export { route };

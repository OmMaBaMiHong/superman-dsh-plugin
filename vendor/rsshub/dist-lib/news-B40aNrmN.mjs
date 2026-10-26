import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/aqara/news.ts
const route = {
	path: "/cn/news",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 35;
	const rootUrl = "https://www.aqara.cn";
	const currentUrl = new URL("news", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = response.match(/(parm\.newsTitle[\s\S]*?arr\.push\(parm\))/g).slice(0, limit).map((item) => ({
		title: item.match(/parm\.newsTitle = '(.*?)'/)[1],
		link: new URL(item.match(/parm\.contentHerf = '(\d+)'/)[1], rootUrl).href,
		pubDate: parseDate(item.match(/parm\.issueTime = '(.*?)'/)[1], "YYYY  年  MM  月  DD  日")
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("h4.fnt_56").last().text();
		item.description = content("div.news_body").html();
		item.pubDate = parseDate(content("div.news_date").first().text(), "YYYY  年  MM  月  DD  日");
		return item;
	})));
	const icon = $("link[rel=\"shortcut icon\"]").prop("href").split("?", 1)[0];
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh-cn",
		image: $("meta[property=\"og:image\"]").prop("content"),
		icon,
		logo: icon,
		author: $("meta[name=\"author\"]").prop("content")
	};
}
//#endregion
export { route };

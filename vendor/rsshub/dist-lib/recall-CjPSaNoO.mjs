import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qiche365/recall.ts
const baseUrl = "https://www.qiche365.org.cn";
const route = {
	path: "/recall/:channel",
	name: "汽车召回",
	example: "/qiche365/recall/1",
	parameters: { channel: "频道，见下表" },
	description: `| 国内召回新闻 | 国内召回公告 | 国外召回新闻 | 国外召回公告 |
| ------------ | ------------ | ------------ | ------------ |
| 1            | 2            | 3            | 4            |`,
	categories: ["government"],
	features: { antiCrawler: true },
	maintainers: ["huanfe1", "pseudoyu"],
	handler,
	url: "qiche365.org.cn/index/recall/index.html"
};
async function handler(ctx) {
	const { channel } = ctx.req.param();
	const targetUrl = `${baseUrl}/index/recall/index/item/${channel}.html?loadmore=1`;
	const { html } = await rofetch(targetUrl, { headers: {
		"Accept-Language": "zh-CN,zh;q=0.9",
		Cookie: ((await rofetch.raw(targetUrl, {
			headers: { "Accept-Language": "zh-CN,zh;q=0.9" },
			ignoreResponseError: true
		})).headers.getSetCookie?.() || []).map((c) => c.split(";", 1)[0]).join("; ")
	} });
	const $ = load(html);
	const items = $("li").toArray().map((item) => {
		const cheerioItem = $(item);
		return {
			title: cheerioItem.find("h1").text(),
			link: `${baseUrl}${cheerioItem.find("a").attr("href")}`,
			pubDate: timezone(parseDate(cheerioItem.find("h2").html().match("</i>(.*?)<b>")[1]), 8),
			description: cheerioItem.find("p").text().trim(),
			author: cheerioItem.find("h3 span").text(),
			image: cheerioItem.find("img").attr("src") && `${baseUrl}${cheerioItem.find("img").attr("src")}`
		};
	});
	return {
		title: [
			"国内召回新闻",
			"国内召回公告",
			"国外召回新闻",
			"国外召回公告"
		][Number(channel) - 1],
		link: `${baseUrl}/index/recall/index.html`,
		item: items,
		language: "zh-CN"
	};
}
//#endregion
export { route };

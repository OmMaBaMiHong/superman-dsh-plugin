import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/guizhou/jyt.ts
const route = {
	path: "/jyt/tzgg",
	categories: ["government"],
	example: "/gov/guizhou/jyt/tzgg",
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
		source: ["jyt.guizhou.gov.cn/zwgk/tzgg/", "jyt.guizhou.gov.cn/zwgk/tzgg/index.html"],
		target: "/jyt/tzgg"
	}],
	name: "教育厅 - 通知公告",
	maintainers: ["sheetung"],
	handler,
	url: "jyt.guizhou.gov.cn/zwgk/tzgg/",
	description: "贵州省教育厅官方网站通知公告 RSS 源"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const baseUrl = "https://jyt.guizhou.gov.cn";
	const currentUrl = `${baseUrl}/zwgk/tzgg/`;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const list = $(".NewsList li:not(.b)").toArray().slice(0, limit).map((item) => {
		const $item = $(item);
		const $link = $item.find("a");
		const title = $link.attr("title") || $link.text().trim();
		const link = $link.attr("href") || "";
		const dateText = $item.find("span").text().trim();
		return {
			title,
			link: link.startsWith("http") ? link : new URL(link, baseUrl).href,
			pubDate: parseDate(dateText)
		};
	});
	return {
		title: "贵州省教育厅 - 通知公告",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: detailResponse } = await got_default(item.link);
			const $$ = load(detailResponse);
			const pubDate = $$("meta[name=\"PubDate\"]").attr("content");
			const author = $$("meta[name=\"ContentSource\"]").attr("content") || "贵州省教育厅";
			return {
				...item,
				author,
				pubDate: pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate,
				description: $$(".trs_editor_view").html() || $$(".TRS_UEDITOR").html()
			};
		}))),
		description: "贵州省教育厅门户网站通知公告"
	};
}
//#endregion
export { route };

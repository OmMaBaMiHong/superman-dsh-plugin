import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/zhengce/index.ts
const route = {
	path: "/:category{.+}?",
	categories: ["government"],
	example: "/gov/zhengce",
	parameters: { category: "分类，见下表，默认为最新" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.gov.cn/zhengce/*category"],
		target: "/:category"
	}],
	name: "政策",
	maintainers: ["nczitzk"],
	handler,
	url: "www.gov.cn/zhengce/",
	description: `| 最新政策 | 政策解读 | 图解政策    |
| -------- | -------- | ----------- |
| zuixin   | jiedu    | jiedu/tujie |`
};
async function handler(ctx) {
	const { category = "zuixin" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const rootUrl = "https://www.gov.cn";
	const currentUrl = new URL(`zhengce/${category.replace(/\/$/, "")}/`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("h4 a, div.subtitle a[title]").toArray().map((item) => {
		item = $(item);
		const link = item.prop("href");
		return {
			title: item.text(),
			link: link.startsWith("http") ? link : new URL(link, currentUrl).href
		};
	});
	items = await Promise.all(items.filter((item) => /https?:\/\/www\.gov\.cn\/zhengce.*content_\d+\.htm/.test(item.link)).slice(0, limit).map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		const processElementText = (el) => content(el).text().split(/：/).pop().trim() || content(el).next().text().trim();
		const author = content("meta[name=\"author\"]").prop("content");
		const agencyEl = content("table.bd1").find("td").toArray().findLast((a) => content(a).text().startsWith("发文机关"));
		const sourceEl = content("span.font-zyygwj").toArray().findLast((a) => content(a).text().startsWith("来源"));
		const subjectEl = content("table.bd1").find("td").toArray().findLast((a) => content(a).text().startsWith("主题分类"));
		const agency = agencyEl ? processElementText(agencyEl) : void 0;
		const source = sourceEl ? processElementText(sourceEl) : void 0;
		const subject = subjectEl ? processElementText(subjectEl) : content("td.zcwj_ztfl").text();
		const column = content("meta[name=\"lanmu\"]").prop("content");
		const keywords = content("meta[name=\"keywords\"]").prop("content")?.split(/;|,/) ?? [];
		const manuscriptId = content("meta[name=\"manuscriptId\"]").prop("content");
		item.title = content("div.share-title").text() || item.title;
		item.description = content("div.TRS_UEDITOR").first().html() || content("div#UCAP-CONTENT, td#UCAP-CONTENT").first().html();
		item.author = [
			agency,
			source,
			author
		].filter(Boolean).join("/");
		item.category = [...new Set([
			subject,
			column,
			...keywords
		].filter(Boolean))];
		item.guid = `gov-zhengce-${manuscriptId}`;
		item.pubDate = timezone(parseDate(content("meta[name=\"firstpublishedtime\"]").prop("content"), "YYYY-MM-DD-HH:mm:ss"), 8);
		item.updated = timezone(parseDate(content("meta[name=\"lastmodifiedtime\"]").prop("content"), "YYYY-MM-DD-HH:mm:ss"), 8);
		return item;
	})));
	const image = new URL($("img.wordlogo").prop("src"), rootUrl).href;
	const icon = new URL($("link[rel=\"icon\"]").prop("href"), rootUrl).href;
	const subtitle = $("meta[name=\"lanmu\"]").prop("content");
	const author = $("div.header_logo a[aria-label]").prop("aria-label");
	return {
		item: items,
		title: author && subtitle ? `${author} - ${subtitle}` : $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh-CN",
		image,
		icon,
		logo: icon,
		subtitle,
		author
	};
}
//#endregion
export { route as n, handler as t };

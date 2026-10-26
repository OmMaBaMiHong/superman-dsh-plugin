import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sspu/pe.ts
const route = {
	path: "/pe/:id?",
	radar: [{
		source: ["pe2016.sspu.edu.cn/:id/list.htm"],
		target: "/pe/:id"
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const { id = "342" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://pe2016.sspu.edu.cn";
	const currentUrl = new URL(`${id}/list.htm`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("table.wp_article_list_table a[title]").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.prop("href"), rootUrl).href,
			pubDate: parseDate(item.prev().text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.endsWith("htm")) {
			const { data: detailResponse } = await got_default(item.link);
			const content = load(detailResponse);
			const info = content("div.time").text();
			item.title = content("div.title").text();
			item.description = content("div.wp_articlecontent").html();
			item.author = info.match(/来源：(.*?)\s/)?.[1] ?? void 0;
			item.pubDate = info.match(/发布时间：(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s/)?.[1] ?? void 0;
		}
		return item;
	})));
	const author = "上海第二工业大学";
	const subtitle = $("title").text();
	const icon = new URL($("link[rel=\"shortcut icon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title: `${author} - ${subtitle}`,
		link: currentUrl,
		description: $("div.tyb_headtitle1").text(),
		language: $("html").prop("lang"),
		icon,
		logo: icon,
		subtitle,
		author
	};
}
//#endregion
export { route };

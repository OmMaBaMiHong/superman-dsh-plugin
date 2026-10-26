import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sspu/jwc.ts
const route = {
	path: "/jwc/:listId",
	radar: [{ source: ["jwc.sspu.edu.cn/jwc/:listId/list.htm"] }],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const listId = ctx.req.param("listId");
	const baseUrl = "https://jwc.sspu.edu.cn";
	const { data: response, url: link } = await got_default(`${baseUrl}/${listId}/list.htm`);
	const $ = load(response);
	const list = $(".news_list .news").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15).toArray().map((item) => {
		item = $(item);
		const title = item.find(".news_title a");
		return {
			title: title.attr("title"),
			link: `${baseUrl}${title.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.description = $(".wp_articlecontent").html();
		item.pubDate = timezone(parseDate($(".arti_update").text(), "YYYY-MM-DD HH:mm:ss"), 8);
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/gx/card.ts
const rootUrl = "http://news.hrbeu.edu.cn";
const route = {
	path: "/gx/card/:column/:id?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const column = ctx.req.param("column");
	const id = ctx.req.param("id") || "";
	const toUrl = id === "" ? `${rootUrl}/${column}.htm` : `${rootUrl}/${column}/${id}.htm`;
	const $ = load((await got_default(toUrl, { headers: { Referer: rootUrl } })).data);
	const bigTitle = $("div.list-left-tt").text().replaceAll(/[\n\r ]/g, "");
	const card = $("li.clearfix").toArray().map((item) => ({
		title: $(item).find("div.list-right-tt").text(),
		pubDate: parseDate($(item).find(".news-date-li").text(), "DDYYYY-MM"),
		link: $(item).find("a").attr("href"),
		description: $(item).find("div.list-right-p").text()
	}));
	return {
		title: "工学-" + bigTitle,
		link: toUrl,
		item: card
	};
}
//#endregion
export { route };

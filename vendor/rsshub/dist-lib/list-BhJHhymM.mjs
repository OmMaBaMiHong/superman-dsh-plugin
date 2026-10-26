import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/gx/list.ts
const rootUrl = "http://news.hrbeu.edu.cn";
const route = {
	path: "/gx/list/:column/:id?",
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
	const list = $("li.txt-elise").toArray().map((item) => {
		let link = $(item).find("a").attr("href");
		if (link.includes("info") && id !== "") link = new URL(link, rootUrl).href;
		if (link.includes("info") && id === "") link = `${rootUrl}/${link}`;
		return {
			title: $(item).find("a").attr("title"),
			pubDate: parseDate($(item).find("span").text()),
			link
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.includes("info")) item.description = load((await got_default(item.link)).data)("div.v_news_content").html();
		else item.description = "本文需跳转，请点击标题后阅读";
		return item;
	})));
	return {
		title: "工学-" + bigTitle,
		link: toUrl,
		item: items
	};
}
//#endregion
export { route };

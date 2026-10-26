import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/inoreader/index.ts
const route = {
	path: "/html_clip/:user/:tag",
	example: "/inoreader/html_clip/1005137674/user-favorites",
	categories: ["reading"],
	view: 0,
	name: "HTML Clip",
	maintainers: ["EthanWng97"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.inoreader.com/stream/user/${ctx.req.param("user")}/tag/${ctx.req.param("tag")}/view/html?n=${ctx.req.query("limit") || 20}`;
	const data = (await got_default({
		method: "get",
		url: currentUrl
	})).data;
	const $ = load(data);
	const entries = $("#snip_body>.article_content");
	return {
		title: $(".header_text").text().trim(),
		link: currentUrl,
		item: entries.toArray().map((item) => {
			const content = $(item).clone();
			const header = $(item).prev();
			const pubDate = $("div.article_author .au1", header).contents().filter((_, e) => e.nodeType === 3).text().replace(/posted (on|at) /, "").replace(/UTC.*/, "");
			return {
				title: $("a.title_link", header).text().trim(),
				link: $("a.title_link", header).attr("href"),
				author: $("div.article_author span span", header).text().trim() + " via " + $("div.article_author a.feed_link", header).text().trim(),
				pubDate: parseDate(pubDate, ["MMM DD YYYY HH:mm:ss", "HH:mm:ss"]),
				description: $(content).html()
			};
		}),
		allowEmpty: true
	};
}
//#endregion
export { route };

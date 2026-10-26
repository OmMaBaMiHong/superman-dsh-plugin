import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/darwinawards/index.ts
const route = {
	name: "Award Winners",
	example: "/darwinawards",
	path: "/",
	radar: [{ source: ["darwinawards.com/darwin", "darwinawards.com/"] }],
	maintainers: ["zoenglinghou", "nczitzk"],
	handler,
	url: "darwinawards.com/darwin"
};
async function handler() {
	const currentUrl = `https://darwinawards.com/darwin/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".cameo").remove();
	$(".topvote_title_desc, .topvote_title_minimal, .topvote_minimal").each((_, el) => {
		$(el).find("a").first().remove();
	});
	let items = $("#article_index a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("h2, nav, footer, table, form").remove();
		item.description = content("article").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

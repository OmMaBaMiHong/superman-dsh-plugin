import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/last-origin/news.ts
const route = {
	path: "/news",
	name: "News",
	url: "www.last-origin.com",
	maintainers: ["gudezhi"],
	example: "/last-origin/news",
	parameters: {},
	categories: ["game"],
	features: { supportRadar: true },
	radar: [{
		source: ["www.last-origin.com/news.html", "www.last-origin.com"],
		target: "/news"
	}],
	handler,
	description: ""
};
async function handler() {
	const baseUrl = "https://www.last-origin.com/news.html";
	const $ = load(await rofetch(baseUrl));
	const list = $(".contents .news_wrap").toArray().map((item) => {
		return {
			title: $(item).find(".news_title").text().trim(),
			link: new URL($(item).find("a").attr("href"), baseUrl).href,
			pubDate: timezone(parseDate($(item).find("time").text().trim()), 9),
			description: ""
		};
	});
	return {
		title: "LastOrigin官网公告",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))(".news_contents_editor").html() ?? "";
			return item;
		})))
	};
}
//#endregion
export { route };

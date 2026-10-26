import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/thinkingmachines/news.ts
const route = {
	path: "/news",
	name: "News",
	url: "thinkingmachines.ai/news",
	maintainers: ["w3nhao"],
	example: "/thinkingmachines/news",
	categories: ["programming"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false
	},
	radar: [{
		source: ["thinkingmachines.ai/news", "thinkingmachines.ai/news/"],
		target: "/news"
	}],
	handler
};
async function handler() {
	const baseUrl = "https://thinkingmachines.ai";
	const listUrl = `${baseUrl}/news/`;
	const $ = load(await rofetch(listUrl));
	const items = $("main li a").toArray().map((el) => {
		const $el = $(el);
		const title = $el.find(".post-title").text().trim();
		const dateStr = $el.find("time.desktop-time").text().trim();
		const href = $el.attr("href") || "";
		return {
			title,
			dateStr,
			link: href.startsWith("http") ? href : `${baseUrl}${href}`
		};
	}).filter((item) => item.title && item.link);
	return {
		title: "Thinking Machines Lab - News",
		link: listUrl,
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			const $article = load(await rofetch(item.link));
			$article("nav, footer, header, script, style").remove();
			$article(".post-heading, #post-prev-link, #post-next-link").remove();
			const description = $article("main").html()?.trim() || "";
			return {
				title: item.title,
				link: item.link,
				pubDate: parseDate(item.dateStr, "MMM D, YYYY"),
				description
			};
		})))
	};
}
//#endregion
export { route };

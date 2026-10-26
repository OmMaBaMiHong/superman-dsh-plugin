import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/telegram/blog.ts
const route = {
	path: "/blog",
	categories: ["social-media"],
	view: 0,
	example: "/telegram/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["telegram.org/blog"] }],
	name: "Telegram Blog",
	maintainers: ["fengkx"],
	handler,
	url: "telegram.org/blog"
};
async function handler() {
	const link = "https://telegram.org/blog";
	const res = await rofetch(link);
	const $$ = cheerio.load(res);
	const items = await Promise.all($$(".dev_blog_card_link_wrap").toArray().map((each) => {
		const link = "https://telegram.org" + $$(each).attr("href");
		return cache_default.tryGet(link, async () => {
			const result = await rofetch(link);
			const $ = cheerio.load(result);
			return {
				title: $("#dev_page_title").text(),
				link,
				pubDate: parseDate($("[property=\"article:published_time\"]").attr("content")),
				description: $("#dev_page_content_wrap").html()
			};
		});
	}));
	return {
		title: $$("title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };

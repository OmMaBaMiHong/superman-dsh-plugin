import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/reuters/investigates.ts
const route = {
	path: "/investigates",
	categories: ["traditional-media"],
	view: 0,
	example: "/reuters/investigates",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Inverstigates",
	maintainers: ["LyleLee"],
	handler
};
async function handler() {
	const currentUrl = `https://www.reuters.com/investigates/`;
	const $ = load((await got_default(currentUrl)).data);
	const list = $("article.section-article-container.row").toArray().map((item) => ({
		title: $(item).find("h2.subtitle").text(),
		link: $(item).find("a.row.d-flex").prop("href")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		item.title = content("title").text();
		item.description = content("article.special-report").html();
		item.pubDate = parseDate(content("time[itemprop=\"datePublished\"]").attr("datetime"));
		item.author = content("meta[property=\"og:article:publisher\"]").attr("content");
		return item;
	})));
	return {
		title: $("h1.series-subtitle").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

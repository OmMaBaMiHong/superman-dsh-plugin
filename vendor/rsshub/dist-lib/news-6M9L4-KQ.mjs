import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/duckdb/news.ts
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/duckdb/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["mocusez"],
	handler
};
async function handler() {
	const baseUrl = "https://duckdb.org/news/";
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	const list = $(".postpreview").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h3").text().trim(),
			link: `https://duckdb.org${item.find("a.blocklink").attr("href")}`,
			pubDate: timezone(parseDate(item.find(".date").text(), "YYYY-MM-DD"), 0),
			author: item.find(".author").text().trim()
		};
	});
	return {
		title: "DuckDB News",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default(item.link)).body)(".contentwidth").find("h1, .infoline").remove().end().html();
			return item;
		})))
	};
}
//#endregion
export { route };

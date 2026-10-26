import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hex-rays/index.ts
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/hex-rays/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hex-rays.com/", "hex-rays.com/blog"] }],
	name: "Hex-Rays News",
	maintainers: [
		"hellodword ",
		"TonyRL",
		"Mas0n"
	],
	handler,
	url: "hex-rays.com/"
};
async function handler() {
	const link = "https://hex-rays.com/blog/";
	const $ = load((await got_default.get(link)).data);
	const list = $(".article  ").toArray().map((ele) => ({
		title: $("h2 > a", ele).text(),
		link: $("h2 > a", ele).attr("href"),
		pubDate: parseDate($("div.by-line > time", ele).attr("datetime")),
		author: $("div.by-line > a", ele).text()
	}));
	return {
		title: "Hex-Rays Blog",
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default.get(item.link)).data);
			item.category = content(".div.topics > a").toArray().map((ele) => content(ele).text());
			item.description = content(".post-body").html();
			return item;
		}))),
		image: "https://hex-rays.com/hubfs/Ico-logo.png"
	};
}
//#endregion
export { route };

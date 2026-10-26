import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/fastbull/express-news.ts
const route = {
	path: "/express-news",
	categories: ["finance"],
	view: 0,
	example: "/fastbull/express-news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["fastbull.com/express-news", "fastbull.com/"] }],
	name: "News Flash",
	maintainers: ["nczitzk"],
	handler,
	url: "fastbull.com/express-news"
};
async function handler() {
	const rootUrl = "https://www.fastbull.com";
	const currentUrl = `${rootUrl}/express-news`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	return {
		title: "实时财经快讯 - FastBull",
		link: currentUrl,
		item: $(".news-list").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find(".title_name").text(),
				pubDate: parseDate(Number.parseInt(item.attr("data-date"))),
				link: `${rootUrl}${item.find(".title_name").attr("href")}`
			};
		})
	};
}
//#endregion
export { route };

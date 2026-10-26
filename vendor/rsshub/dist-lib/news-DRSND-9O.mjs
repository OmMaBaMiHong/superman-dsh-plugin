import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wanqu/news.ts
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/wanqu/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wanqu.co/"] }],
	name: "最新推荐",
	maintainers: ["Fatpandac"],
	handler,
	url: "wanqu.co/"
};
async function handler() {
	const currentUrl = "https://www.wanqu.co";
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: "湾区日报 - 最新推荐",
		link: currentUrl,
		item: $("div.mb-4").toArray().map((item) => ({
			title: $(item).find("a").text(),
			description: $(item).find("a").text(),
			link: $(item).find("a").attr("href"),
			pubDate: parseDate($(item).find("i.text-helper-color.mr-4").text().trim())
		}))
	};
}
//#endregion
export { route };

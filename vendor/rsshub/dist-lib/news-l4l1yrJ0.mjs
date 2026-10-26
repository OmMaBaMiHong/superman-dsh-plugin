import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/china/news/military/news.ts
const route = {
	path: "/news/military",
	categories: ["new-media"],
	example: "/china/news/military",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["military.china.com/news"] }],
	name: "Military - Military News 军事 - 军事新闻",
	maintainers: ["jiaaoMario"],
	handler,
	url: "military.china.com/news"
};
async function handler() {
	const data = (await got_default("https://military.china.com/news/")).data;
	const $ = load(data);
	return {
		title: "中华网-军事新闻",
		link: "https://military.china.com/news/",
		item: $(".item_list li").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("h3.item_title").text(),
				author: "中华网军事",
				category: "中华网军事",
				pubDate: parseDate(item.find("em.item_time").text()),
				description: item.find(".item_source").text(),
				link: item.find("h3.item_title a").attr("href")
			};
		})
	};
}
//#endregion
export { route };

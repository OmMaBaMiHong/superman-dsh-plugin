import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/coolpc/news.ts
const route = {
	path: "/news",
	categories: ["shopping"],
	example: "/coolpc/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.coolpc.com.tw/"] }],
	name: "促銷&開箱",
	maintainers: ["david90103"],
	handler,
	url: "www.coolpc.com.tw/"
};
async function handler() {
	const currentUrl = "https://www.coolpc.com.tw/";
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: "原價屋 - 促銷&開箱",
		link: currentUrl,
		item: $("#content article").toArray().map((item) => ({
			title: $(item).find("h3 a").text(),
			description: $(item).find(".ultimate-layouts-excerpt").text(),
			link: $(item).find("h3 a").attr("href"),
			pubDate: parseDate($(item).find(".ultimate-layouts-metas-wrap span").eq(1).text(), "YYYY/MM/DD")
		})).filter((item, index, self) => index === self.findIndex((i) => i.title === item.title))
	};
}
//#endregion
export { route };

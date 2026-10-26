import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/digitalcameraworld/news.ts
const host = "https://www.digitalcameraworld.com";
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/digitalcameraworld/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["digitalcameraworld.com/"] }],
	name: "News",
	maintainers: ["EthanWng97"],
	handler
};
async function handler() {
	const $ = load(await rofetch(`${host}/feeds.xml`), { xmlMode: true });
	const items = $("item").toArray().map((item) => {
		item = $(item);
		let description = item.find(String.raw`dc\:content`).text();
		description = $("<div>").html(description);
		description.find(".vanilla-image-block").removeAttr("style");
		description.find(".fancy-box").remove();
		return {
			title: item.find("title").text(),
			pubDate: parseDate(item.find("pubDate").text()),
			link: item.find("link").text(),
			description: description.html()
		};
	});
	return {
		title: "Digital Camera World",
		link: host,
		description: "Camera news, reviews and features",
		item: items
	};
}
//#endregion
export { route };

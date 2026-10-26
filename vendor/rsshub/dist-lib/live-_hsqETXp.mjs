import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bandcamp/live.ts
const route = {
	path: "/live",
	categories: ["multimedia"],
	example: "/bandcamp/live",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bandcamp.com/live_schedule"] }],
	name: "Upcoming Live Streams",
	maintainers: ["nczitzk"],
	handler,
	url: "bandcamp.com/live_schedule"
};
async function handler() {
	const currentUrl = `https://bandcamp.com/live_schedule`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".curated-wrapper").remove();
	const items = $(".live-listing").toArray().map((item) => {
		item = $(item);
		return {
			link: item.find(".title-link").attr("href"),
			title: item.find(".show-title").text(),
			author: item.find(".show-artist").text(),
			pubDate: parseDate(item.find(".show-time-container").text().trim().split(" UTC", 1)[0]),
			description: `<img src="${item.find(".show-thumb-image").attr("style").match(/background-image: url\((.*)\);/)[1]}">`
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

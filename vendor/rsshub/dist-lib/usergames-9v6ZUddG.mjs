import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/indienova/usergames.ts
const route = {
	path: "/usergames",
	categories: ["game"],
	example: "/indienova/usergames",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["indienova.com/usergames", "indienova.com/"] }],
	name: "会员开发游戏库",
	maintainers: ["TonyRL"],
	handler,
	url: "indienova.com/usergames"
};
async function handler() {
	const baseUrl = "https://indienova.com";
	const { data: response, url: link } = await got_default(`${baseUrl}/usergames`);
	const $ = load(response);
	const list = $(".steam-game").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h3").attr("title"),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			author: item.find("span").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.description = $(".cover-image").prop("outerHTML") + $(".tab-container").html() + $(".swiper-wrapper").prop("outerHTML") + $(".postcontent").html();
		item.pubDate = $(".gamedb-release").length ? timezone(parseDate($(".gamedb-release").text().replaceAll(/[()]/g, "")), 8) : null;
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hellobtc/news.ts
const rootUrl = "https://www.hellobtc.com";
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/hellobtc/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hellobtc.com/news"] }],
	name: "快讯",
	maintainers: ["Fatpandac"],
	handler,
	url: "hellobtc.com/news"
};
async function handler() {
	const url = `${rootUrl}/news`;
	const $ = load((await got_default(url)).data);
	return {
		title: "白话区块链 - 快讯",
		link: url,
		item: $("nav.js-nav").find("div.item").toArray().map((item) => ({
			title: $(item).find("h2").text(),
			link: $(item).find("a").attr("href"),
			description: $(item).find("div.sub").text(),
			pubDate: timezone(parseDate($(item).find("span.date").text(), "MM-DD HH:mm"), 8)
		})).filter(Boolean)
	};
}
//#endregion
export { route };

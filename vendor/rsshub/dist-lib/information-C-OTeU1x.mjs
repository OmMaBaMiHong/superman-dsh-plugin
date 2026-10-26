import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hellobtc/information.ts
const rootUrl = "https://www.hellobtc.com";
const channelSelector = {
	latest: "div.index_tabs_container.js-tabs-container > div:nth-child(1)",
	application: "div.index_tabs_container.js-tabs-container > div:nth-child(2)"
};
const titleMap = {
	latest: "最新",
	application: "应用"
};
const route = {
	path: "/information/:channel?",
	categories: ["new-media"],
	example: "/hellobtc/information/latest",
	parameters: { channel: "类型，可填 `latest` 和 `application` 及最新和应用，默认为最新" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "首页",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const channel = ctx.req.param("channel") ?? "latest";
	const url = rootUrl;
	const $ = load((await got_default(url)).data);
	const list = $(channelSelector[channel]).find("div.new_item").toArray().map((item) => ({
		title: $(item).find("h2").text(),
		link: $(item).find("a").attr("href")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		item.description = content("#nr").html();
		item.pubDate = timezone(parseDate(content("span.date").text(), "YYYY-MM-DD HH:mm:ss"), 8);
		return item;
	})));
	return {
		title: `白话区块链 - 首页 ${titleMap[channel]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };

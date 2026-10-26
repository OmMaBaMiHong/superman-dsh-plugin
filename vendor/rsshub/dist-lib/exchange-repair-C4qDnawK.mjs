import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/apple/exchange-repair.ts
const host = "https://support.apple.com/";
const route = {
	path: "/exchange_repair/:country?",
	categories: ["other"],
	example: "/apple/exchange_repair",
	parameters: { country: "country code in apple.com URL (exception: for `United States` please use `us`), default to China `cn`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["support.apple.com/:country/service-programs"],
		target: "/exchange_repair/:country"
	}],
	name: "Exchange and Repair Extension Programs",
	maintainers: [
		"metowolf",
		"HenryQW",
		"kt286"
	],
	handler
};
async function handler(ctx) {
	const country = ctx.req.param("country") ?? "";
	const link = new URL(`${country}/service-programs`, host).href;
	const $ = load((await got_default(link)).data);
	const list = $("section.as-container-column").toArray().map((item) => {
		item = $(item);
		const a = item.find(".icon-chevronright").parent();
		return {
			title: a.text(),
			link: new URL(a.attr("href"), host).href,
			pubDate: parseDate(item.find(".note").text(), [
				"MMMM D, YYYY",
				"D MMMM YYYY",
				"YYYY 年 M 月 D 日"
			])
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $$ = load((await got_default(item.link)).data);
		$$("div.as-sn-lookup-wrapper").remove();
		$$("div.as-dropdown-wrapper").remove();
		item.description = $$(".main").html();
		item.author = "Apple Inc.";
		return item;
	})));
	return {
		title: `Apple - ${$("h1.as-center").text()}`,
		link,
		item: out
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/guancha/headline.ts
const route = {
	path: "/headline",
	categories: ["new-media"],
	example: "/guancha/headline",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["guancha.cn/GuanChaZheTouTiao", "guancha.cn/"] }],
	name: "头条",
	maintainers: ["nczitzk"],
	handler,
	url: "guancha.cn/GuanChaZheTouTiao"
};
async function handler() {
	const rootUrl = "https://www.guancha.cn";
	const currentUrl = `${rootUrl}/GuanChaZheTouTiao/list_1.shtml`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".headline-list li .content-headline h3 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			description: item.parent().next().html(),
			link: `${rootUrl}${item.attr("href").replace(/\.shtml$/, "_s.shtml")}`,
			pubDate: timezone(parseDate(item.parents("div").first().find("span").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description += content(".all-txt").html();
		return item;
	})));
	return {
		title: "观察者网 - 头条",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

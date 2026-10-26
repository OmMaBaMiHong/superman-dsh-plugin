import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/mpaypass/news.ts
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/mpaypass/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mpaypass.com.cn/"] }],
	name: "新闻",
	maintainers: ["LogicJake", "genghis-yang"],
	handler,
	url: "mpaypass.com.cn/"
};
async function handler() {
	const link = "http://m.mpaypass.com.cn";
	const $list = load((await got_default(link)).data);
	return {
		title: "新闻 - 移动支付网",
		link,
		language: "zh-CN",
		item: await Promise.all($list(".Newslist-li").toArray().map((el) => {
			const $el = $list(el);
			const $a = $el.find(".Newslist-title a");
			const href = $a.attr("href");
			const title = $a.text();
			const date = $el.find(".Newslist-time span").text();
			return cache_default.tryGet(href, async () => {
				const description = load((await got_default.get(href)).data)(".newslist-body").html();
				return {
					title,
					description,
					link: href,
					pubDate: timezone(parseDate(date), 8)
				};
			});
		}))
	};
}
//#endregion
export { route };

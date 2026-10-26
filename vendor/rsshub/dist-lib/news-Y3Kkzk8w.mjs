import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dhu/xxgk/news.ts
const siteUrl = "https://xxgk.dhu.edu.cn";
const baseUrl = "https://xxgk.dhu.edu.cn/1737/list.htm";
const route = {
	path: "/xxgk/news",
	categories: ["university"],
	example: "/dhu/xxgk/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新信息公开",
	maintainers: ["KiraKiseki"],
	handler
};
async function handler() {
	const link = baseUrl;
	const { data: response } = await got_default(link);
	const $ = load(response);
	return {
		title: "东华大学信息公开网-最新公开信息",
		link,
		item: await Promise.all($(".cols_list > li").toArray().map(async (item) => {
			item = $(item);
			const colsTitle = item.find(".cols_title > a");
			const colsMeta = item.find(".cols_meta");
			const link = colsTitle.attr("href");
			const title = colsTitle.text();
			const pubDate = parseDate(colsMeta.text(), "YYYY-MM-DD", "zh-cn");
			const url = `${siteUrl}${link}`;
			return await cache_default.tryGet(url, async () => {
				let description;
				try {
					const { data: response } = await got_default(url);
					description = load(response)(".wp_articlecontent").first().html() ?? "";
				} catch {
					description = "";
				}
				return {
					title,
					link,
					pubDate,
					description
				};
			});
		}))
	};
}
//#endregion
export { route };

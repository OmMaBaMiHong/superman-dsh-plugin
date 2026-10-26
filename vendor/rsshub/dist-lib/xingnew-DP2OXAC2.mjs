import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/chnmuseum/xingnew.ts
const route = {
	path: "/zx/xingnew",
	categories: ["travel"],
	example: "/chnmuseum/zx/xingnew",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["chnmuseum.cn/zx/xingnew"],
		target: "/zx/xingnew"
	}],
	name: "资讯要闻",
	maintainers: ["ShabbyWhineYear"],
	handler: async () => {
		const $ = load(await rofetch("https://www.chnmuseum.cn/zx/xingnew/"));
		const list = $("ul.cj_xushuliebao_list li").toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			const dateText = item.find("span.date").text();
			return {
				title: a.attr("title") || a.text(),
				link: new URL(a.attr("href"), "https://www.chnmuseum.cn/zx/xingnew/").href,
				pubDate: timezone(parseDate(dateText, "YYYY/MM/DD"), 8)
			};
		});
		return {
			title: "中国国家博物馆资讯要闻",
			link: "https://www.chnmuseum.cn/zx/xingnew/",
			item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
				item.description = load(await rofetch(item.link))(".cj_xw_cong").first().html();
				return item;
			})))
		};
	}
};
//#endregion
export { route };

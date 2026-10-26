import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dhu/news/xsxx.ts
const baseUrl = "https://news.dhu.edu.cn/_wp3services/generalQuery?queryObj=articles&siteId=14&columnId=6410&pageIndex=1&rows=20";
const route = {
	path: "/news/xsxx",
	categories: ["university"],
	example: "/dhu/news/xsxx",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.dhu.edu.cn/6410"] }],
	name: "学术信息",
	maintainers: ["fox2049"],
	handler,
	url: "news.dhu.edu.cn/6410"
};
async function handler() {
	const { data } = await got_default(baseUrl, { headers: { Referer: "https://news.dhu.edu.cn/6410/" } });
	const list = data.data.map((item) => ({
		title: item.title,
		link: item.wapUrl,
		pubDate: parseDate(item.publishTime),
		author: item.publisher
	}));
	return {
		title: "学术信息",
		link: "https://news.dhu.edu.cn/6410",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			item.description = load(response)(".new_zwCot").first().html();
			return item;
		})))
	};
}
//#endregion
export { route };

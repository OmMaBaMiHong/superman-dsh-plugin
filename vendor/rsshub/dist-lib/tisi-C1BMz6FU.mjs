import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tisi/index.ts
const rootUrl = "https://www.tisi.org";
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/tisi/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最近更新",
	maintainers: ["Fatpandac"],
	handler
};
async function handler() {
	const url = `${rootUrl}/?page_id=11151`;
	const $ = load((await got_default(url)).data);
	const list = $("div.new-artice-list-box").toArray().map((item) => ({
		title: $(item).find("p.new-article-title > a").text(),
		link: new URL($(item).find("p.new-article-title > a").attr("href"), rootUrl).href,
		pubDate: parseDate($(item).find("p.new-article-date > span.left-span").text()),
		category: $(item).find("p.new-article-date > span:nth-child(1)").text()
	}));
	return {
		title: "腾讯研究院 - 最近更新",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default(item.link)).data)("div.article-content").html();
			return item;
		})))
	};
}
//#endregion
export { route };

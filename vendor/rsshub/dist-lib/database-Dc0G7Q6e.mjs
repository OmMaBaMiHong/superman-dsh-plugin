import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderArticle } from "./article-BC41RHHx.mjs";
import { load } from "cheerio";
//#region lib/routes/caixin/database.ts
const route = {
	path: "/database",
	categories: ["traditional-media"],
	example: "/caixin/database",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["k.caixin.com/web", "k.caixin.com/"] }],
	name: "财新数据通",
	maintainers: ["nczitzk"],
	handler,
	url: "k.caixin.com/web"
};
async function handler() {
	const currentUrl = `https://database.caixin.com/news/`;
	const $ = load((await got_default(currentUrl)).data);
	const list = $("h4 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href").replace("http://", "https://")
		};
	});
	return {
		title: "财新数据通 - 专享资讯",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(item.link)).data);
			item.pubDate = timezone(parseDate(content("#pubtime_baidu").text()), 8);
			item.description = renderArticle({
				item,
				$: content
			});
			item.author = content(".top-author").text();
			return item;
		})))
	};
}
//#endregion
export { route };

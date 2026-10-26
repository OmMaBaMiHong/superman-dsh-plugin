import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cqgas/tqtz.ts
const url = "http://www.cqgas.cn/portal/article/page?cateId=1082&pageNo=1";
const route = {
	path: "/tqtz",
	categories: ["forecast"],
	example: "/cqgas/tqtz",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cqgas.cn/"] }],
	name: "停气检修通知",
	maintainers: ["Mai19930513"],
	handler,
	url: "cqgas.cn/"
};
async function handler() {
	const { data: response } = await got_default(url);
	const $ = load(response);
	const contentUrl = (id) => `http://www.cqgas.cn/portal/article/content?contentId=${id}`;
	const list = $("ul.news_list > li").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").first();
		return {
			title: title.text(),
			link: contentUrl(title.attr("contentid")),
			pubDate: parseDate(item.find("span.right.txt_black2").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("body > div").first().html();
		return item;
	})));
	return {
		title: "重庆燃气——停气检修通知",
		link: url,
		item: items
	};
}
//#endregion
export { route };

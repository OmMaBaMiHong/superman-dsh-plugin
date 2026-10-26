import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/j-test/news.ts
const route = {
	path: "/news",
	name: "公告",
	url: "www.j-test.com",
	maintainers: ["kuhahku"],
	example: "/j-test/news",
	parameters: {},
	categories: ["study"],
	features: { supportRadar: true },
	radar: [{
		source: ["www.j-test.com"],
		target: "/news"
	}],
	handler,
	description: ""
};
async function handler() {
	const baseUrl = "http://www.j-test.com";
	const $ = load(await rofetch(baseUrl));
	const list = $("#content1 > .center > .col_box1 > .col_body1 > ul > li").toArray().map((item) => {
		const [title, date] = $(item).text().trim().replaceAll("]", "").split(" [");
		return {
			title,
			link: new URL($(item).children("a").attr("href"), baseUrl).href,
			pubDate: timezone(parseDate(date), 8),
			description: ""
		};
	});
	return {
		title: "实用日本语鉴定考试（J.TEST）公告",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))(".content > table").html() ?? "";
			return item;
		})))
	};
}
//#endregion
export { route };

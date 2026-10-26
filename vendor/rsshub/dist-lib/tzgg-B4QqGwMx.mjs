import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/gs/tzgg.ts
const route = {
	path: "/gs/tzgg",
	categories: ["university"],
	example: "/xjtu/gs/tzgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gs.xjtu.edu.cn/"] }],
	name: "研究生院通知公告",
	maintainers: ["nczitzk"],
	handler,
	url: "gs.xjtu.edu.cn/"
};
async function handler() {
	const rootUrl = "http://gs.xjtu.edu.cn/tzgg.htm";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	const list = $("div.list_right_con ul li").slice(0, 10).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), "http://gs.xjtu.edu.cn/").href,
			pubDate: parseDate(item.find("span.time").text())
		};
	});
	return {
		title: "西安交通大学研究生院 - 通知公告",
		link: rootUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(item.link)).data);
			item.description = content("#vsb_content").html() + (content("form ul").length > 0 ? content("form ul").html() : "");
			return item;
		})))
	};
}
//#endregion
export { route };

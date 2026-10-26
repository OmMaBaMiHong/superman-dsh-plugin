import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bjp/apod.ts
const route = {
	path: "/apod",
	categories: ["picture"],
	view: 2,
	example: "/bjp/apod",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"bjp.org.cn/APOD/today.shtml",
		"bjp.org.cn/APOD/list.shtml",
		"bjp.org.cn/"
	] }],
	name: "每日一图",
	maintainers: ["HenryQW"],
	handler,
	url: "bjp.org.cn/APOD/today.shtml"
};
async function handler(ctx) {
	const baseUrl = "https://www.bjp.org.cn";
	const listUrl = `${baseUrl}/APOD/list.shtml`;
	const $ = load((await got_default(listUrl)).data);
	const list = $("td[align=left] b").toArray().map((e) => {
		e = $(e);
		return {
			title: e.find("a").attr("title"),
			link: `${baseUrl}${e.find("a").attr("href")}`,
			pubDate: timezone(parseDate(e.find("span").text().replace("：", ""), "YYYY-MM-DD"), 8)
		};
	}).toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10);
	const items = await Promise.all(list.map((e) => cache_default.tryGet(e.link, async () => {
		const { data } = await got_default.get(e.link);
		e.description = load(data)(".juzhong").html();
		return e;
	})));
	return {
		title: $("head title").text(),
		description: "探索宇宙！每天发布一张迷人宇宙的影像，以及由专业天文学家撰写的简要说明。",
		link: listUrl,
		item: items
	};
}
//#endregion
export { route };

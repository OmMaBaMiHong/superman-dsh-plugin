import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/sc.ts
const host = "https://www.sc.sdu.edu.cn/";
const typelist = [
	"通知公告",
	"学术动态",
	"本科教育",
	"研究生教育"
];
const urlList = [
	"tzgg.htm",
	"kxyj/xsyg.htm",
	"rcpy/bkjy.htm",
	"rcpy/yjsjy.htm"
];
const route = {
	path: "/sc/:type?",
	categories: ["university"],
	example: "/sdu/sc/0",
	parameters: { type: "默认为 `0`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "软件学院通知",
	maintainers: ["Ji4n1ng"],
	handler,
	description: `| 通知公告 | 学术动态 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | ---------- |
| 0        | 1        | 2        | 3          |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ? Number.parseInt(ctx.req.param("type")) : 0;
	const link = new URL(urlList[type], host).href;
	const $ = load((await got_default(link)).data);
	let item = $(".newlist01 li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		let link = a.attr("href");
		link = new URL(link, host).href;
		return {
			title: a.text().trim(),
			link,
			pubDate: parseDate(e.find(".date").text().trim())
		};
	});
	item = await Promise.all(item.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default(item.link)).data);
			item.title = $("h3").text();
			item.author = $(".pr").text().trim().match(/作者：(.*)/)[1] || "山东大学软件学院";
			$("h3, .pr").remove();
			item.description = $(".content").html();
			return item;
		} catch {
			return item;
		}
	})));
	return {
		title: `山东大学软件学院${typelist[type]}`,
		description: $("title").text(),
		link,
		item
	};
}
//#endregion
export { route };

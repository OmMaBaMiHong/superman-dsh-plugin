import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/epe.ts
const host = "https://www.epe.sdu.edu.cn/";
const typelist = [
	"学院动态",
	"通知公告",
	"学术论坛"
];
const urlList = [
	"zxzx/xydt.htm",
	"zxzx/tzgg.htm",
	"zxzx/xslt.htm"
];
const route = {
	path: "/epe/:type?",
	categories: ["university"],
	example: "/sdu/epe/0",
	parameters: { type: "默认为 `0`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "能源与动力工程学院通知",
	maintainers: ["Ji4n1ng"],
	handler,
	description: `| 学院动态 | 通知公告 | 学术论坛 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ? Number.parseInt(ctx.req.param("type")) : 0;
	const link = new URL(urlList[type], host).href;
	const $ = load((await got_default(link)).data);
	let item = $("#page_right_main li a").toArray().map((e) => {
		e = $(e);
		return {
			title: e.attr("title"),
			link: e.attr("href")
		};
	});
	item = await Promise.all(item.filter((e) => e.link.startsWith("../info")).map((item) => {
		item.link = new URL(item.link.slice("3"), host).href;
		return cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			const info = $("#show_info").text().split(/\s{4}/);
			const date = info[0].split("：", 2)[1];
			item.title = $("#show_title").text().trim();
			item.author = info[1].replace("编辑：", "") || "山东大学能源与动力工程学院";
			item.description = $("#show_content").html();
			item.pubDate = timezone(parseDate(date), 8);
			return item;
		});
	}));
	return {
		title: `山东大学能源与动力工程学院${typelist[type]}`,
		description: $("title").text(),
		link,
		item
	};
}
//#endregion
export { route };

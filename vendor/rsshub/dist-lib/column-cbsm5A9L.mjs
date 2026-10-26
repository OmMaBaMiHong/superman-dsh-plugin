import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qianzhan/column.ts
const route = {
	path: "/analyst/column/:type?",
	categories: ["finance"],
	example: "/qianzhan/analyst/column/all",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章列表",
	maintainers: ["moke8"],
	handler,
	description: `| 全部 | 研究员专栏 | 规划师专栏 | 观察家专栏 |
| ---- | ---------- | ---------- | ---------- |
| all  | 220        | 627        | 329        |`
};
async function handler(ctx) {
	let rootUrl = "https://www.qianzhan.com/analyst/";
	const titles = {
		all: "最新文章",
		220: "研究员专栏",
		627: "规划师专栏",
		329: "观察家专栏"
	};
	const { type = "all" } = ctx.req.param();
	if (type !== "all") rootUrl = rootUrl + "list/" + type + ".html";
	const $ = load((await got_default(rootUrl)).data);
	const links = $(".ptb30.bb1e.clf .f22 a").map((_, item) => $(item).attr("href"));
	const items = await Promise.all(links.map((_, item) => cache_default.tryGet(item, async () => {
		const $ = load((await got_default(item)).data);
		const description = $("#divArtBody").html();
		return {
			title: $("#h_title").text(),
			link: item,
			description,
			pubDate: timezone(parseDate($("#pubtime_baidu").text().split("• ", 2)[1], "YYYY-MM-DD HH:mm:ss"), 8),
			author: $(".bljjxue").text().match(/\S+/)[0],
			category: $("meta[name=\"Keywords\"]").attr("content").split(",")
		};
	})));
	return {
		title: `前瞻经济学人 - ${titles[type]}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };

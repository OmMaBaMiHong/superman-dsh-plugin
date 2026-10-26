import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cqwu/index.ts
const host = "https://www.cqwu.edu.cn";
const map = {
	notify: "/channel_24894.html",
	academiceve: "/channel_24895.html"
};
const titleMap = {
	notify: "通知",
	academiceve: "学术活动"
};
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/cqwu/news/academiceve",
	parameters: { type: "可选，默认为 academiceve " },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "通知公告",
	maintainers: ["Fatpandac"],
	handler,
	description: `| 通知公告 | 学术活动公告 |
| -------- | ------------ |
| notify   | academiceve  |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "academiceve";
	const link = host + map[type];
	const title = "重文理" + titleMap[type] + "公告";
	const $ = load((await got_default.get(link)).data);
	const list = $("div[class=\"list\"] ul").find("li");
	return {
		title,
		link,
		item: await Promise.all(list.map(async (i, item) => {
			const pageUrl = host + $(item).find("a").attr("href");
			const { desc, pubDate } = await cache_default.tryGet(pageUrl, async () => {
				const $ = load((await got_default.get(pageUrl)).data);
				return {
					desc: $(".contentAtice").html(),
					pubDate: parseDate($(".abs span:nth-child(1)").text().replace("发布时间：", ""))
				};
			});
			return {
				title: $(item).find(".title").text(),
				link: pageUrl,
				description: desc,
				pubDate
			};
		}))
	};
}
//#endregion
export { route };

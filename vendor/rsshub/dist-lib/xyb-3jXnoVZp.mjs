import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/qd/xyb.ts
const host = "https://xyb.qd.sdu.edu.cn/";
const typeMap = { gztz: {
	title: "工作通知",
	url: "gztz.htm"
} };
const route = {
	path: "/qd/xyb/:type?",
	categories: ["university"],
	example: "/sdu/qd/xyb/gztz",
	parameters: { type: "默认为`gztz`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "青岛校区学科建设与研究生教育办公室",
	maintainers: ["kukeya"],
	handler,
	description: `| 工作通知 |
| -------- |
| gztz     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "gztz";
	const link = new URL(typeMap[type].url, host).href;
	const $ = load((await got_default(link)).data);
	let item = $(".list li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		return {
			title: a.text().slice(1).trim(),
			link: a.attr("href").startsWith("info/") ? host + a.attr("href") : a.attr("href"),
			pubDate: parseDate(e.find("b").text().trim(), "YYYY-MM-DD")
		};
	});
	item = await Promise.all(item.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "mp.weixin.qq.com") return finishArticleItem(item);
		item.description = load((await got_default(item.link)).data)(".v_news_content").html();
		return item;
	})));
	return {
		title: `山东大学（青岛）学研办${typeMap[type].title}`,
		description: $("title").text(),
		link,
		item
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/ygb.ts
const host = "https://www.ygb.sdu.edu.cn/";
const typeMap = {
	zytz: {
		title: "重要通知",
		url: "zytz.htm"
	},
	glfw: {
		title: "管理服务",
		url: "glfw.htm"
	},
	cxsj: {
		title: "创新实践",
		url: "cxsj.htm"
	}
};
const route = {
	path: "/ygb/:type?",
	categories: ["university"],
	example: "/sdu/ygb/zytz",
	parameters: { type: "默认为`zytz`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研工部",
	maintainers: ["kukeya"],
	handler,
	description: `| 重要通知 | 管理服务 | 创新实践 |
| -------- | -------- | -------- |
| zytz     | glfw     | cxsj     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "zytz";
	const link = new URL(typeMap[type].url, host).href;
	const $ = load((await got_default(link)).data);
	let item = $(".zytz-list li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		const link = a.attr("href").startsWith("info/") || a.attr("href").startsWith("content") ? host + a.attr("href") : a.attr("href");
		return {
			title: a.text().trim(),
			link,
			pubDate: parseDate(e.find("b").text().trim().slice(1, -1), "YYYY-MM-DD")
		};
	});
	item = await Promise.all(item.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "mp.weixin.qq.com") return finishArticleItem(item);
		item.description = load((await got_default(item.link)).data)(".v_news_content").html();
		return item;
	})));
	return {
		title: `山东大学研工部${typeMap[type].title}`,
		description: $("title").text(),
		link,
		item,
		icon: "https://www.ygb.sdu.edu.cn/img/logo.png"
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/qd/xszxqd.ts
const host = "https://www.onlineqd.sdu.edu.cn/";
const typeMap = {
	"xttz-yjs": {
		title: "学团通知-研究生",
		url: "list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1027"
	},
	"xttz-bks": {
		title: "学团通知-本科生",
		url: "list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1025"
	},
	"xttz-tx": {
		title: "学团通知-团学",
		url: "list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1026"
	},
	"xttz-xl": {
		title: "学团通知-心理",
		url: "list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1029"
	},
	xtyw: {
		title: "学团要闻",
		url: "list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1008"
	}
};
const route = {
	path: "/qd/xszxqd/:type?",
	categories: ["university"],
	example: "/sdu/qd/xszxqd/xtyw",
	parameters: { type: "默认为`xtyw`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "学生在线（青岛）",
	maintainers: ["kukeya"],
	handler,
	description: `| 学团通知 - 研究生 | 学团通知 - 本科生 | 学团通知 - 团学 | 学团通知 - 心理 | 学团要闻 |
| ----------------- | ----------------- | --------------- | --------------- | -------- |
| xttz-yjs          | xttz-bks          | xttz-tx         | xttz-xl         | xtyw     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "xtyw";
	const link = new URL(typeMap[type].url, host).href;
	const $ = load((await got_default(link)).data);
	let item = $(".list_box li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		const link = a.attr("href").startsWith("tz_content") || a.attr("href").startsWith("content") ? host + a.attr("href") : a.attr("href");
		return {
			title: a.text().trim(),
			link,
			pubDate: parseDate(e.find("span").text().trim(), "YYYY-MM-DD")
		};
	});
	item = await Promise.all(item.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "mp.weixin.qq.com") return finishArticleItem(item);
		item.description = load((await got_default(item.link)).data)(".v_news_content").html();
		return item;
	})));
	return {
		title: `山东大学学生在线（青岛）${typeMap[type].title}`,
		description: $("title").text(),
		link,
		item,
		icon: "https://www.onlineqd.sdu.edu.cn/img/logo.png"
	};
}
//#endregion
export { route };

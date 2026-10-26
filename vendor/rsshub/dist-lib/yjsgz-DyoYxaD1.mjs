import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/cs/yjsgz.ts
const host = "https://csyh.sdu.edu.cn/";
const typeMap = {
	zytz: "zytz.htm",
	gsl: "gsl.htm"
};
const titleMap = {
	zytz: "重要通知",
	gsl: "公示栏"
};
const route = {
	path: "/cs/yjsgz/:type?",
	categories: ["university"],
	example: "/sdu/cs/yjsgz/zytz",
	parameters: { type: "默认为`zytz`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机科学与技术学院研究生工作网站",
	maintainers: ["kukeya", "wiketool"],
	handler,
	description: `| 重要通知 | 公示栏 |
| -------- | ------ |
| zytz     | gsl    |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "zytz";
	const link = new URL(typeMap[type], host).href;
	const $ = load((await got_default(link)).data);
	let item = $(".ss li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		return {
			title: a.text().trim(),
			link: a.attr("href").startsWith("info/") ? host + a.attr("href") : a.attr("href"),
			pubDate: parseDate(e.find("span").text().trim(), "YYYY-MM-DD")
		};
	});
	item = await Promise.all(item.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "mp.weixin.qq.com") return finishArticleItem(item);
		item.description = load((await got_default(item.link)).data)(".v_news_content").html();
		return item;
	})));
	return {
		title: `山东大学计算机科学与技术学院研究生工作网站${titleMap[type]}`,
		description: $("title").text(),
		link,
		item,
		icon: "https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png",
		logo: "https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png"
	};
}
//#endregion
export { route };

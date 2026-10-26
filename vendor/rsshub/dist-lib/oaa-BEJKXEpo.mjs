import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/tju/oaa/index.ts
const oaa_base_url = "http://oaa.tju.edu.cn/";
const repo_url = "https://github.com/DIYgod/RSSHub/issues";
const pageType = (href) => {
	if (!href.startsWith("http")) return "in-site";
	const url = new URL(href);
	if (url.hostname === "mp.weixin.qq.com") return "wechat-mp";
	if (url.hostname === "oaa.tju.edu.cn") return "tju-oaa";
	return "unknown";
};
const route = {
	path: "/oaa/:type?",
	categories: ["university"],
	example: "/tju/oaa/news",
	parameters: { type: "default `news`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "The Office of Academic Affairs",
	maintainers: [
		"AlanZeng423",
		"AmosChenYQ",
		"SuperPung"
	],
	handler,
	description: `| News | Notification |
| :--: | :----------: |
| news | notification |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let path, subtitle;
	switch (type) {
		case "news":
			subtitle = "新闻动态";
			path = "xwdt.htm";
			break;
		case "notification":
			subtitle = "通知公告";
			path = "tzgg.htm";
			break;
		default:
			subtitle = "新闻动态";
			path = "xwdt.htm";
	}
	let response = null;
	try {
		response = await got_default(oaa_base_url + path, { headers: { Referer: oaa_base_url } });
	} catch {}
	if (response === null) return {
		title: "天津大学教务处 - " + subtitle,
		link: oaa_base_url + path,
		description: "链接失效http://oaa.tju.edu.cn/" + path,
		item: [{
			title: "提示信息",
			link: repo_url,
			description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`
		}]
	};
	const $ = load(response.data);
	const list = $(".notice_l > ul > li > dl > dt").toArray().map((item) => {
		const href = $("a", item).attr("href");
		const type = pageType(href);
		return {
			title: $("h2", item).text(),
			link: type === "in-site" ? oaa_base_url + href : href,
			pubDate: timezone(parseDate($(".fl_01_r_time", item).text(), "DDYYYY-MM"), 8),
			type
		};
	});
	const items = await Promise.all(list.map((item) => {
		switch (item.type) {
			case "wechat-mp": return finishArticleItem(item);
			case "tju-oaa":
			case "in-site": return cache_default.tryGet(item.link, async () => {
				try {
					item.description = load((await got_default(item.link)).data)(".v_news_content").html();
				} catch {}
				return item;
			});
			default: return item;
		}
	}));
	return {
		title: "天津大学教务处 - " + subtitle,
		link: oaa_base_url + path,
		description: null,
		item: items
	};
}
//#endregion
export { route };

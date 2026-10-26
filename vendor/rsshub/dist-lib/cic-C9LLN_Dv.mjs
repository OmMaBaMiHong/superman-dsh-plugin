import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/tju/cic/index.ts
const cic_base_url = "http://cic.tju.edu.cn/";
const repo_url = "https://github.com/DIYgod/RSSHub/issues";
const pageType = (href) => {
	if (!href.startsWith("http")) return "in-site";
	return new URL(href).hostname === "cic.tju.edu.cn" ? "tju-cic" : "unknown";
};
const route = {
	path: "/cic/:type?",
	categories: ["university"],
	example: "/tju/cic/news",
	parameters: { type: "default `news`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "College of Intelligence and Computing",
	maintainers: ["AlanZeng423", "SuperPung"],
	handler,
	description: `| College News | Notification | TJU Forum for CIC |
| :----------: | :----------: | :---------------: |
|     news     | notification |       forum       |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let path, subtitle;
	switch (type) {
		case "news":
			subtitle = "学部新闻";
			path = "xwzx/xyxw.htm";
			break;
		case "notification":
			subtitle = "通知公告";
			path = "xwzx/tzgg.htm";
			break;
		case "forum":
			subtitle = "北洋智算论坛";
			path = "byzslt.htm";
			break;
		default:
			subtitle = "学部新闻";
			path = "xwzx/xyxw.htm";
	}
	let response = null;
	try {
		response = await got_default(cic_base_url + path, { headers: { Referer: cic_base_url } });
	} catch {}
	if (response === null) return {
		title: "天津大学智能与计算学部 - " + subtitle,
		link: cic_base_url + path,
		description: "链接失效http://cic.tju.edu.cn/" + path,
		item: [{
			title: "提示信息",
			link: repo_url,
			description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`
		}]
	};
	const $ = load(response.data);
	const list = $(".wenzi_list_ul > li").toArray().map((item) => {
		const href = $("a", item).attr("href");
		const type = pageType(href);
		return {
			title: $("a", item).text(),
			link: type === "in-site" ? cic_base_url + href : href,
			type
		};
	});
	const items = await Promise.all(list.map((item) => {
		switch (item.type) {
			case "tju-cic":
			case "in-site": return cache_default.tryGet(item.link, async () => {
				try {
					const content = load((await got_default(item.link)).data);
					item.pubDate = timezone(parseDate(content(".news_info > span").first().text(), "YYYY年MM月DD日 HH:mm"), 8);
					content(".news_tit").remove();
					content(".news_info").remove();
					item.description = content(".con_news_body > div").html();
				} catch {}
				return item;
			});
			default: return item;
		}
	}));
	return {
		title: "天津大学智能与计算学部 - " + subtitle,
		link: cic_base_url + path,
		description: null,
		item: items
	};
}
//#endregion
export { route };

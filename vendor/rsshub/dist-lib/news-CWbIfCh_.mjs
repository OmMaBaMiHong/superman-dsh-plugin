import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/tju/news/index.ts
const news_base_url = "http://news.tju.edu.cn/";
const repo_url = "https://github.com/DIYgod/RSSHub/issues";
const pageType = (href) => {
	if (href === void 0) return "unknown";
	if (!href.startsWith("http")) return "in-site";
	return new URL(href).hostname === "news.tju.edu.cn" ? "tju-news" : "unknown";
};
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/tju/news/focus",
	parameters: { type: "default `focus`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["AlanZeng423", "SuperPung"],
	handler,
	description: `| Focus on TJU | General News | Internal News | Media Report | Pictures of TJU |
| :----------: | :----------: | :-----------: | :----------: | :-------------: |
|     focus    |    general   |    internal   |     media    |     picture     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let path, subtitle;
	switch (type) {
		case "focus":
			subtitle = "聚焦天大";
			path = "jjtd.htm";
			break;
		case "general":
			subtitle = "综合新闻";
			path = "zhxw.htm";
			break;
		case "internal":
			subtitle = "校内新闻";
			path = "xnxw1/qb.htm";
			break;
		case "media":
			subtitle = "媒体报道";
			path = "mtbd.htm";
			break;
		case "picture":
			subtitle = "图说天大";
			path = "tstd.htm";
			break;
		default:
			subtitle = "聚焦天大";
			path = "jjtd.htm";
	}
	let response = null;
	try {
		response = await got_default(news_base_url + path, { headers: { Referer: news_base_url } });
	} catch {}
	if (response === null) return {
		title: "天津大学新闻网 - " + subtitle,
		link: news_base_url + path,
		description: "链接失效http://news.tju.edu.cn/" + path,
		item: [{
			title: "提示信息",
			link: repo_url,
			description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`
		}]
	};
	const $ = load(response.data);
	let list;
	list = type === "picture" ? $(".picList > li").toArray() : $(".indexList > li").toArray();
	list = list.map((item) => {
		const href = $("h4 > a", item).attr("href");
		const type = pageType(href);
		return {
			title: $("h4 > a", item).text(),
			link: type === "in-site" ? news_base_url + href : href,
			type
		};
	});
	const items = await Promise.all(list.map((item) => {
		switch (item.type) {
			case "tju-news":
			case "in-site": return cache_default.tryGet(item.link, async () => {
				try {
					delete item.type;
					const content = load((await got_default(item.link)).data);
					item.pubDate = timezone(parseDate(content(".contentTime").text().match(/\d{4}-\d{2}-\d{2}/)[0], "YYYY-MM-DD"), 8);
					item.description = content(".v_news_content").html();
				} catch {}
				return item;
			});
			default: return item;
		}
	}));
	return {
		title: "天津大学新闻网 - " + subtitle,
		link: news_base_url + path,
		item: items
	};
}
//#endregion
export { route };

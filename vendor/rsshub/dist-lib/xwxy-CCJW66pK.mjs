import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gdufs/xwxy/index.ts
const handler = async (ctx) => {
	const BASE_URL = "https://xwxy.gdufs.edu.cn";
	const category = ctx.req.param("category") ?? "news";
	const pathMap = {
		news: "/xwzx/xyxw.htm",
		notices: "/xwzx/tzgg/tz.htm",
		announcements: "/xwzx/tzgg/gg.htm",
		media: "/xwzx/mtjj.htm"
	};
	const titleMap = {
		news: "学院新闻",
		notices: "通知",
		announcements: "公告",
		media: "媒体聚焦"
	};
	const datePattern = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/;
	const link = `${BASE_URL}${pathMap[category] ?? pathMap.news}`;
	const response = await got_default(link);
	if (!response.body) throw new Error("No response body");
	const $ = load(response.body);
	const items = $("li[id^=\"line_u14_\"] a").toArray().map((el) => {
		const a = $(el);
		const href = a.attr("href") || "";
		const li = a.closest("li");
		const contextText = (li && li.text() || a.text()).trim();
		const dateText = a.find("i").text().trim() || li && li.find("i").text().trim() || li && li.find("time").text().trim() || (contextText.match(datePattern)?.[0] ?? "");
		const pubDate = dateText ? parseDate(dateText) : void 0;
		const title = a.find("h5").text().trim() || a.attr("title")?.trim() || a.text().trim() || contextText.replace(datePattern, "").trim();
		if (!href) return null;
		return {
			title,
			link: href.startsWith("http") ? href : new URL(href, link).href,
			pubDate
		};
	}).filter((v) => !!v && !!v.title && !!v.link);
	const limit = Number.parseInt(ctx.req.query("limit")) || 10;
	const limitedItems = items.slice(0, limit);
	const enhancedItems = await Promise.all(limitedItems.map((item) => cache_default.tryGet(item.link, async () => {
		let isInternal = false;
		try {
			isInternal = new URL(item.link).hostname.endsWith("gdufs.edu.cn");
		} catch {}
		if (!isInternal) return {
			...item,
			description: "",
			author: ""
		};
		const articleResponse = await got_default(item.link);
		if (!articleResponse.body) throw new Error("No article body");
		const $$ = load(articleResponse.body);
		const $content = $$(".v_news_content");
		$content.find("img, a").each((_, el) => {
			const $el = $$(el);
			for (const attr of ["src", "href"]) {
				const v = $el.attr(attr);
				if (v && !v.startsWith("http")) try {
					$el.attr(attr, new URL(v, item.link).href);
				} catch {}
			}
		});
		const content = $content.html() || "";
		const metaTexts = $$(".show01 p i").toArray().map((el) => $$(el).text().trim()).filter(Boolean);
		const authors = metaTexts.filter((t) => !t.includes("发布时间")).filter((t) => !datePattern.test(t));
		let pubDateRecovered;
		if (!item.pubDate) {
			const dateTextInMeta = metaTexts.find((t) => datePattern.test(t));
			if (dateTextInMeta) {
				const matched = dateTextInMeta.match(datePattern)?.[0];
				if (matched) try {
					pubDateRecovered = parseDate(matched);
				} catch {}
			}
		}
		return {
			...item,
			description: content,
			author: authors.join(", "),
			pubDate: item.pubDate || pubDateRecovered
		};
	})));
	return {
		title: `广外新传学院-${titleMap[category] ?? titleMap.news}`,
		link,
		description: "广东外语外贸大学新闻与传播学院官网-新闻中心",
		item: enhancedItems
	};
};
const route = {
	path: "/xwxy/:category?",
	categories: ["university"],
	example: "/gdufs/xwxy/news",
	parameters: { category: {
		description: "分类，默认为 `news`",
		options: [
			{
				label: "学院新闻",
				value: "news"
			},
			{
				label: "通知",
				value: "notices"
			},
			{
				label: "公告",
				value: "announcements"
			},
			{
				label: "媒体聚焦",
				value: "media"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["xwxy.gdufs.edu.cn/xwzx/xyxw", "xwxy.gdufs.edu.cn/"],
			target: "/xwxy/news"
		},
		{
			source: ["xwxy.gdufs.edu.cn/xwzx/tzgg/tz"],
			target: "/xwxy/notices"
		},
		{
			source: ["xwxy.gdufs.edu.cn/xwzx/tzgg/gg"],
			target: "/xwxy/announcements"
		},
		{
			source: ["xwxy.gdufs.edu.cn/xwzx/mtjj"],
			target: "/xwxy/media"
		}
	],
	name: "新闻学院-新闻中心",
	maintainers: ["gz4zzxc"],
	handler,
	url: "xwxy.gdufs.edu.cn"
};
//#endregion
export { route };

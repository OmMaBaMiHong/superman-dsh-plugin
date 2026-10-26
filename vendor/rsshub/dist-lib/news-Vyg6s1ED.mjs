import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gmu/news.ts
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/gmu/news/gyyw",
	parameters: { type: {
		description: "新闻类型，见下表，默认为 gyyw",
		options: [
			{
				value: "gyyw",
				label: "赣医要闻"
			},
			{
				value: "ybdt",
				label: "院部动态"
			},
			{
				value: "mtgy",
				label: "媒体赣医"
			},
			{
				value: "xsjz",
				label: "学术讲座"
			}
		],
		default: "gyyw"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["gmu.cn/xwzx/gyyw.htm", "gmu.cn/"],
			target: "/news/gyyw"
		},
		{
			source: ["gmu.cn/xwzx/ybdt.htm"],
			target: "/news/ybdt"
		},
		{
			source: ["gmu.cn/xwzx/mtgy.htm"],
			target: "/news/mtgy"
		},
		{
			source: ["gmu.cn/xwzx/xsjz.htm"],
			target: "/news/xsjz"
		}
	],
	name: "新闻中心",
	maintainers: ["FrankFahey"],
	url: "gmu.cn/xwzx/gyyw.htm",
	handler
};
async function handler(ctx) {
	const newsType = {
		gyyw: {
			title: "赣医要闻",
			url: "/xwzx/gyyw.htm"
		},
		ybdt: {
			title: "院部动态",
			url: "/xwzx/ybdt.htm"
		},
		mtgy: {
			title: "媒体赣医",
			url: "/xwzx/mtgy.htm"
		},
		xsjz: {
			title: "学术讲座",
			url: "/xwzx/xsjz.htm"
		}
	}[ctx.req.param?.("type") || "gyyw"] || {
		title: "赣医要闻",
		url: "/xwzx/gyyw.htm"
	};
	const link = `https://gmu.cn${newsType.url}`;
	const $ = load((await got_default(link)).data);
	const list = $(".list ul li");
	const result = (await Promise.all(list.toArray().map(async (item) => {
		const element = $(item);
		const a = element.find("a");
		const dateText = element.find("i").text();
		const href = a.attr("href");
		const title = a.text().trim();
		if (!href || !title) return null;
		const pubDate = parseDate(dateText);
		if (!pubDate) return null;
		const fullLink = new URL(href, link).href;
		return await cache_default.tryGet(`gmu:news:${fullLink}`, async () => {
			try {
				const articleContent = load((await got_default(fullLink)).data)(".v_news_content").html() || "暂无详细内容";
				return {
					title,
					link: fullLink,
					pubDate,
					description: articleContent
				};
			} catch {
				return {
					title,
					link: fullLink,
					pubDate,
					description: "暂无详细内容"
				};
			}
		});
	}))).filter((item) => item !== null);
	return {
		title: `赣南医科大学 - ${newsType.title}`,
		link,
		description: `赣南医科大学${newsType.title}`,
		item: result
	};
}
//#endregion
export { handler, route };

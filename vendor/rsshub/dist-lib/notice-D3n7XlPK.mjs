import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hfut/xc/utils.ts
const typeMap = {
	tzgg: {
		name: "tzgg",
		url: "https://xc.hfut.edu.cn/1955/list.htm",
		root: "https://xc.hfut.edu.cn",
		title: "合肥工业大学宣城校区 - 通知公告"
	},
	gztz: {
		name: "gztz",
		url: "https://xc.hfut.edu.cn/gztz/list.htm",
		root: "https://xc.hfut.edu.cn",
		title: "合肥工业大学宣城校区 - 院系动态 - 工作通知"
	}
};
const commLink = "https://xc.hfut.edu.cn/";
const parseList = async (ctx, type) => {
	const link = typeMap[type].url;
	return {
		title: typeMap[type].title,
		link,
		resultList: await parseArticle(load((await got_default(link)).data))
	};
};
async function parseArticle($) {
	const items = $("#wp_news_w6").find("li").toArray().map((item) => {
		item = $(item);
		const oriLink = item.find("a").attr("href");
		let linkRes = oriLink;
		if (!oriLink.startsWith("http")) linkRes = commLink + item.find("a").attr("href");
		const pubDate = parseDate(item.find(".news_meta").text(), "YYYY-MM-DD");
		return {
			title: item.find("a").attr("title"),
			pubDate,
			link: linkRes
		};
	});
	return await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		let description;
		try {
			const $ = load((await got_default(item.link)).data);
			description = $(".wp_articlecontent").html() ?? $(".v_news_content").html() ?? item.link;
		} catch {
			description = item.link;
		}
		return {
			title: item.title,
			link: item.link,
			description,
			pubDate: item.pubDate
		};
	})));
}
//#endregion
//#region lib/routes/hfut/xc/notice.ts
const route = {
	path: "/xc/notice/:type?",
	categories: ["university"],
	example: "/hfut/xc/notice/tzgg",
	parameters: { type: "分类，见下表（默认为 `tzgg`)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportRadar: true,
		supportScihub: false
	},
	radar: [{ source: ["xc.hfut.edu.cn"] }],
	name: "宣城校区通知",
	maintainers: ["batemax"],
	handler,
	description: `| 通知公告 (<https://xc.hfut.edu.cn/1955/list.htm>) | 院系动态 - 工作通知 (<https://xc.hfut.edu.cn/gztz/list.htm>) |
| ------------------------------------------------- | ------------------------------------------------------------ |
| tzgg                                              | gztz                                                         |`
};
async function handler(ctx) {
	const { link, title, resultList } = await parseList(ctx, ctx.req.param("type") ?? "tzgg");
	return {
		title,
		link,
		description: "合肥工业大学宣城校区 - 通知公告",
		item: resultList
	};
}
//#endregion
export { route };

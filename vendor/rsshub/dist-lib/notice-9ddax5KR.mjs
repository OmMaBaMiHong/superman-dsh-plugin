import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hfut/hf/utils.ts
const typeMap = {
	tzgg: {
		name: "tzgg",
		url: "https://news.hfut.edu.cn/tzgg2.htm",
		root: "https://news.hfut.edu.cn",
		title: "合肥工业大学 - 通知公告"
	},
	jxky: {
		name: "jxky",
		url: "https://news.hfut.edu.cn/tzgg2.htm",
		root: "https://news.hfut.edu.cn",
		title: "合肥工业大学 - 通知公告 - 教学科研"
	},
	qttz: {
		name: "qttz",
		url: "https://news.hfut.edu.cn/tzgg2.htm",
		root: "https://news.hfut.edu.cn",
		title: "合肥工业大学 - 通知公告 - 其它通知"
	}
};
const commLink = "https://news.hfut.edu.cn/";
const parseList = async (ctx, type) => {
	const link = typeMap[type].url;
	const title = typeMap[type].title;
	const $ = load((await got_default(link)).data);
	return {
		title,
		link,
		resultList: await parseArticle(typeMap[type].name, $)
	};
};
async function parseArticle(type, $) {
	let data = $("#tzz").find("li").toArray();
	if (type === "jxky") data = $("#c01").find("li").toArray();
	else if (type === "qttz") data = $("#c02").find("li").toArray();
	const items = data.map((item) => {
		item = $(item);
		const oriLink = item.find("a").attr("href");
		let linkRes = oriLink;
		if (!oriLink.startsWith("http")) linkRes = commLink + item.find("a").attr("href");
		const pubDate = parseDate(item.find("i").text(), "YYYY-MM-DD");
		return {
			title: item.find("p").text(),
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
//#region lib/routes/hfut/hf/notice.ts
const route = {
	path: "/hf/notice/:type?",
	categories: ["university"],
	example: "/hfut/hf/notice/tzgg",
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
	radar: [{ source: ["news.hfut.edu.cn"] }],
	name: "合肥校区通知",
	maintainers: ["batemax"],
	handler,
	description: `| 通知公告 (<https://news.hfut.edu.cn/tzgg2.htm>) | 教学科研 (<https://news.hfut.edu.cn/tzgg2/jxky.htm>) | 其他通知 (<https://news.hfut.edu.cn/tzgg2/qttz.htm>) |
| ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| tzgg                                            | jxky                                                 | qttz                                                 |`
};
async function handler(ctx) {
	const { link, title, resultList } = await parseList(ctx, ctx.req.param("type") ?? "tzgg");
	return {
		title,
		link,
		description: "合肥工业大学 - 通知公告",
		item: resultList
	};
}
//#endregion
export { route };

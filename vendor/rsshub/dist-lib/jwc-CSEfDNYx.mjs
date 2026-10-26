import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bupt/jwc.ts
const route = {
	path: "/jwc/:type",
	categories: ["university"],
	example: "/bupt/jwc/tzgg",
	parameters: { type: {
		type: "string",
		optional: false,
		description: "信息类型，可选值：tzgg（通知公告），xwzx（新闻资讯）"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.bupt.edu.cn/tzgg1.htm"],
		target: "/jwc/tzgg"
	}, {
		source: ["jwc.bupt.edu.cn/xwzx2.htm"],
		target: "/jwc/xwzx"
	}],
	name: "教务处",
	maintainers: ["Yoruet"],
	handler,
	url: "jwc.bupt.edu.cn"
};
async function handler(ctx) {
	let type = ctx.req.param("type");
	if (!type) type = "tzgg";
	const rootUrl = "https://jwc.bupt.edu.cn";
	let currentUrl;
	let pageTitle;
	if (type === "tzgg") {
		currentUrl = `${rootUrl}/tzgg1.htm`;
		pageTitle = "通知公告";
	} else if (type === "xwzx") {
		currentUrl = `${rootUrl}/xwzx2.htm`;
		pageTitle = "新闻资讯";
	} else throw new Error("Invalid type parameter");
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".txt-elise").toArray().map((item) => {
		const $link = $(item).find("a");
		if ($link.length === 0 || !$link.attr("href")) return null;
		return {
			title: $link.text().trim(),
			link: "https://jwc.bupt.edu.cn/" + $link.attr("href")
		};
	}).filter(Boolean);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const newsContent = content(".v_news_content");
		newsContent.find("p, span, strong").each((_, el) => {
			const element = content(el);
			const text = element.text().trim();
			if (text === "") element.remove();
			else element.replaceWith(text);
		});
		item.description = newsContent.text().trim();
		item.pubDate = timezone(parseDate(content(".info").text().replace("发布时间：", "").trim()), 8);
		return item;
	})));
	return {
		title: `北京邮电大学教务处 - ${pageTitle}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

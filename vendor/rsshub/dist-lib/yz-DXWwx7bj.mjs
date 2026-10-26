import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/yz.ts
const host = "https://www.yz.sdu.edu.cn";
const route = {
	path: "/yz/:type?",
	categories: ["university"],
	example: "/sdu/yz/tzgg",
	parameters: { type: "默认为`tzgg`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生招生信息网",
	maintainers: ["niuyi1017"],
	handler,
	description: `| 通知公告 | 招生拓展 | 政策文件 |
| -------- | -------- | -------- |
| tzgg     | zstz     | zcwj     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const pageUrl = `${host}/index/${type}.htm`;
	const $ = load((await got_default(pageUrl)).data);
	const typeName = $(".nyrtit .tit").text() || "研究生招生信息网";
	let list = $(".txtList li").toArray().map((element) => {
		const $element = $(element);
		let itemDate = $element.find(".times").text();
		itemDate = itemDate.slice(2) + "." + itemDate.slice(0, 2);
		const aTag = $element.find("a");
		const title = aTag.attr("title") || aTag.text().trim();
		const itemPath = aTag.attr("href") ?? "";
		return {
			title,
			link: itemPath.startsWith("http") ? itemPath : new URL("/" + itemPath, pageUrl).href,
			pubDate: parseDate(itemDate)
		};
	});
	list = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const content = $(".v_news_content");
		let description = "";
		if (content.length > 0) description = content.html()?.trim() ?? "";
		const attachments = $("ul[style=\"list-style-type:none;\"]");
		if (attachments.length > 0) description += attachments.html()?.trim() ?? "";
		return {
			...item,
			description
		};
	})));
	return {
		title: `山东大学研究生招生信息网 - ${typeName}`,
		description: $("title").text(),
		link: pageUrl,
		item: list
	};
}
//#endregion
export { route };

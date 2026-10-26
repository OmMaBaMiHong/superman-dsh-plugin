import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/whu/cs.ts
const baseUrl = "https://cs.whu.edu.cn";
const route = {
	path: "/cs/:type",
	categories: ["university"],
	example: "/whu/cs/2",
	parameters: { type: "公告类型，详见表格" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机学院公告",
	maintainers: ["ttyfly"],
	handler,
	description: `| 公告类型 | 学院新闻 | 学术交流 | 通知公告 | 科研进展 |
| -------- | -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        | 3        |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	let link;
	switch (type) {
		case 0:
			link = `${baseUrl}/xwdt/xyxw.htm`;
			break;
		case 1:
			link = `${baseUrl}/kxyj/xsjl.htm`;
			break;
		case 2:
			link = `${baseUrl}/xwdt/tzgg.htm`;
			break;
		case 3:
			link = `${baseUrl}/kxyj/kyjz.htm`;
			break;
		default: throw new Error(`Unknown type: ${type}`);
	}
	const $ = load((await got_default(link)).data);
	const list = $("div.study ul li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a p").text().trim(),
			pubDate: parseDate(item.find("span").text()),
			link: new URL(item.find("a").attr("href"), link).href
		};
	});
	let items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		let response;
		try {
			response = await got_default(item.link);
		} catch {
			return null;
		}
		const $ = load(response.data);
		if ($(".prompt").length) {
			item.description = $(".prompt").html();
			return item;
		}
		const content = $(".content");
		content.find("img").each((_, e) => {
			e = $(e);
			if (e.attr("orisrc")) {
				const newUrl = new URL(e.attr("orisrc"), "https://cs.whu.edu.cn");
				e.attr("src", newUrl.href);
				e.removeAttr("orisrc");
				e.removeAttr("vurl");
			}
		});
		item.description = content.html();
		item.pubDate = $("meta[name=\"PubDate\"]").length ? timezone(parseDate($("meta[name=\"PubDate\"]").attr("content")), 8) : item.pubDate;
		return item;
	})));
	items = items.filter((item) => item !== null);
	return {
		title: $("title").first().text(),
		link,
		item: items
	};
}
//#endregion
export { route };

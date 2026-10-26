import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/yangtzeu/dongke.ts
const route = {
	path: "/dongke/*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "https://dongke.yangtzeu.edu.cn";
	const currentUrl = new URL(`${getSubPath(ctx).replace(/^\/dongke/, "") || "/yqzl/xyxw"}.htm`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("ul.list-item li a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.prop("href"), rootUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("title").text();
		item.description = content("div.v_news_content").html();
		item.category = content("meta[name=\"keywords\"]").prop("content").split(",");
		item.pubDate = timezone(parseDate(content("p.content-info").text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[1]), 8);
		return item;
	})));
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		language: "zh-cn",
		image: new URL($("#head-img a img").prop("src"), rootUrl).href,
		author: "长江大学动物科学学院"
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nowcoder/discuss.ts
const host = "https://www.nowcoder.com";
const route = {
	path: "/discuss/:type/:order",
	categories: ["bbs"],
	example: "/nowcoder/discuss/2/4",
	parameters: {
		type: "讨论区分区id 在 URL 中可以找到",
		order: "排序方式"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "讨论区",
	maintainers: ["LogicJake"],
	handler,
	description: `| 最新回复 | 最新发表 | 最新 | 精华 |
| -------- | -------- | ---- | ---- |
| 0        | 3        | 1    | 4    |`
};
async function handler(ctx) {
	const link = `https://www.nowcoder.com/discuss?type=${ctx.req.param("type")}&order=${ctx.req.param("order")}`;
	const $ = load((await got_default.get(link)).data);
	const type_name = $("a.discuss-tab.selected").text();
	const order_name = $("li.selected a").text();
	const list = $("li.clearfix").toArray().map((element) => {
		return {
			title: $(element).find("div.discuss-main.clearfix a:first").text().trim().replaceAll("\n", " "),
			link: $(element).find("div.discuss-main.clearfix a[rel]").attr("href")
		};
	});
	const out = await Promise.all(list.map((info) => {
		const title = info.title || "tzgg";
		const itemUrl = new URL(info.link, host).href.replace(/^([^\n\r\u{2028}\u{2029}]*)\?[^\n\r?\u{2028}\u{2029}]*$/u, "$1");
		return cache_default.tryGet(itemUrl, async () => {
			const $ = load((await got_default.get(itemUrl)).data);
			const date_value = $("span.post-time").text();
			const description = $(".nc-post-content").html();
			return {
				title,
				link: itemUrl,
				description,
				pubDate: timezone(parseDate(date_value), 8)
			};
		});
	}));
	return {
		title: `${type_name}${order_name}——牛客网讨论区`,
		link,
		item: out
	};
}
//#endregion
export { route };

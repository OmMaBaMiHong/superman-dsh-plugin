import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as ossUrl, r as rootUrl, t as ProcessFeed } from "./utils-B0m9BN2p.mjs";
import { load } from "cheerio";
//#region lib/routes/aisixiang/toplist.ts
const route = {
	path: ["/ranking/:id?/:period?", "/toplist/:id?/:period?"],
	name: "Unknown",
	maintainers: ["HenryQW", "nczitzk"],
	handler,
	description: `| 文章点击排行 | 最近更新文章 | 文章推荐排行 |
| ------------ | ------------ | ------------ |
| 1            | 10           | 11           |`
};
async function handler(ctx) {
	const { id = "1", period = "1" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const currentUrl = new URL(`toplist${id ? `?id=${id}${id === "1" ? `&period=${period}` : ""}` : ""}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const title = `${$("a.hl").text() || ""}${$("title").text().split("_", 1)[0]}`;
	return {
		item: await ProcessFeed(limit, $("div.tops_list").slice(0, limit).toArray().map((item) => {
			item = $(item);
			const a = item.find("div.tips a");
			return {
				title: a.text(),
				link: new URL(a.prop("href"), rootUrl).href,
				author: item.find("div.name").text(),
				pubDate: parseDate(item.find("div.times").text())
			};
		})),
		title: `爱思想 - ${title}`,
		link: currentUrl,
		language: "zh-cn",
		image: new URL("images/logo_toplist.jpg", ossUrl).href,
		subtitle: title
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/12371/zxfb.ts
const handler = async (ctx) => {
	const { category = "zxfb" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const currentUrl = `https://www.12371.cn/${category}/`;
	const response = await got_default(currentUrl);
	const $ = cheerio.load(response.data);
	const topNewsList = JSON.parse($("script[language=\"javascript\"]").text().match(/item=(\[\{.*?\}\]);/)?.[1].replaceAll("'", "\"") || "[]").slice(0, limit).map((item) => ({
		title: item.title,
		pubDate: timezone(parseDate(item.brief, "YYYY-MM-DD HH:mm:ss"), 8),
		link: item.link_add
	}));
	const items = await Promise.all(topNewsList.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(item.link);
		item.description = cheerio.load(detailResponse.data)(".word").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
};
const route = {
	path: "/:category?",
	example: "/12371/zxfb",
	parameters: { category: "新闻分类名，预设 `zxfb`" },
	radar: [{ source: ["www.12371.cn/:category"] }],
	name: "最新发布",
	maintainers: ["zvrr"],
	handler,
	url: "www.12371.cn",
	description: `| 最新发布 |
| :------: |
|   zxfb   |`
};
//#endregion
export { route };

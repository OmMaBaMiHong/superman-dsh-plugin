import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cneb/yjxw.ts
const indexs = {
	gnxw: 0,
	gjxw: 1
};
const route = {
	path: "/yjxw/:category?",
	categories: ["forecast"],
	example: "/cneb/yjxw",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cneb.gov.cn/yjxw/:category?", "cneb.gov.cn/"] }],
	name: "应急新闻",
	maintainers: ["nczitzk"],
	handler,
	description: `| 全部 | 国内新闻 | 国际新闻 |
| ---- | -------- | -------- |
|      | gnxw     | gjxw     |`
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 400;
	const category = ctx.req.param("category") ?? "";
	const index = Object.hasOwn(indexs, category) ? indexs[category] : -1;
	const currentUrl = `http://www.cneb.gov.cn/yjxw${category ? `/${category}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	if (index !== -1) {
		const otherIndex = Math.abs(index - 1);
		$(".first-data").eq(otherIndex).remove();
		$(".moreContent").eq(otherIndex).remove();
	}
	let items = $(".list").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: timezone(parseDate(item.find("span").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".w940").html();
		item.author = content(".source span").last().text();
		return item;
	})));
	return {
		title: `国家应急广播 - ${index === -1 ? "新闻" : $(".select").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

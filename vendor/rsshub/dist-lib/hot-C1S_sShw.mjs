import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as playwrightGet, t as baseUrl } from "./utils-CwBD7raC.mjs";
import { load } from "cheerio";
//#region lib/routes/pincong/hot.ts
const route = {
	path: "/hot/:category?",
	categories: ["bbs"],
	example: "/pincong/hot",
	parameters: { category: "分类，与官网分类 URL `category-` 后的数字对应，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "精选",
	maintainers: ["zphw"],
	handler
};
async function handler(ctx) {
	const { category = "0" } = ctx.req.param();
	const $ = load(await playwrightGet(`${baseUrl}/hot/list/category-${category}`, cache_default));
	const list = $("div.aw-item");
	return {
		title: "品葱 - 精选",
		link: `${baseUrl}/hot/${category === "0" ? "" : `category-${category}`}`,
		item: list.toArray().map((item) => ({
			title: $(item).find("h2 a").text().trim(),
			description: $(item).find("div.markitup-box").html(),
			link: baseUrl + $(item).find("div.mod-head h2 a").attr("href"),
			pubDate: parseDate($(item).find("div.mod-footer .aw-small-text").text())
		}))
	};
}
//#endregion
export { route };

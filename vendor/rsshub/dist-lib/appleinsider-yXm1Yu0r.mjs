import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/appleinsider/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/appleinsider",
	parameters: { category: "Category, see below, News by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["appleinsider.com/:category", "appleinsider.com/"],
		target: "/:category"
	}],
	name: "Category",
	maintainers: ["nczitzk"],
	handler,
	description: `| News | Reviews | How-tos |
| ---- | ------- | ------- |
|      | reviews | how-to  |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const currentUrl = `https://appleinsider.com${category ? `/${category}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(`${category === "" ? "#news-river " : ""}.river`).slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item).find("a").first();
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("#article-social").next().remove();
		content("#article-hero, #article-social").remove();
		content(".deals-widget").remove();
		item.title = content(".h1-adjust").text();
		item.author = content(".avatar-link a").attr("title");
		item.pubDate = parseDate(content("time").first().attr("datetime"));
		item.description = content("header").next(".row").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

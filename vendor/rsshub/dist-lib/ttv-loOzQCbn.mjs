import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ttv/index.ts
const route = {
	path: "/:category?",
	categories: ["traditional-media"],
	example: "/ttv",
	parameters: { category: "分类" },
	name: "分类",
	maintainers: ["dzx-dzx"],
	radar: [{ source: ["news.ttv.com.tw/:category"] }],
	handler
};
async function handler(ctx) {
	const rootUrl = "https://news.ttv.com.tw";
	const category = ctx.req.param("category") ?? "realtime";
	const currentUrl = `${rootUrl}/${["realtime", "focus"].includes(category) ? category : `category/${category}`}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("div.news-list li").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item);
		return { link: $(item).find("a").attr("href") };
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("title").text();
		item.pubDate = timezone(parseDate(content("meta[property=\"article:published_time\"]").attr("content")), 8);
		item.category = content("div.article-body ul.tag").find("a").toArray().map((t) => content(t).text());
		const section = content("meta[property='article:section']").attr("content");
		if (!item.category.includes(section)) item.category.push(section);
		item.description = content("#newscontent").html();
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

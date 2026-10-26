import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/ftm/index.ts
const route = {
	path: "/",
	categories: ["new-media"],
	example: "/ftm",
	parameters: {},
	name: "文章",
	maintainers: ["dzx-dzx"],
	radar: [{ source: ["www.ftm.eu"] }],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.ftm.eu/articles`;
	const $ = load(await rofetch(currentUrl));
	const list = $(".article-card").toArray().map((e) => ({
		link: $(e).attr("href"),
		title: $(e).find("h2").text()
	})).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : Infinity);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		const ldjson = JSON.parse(content("[type=\"application/ld+json\"]:not([data-schema])").text());
		item.pubDate = parseDate(ldjson.datePublished);
		item.updated = parseDate(ldjson.dateModified);
		item.author = content("[name='author']").toArray().map((e) => ({ name: $(e).attr("content") }));
		item.category = content(".collection .tab").text().trim() || null;
		item.description = content(".body").html();
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

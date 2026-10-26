import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/gisreportsonline/index.ts
const route = {
	path: "/:path{.+}?",
	categories: ["new-media"],
	example: "/gisreportsonline/gis/c/security-challenges/",
	parameters: { path: "包含\"Reports\"页面下的路径" },
	name: "报告",
	maintainers: ["dzx-dzx"],
	radar: [{ source: ["www.gisreportsonline.com"] }],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.gisreportsonline.com/${ctx.req.param("path") ?? ""}`;
	const $ = load(await rofetch(currentUrl));
	const list = $("article h3 a").toArray().map((e) => ({
		link: $(e).attr("href"),
		title: $(e).text()
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		const ldjson = JSON.parse(content("script.rank-math-schema-pro").text())["@graph"].find((e) => e["@type"] === "NewsArticle");
		item.pubDate = parseDate(ldjson.datePublished);
		item.updated = parseDate(ldjson.dateModified);
		item.author = [ldjson.author];
		item.category = ldjson.keywords.split(",");
		item.language = ldjson.inLanguage;
		item.description = content("header.entry-header ~ :not(#pos-conclusion ~ *)").toArray().map((e) => content(e).prop("outerHTML")).join("");
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

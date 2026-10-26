import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as fetchArticle } from "./utils-Di-Yubas.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/apnews/sitemap.ts
const HOME_PAGE = "https://apnews.com";
const route = {
	path: "/sitemap/:route",
	categories: ["traditional-media"],
	example: "/apnews/sitemap/ap-sitemap-latest",
	view: 0,
	parameters: { route: { description: "Route for sitemap, excluding the `.xml` extension" } },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["apnews.com/"] }],
	name: "Sitemap",
	maintainers: [
		"zoenglinghou",
		"mjysci",
		"TonyRL",
		"dzx-dzx"
	],
	handler
};
async function handler(ctx) {
	const route = ctx.req.param("route");
	const $ = load(await rofetch(`${HOME_PAGE}/${route}.xml`));
	const list = $("urlset url").toArray().map((e) => {
		const LANGUAGE_MAP = /* @__PURE__ */ new Map([["eng", "en"], ["spa", "es"]]);
		const title = $(e).find(String.raw`news\:title`).text();
		const pubDate = parseDate($(e).find(String.raw`news\:publication_date`).text());
		const lastmod = timezone(parseDate($(e).find("lastmod").text()), -4);
		const language = LANGUAGE_MAP.get($(e).find(String.raw`news\:language`).text());
		let res = { link: $(e).find("loc").text() };
		if (title) res = Object.assign(res, { title });
		if (pubDate.toString() !== "Invalid Date") res = Object.assign(res, { pubDate });
		if (language) res = Object.assign(res, { language });
		if (lastmod.toString() !== "Invalid Date") res = Object.assign(res, { lastmod });
		return res;
	}).filter((e) => Boolean(e.link) && !new URL(e.link).pathname.split("/").includes("hub")).toSorted((a, b) => a.pubDate && b.pubDate ? b.pubDate - a.pubDate : b.lastmod - a.lastmod).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20);
	const items = ctx.req.query("fulltext") === "true" ? await pMap(list, (item) => fetchArticle(item), { concurrency: 20 }) : list;
	return {
		title: `AP News sitemap:${route}`,
		item: items,
		link: "https://apnews.com"
	};
}
//#endregion
export { route };

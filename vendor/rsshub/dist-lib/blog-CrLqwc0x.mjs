import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/lancedb/blog.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const baseUrl = "https://lancedb.com";
	const url = category ? `${baseUrl}/blog/category/${category}` : `${baseUrl}/blog`;
	const $ = load(await rofetch(url));
	const items = $("article").toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("h2 a").text().trim();
		const link = $el.find("h2 a").attr("href");
		const description = $el.find("p.post-description").text().trim();
		const [cat, author, dateStr] = $el.find(".post-meta").text().trim().replaceAll(/\s+/g, " ").split(" / ");
		return {
			title,
			link,
			description,
			pubDate: dateStr ? parseDate(dateStr) : void 0,
			author,
			category: cat ? [cat] : []
		};
	});
	return {
		title: `LanceDB Blog${category ? ` - ${category}` : ""}`,
		link: url,
		item: items
	};
};
const route = {
	path: "/blog/:category?",
	name: "Blog",
	url: "lancedb.com/blog",
	maintainers: ["HUSTERGS"],
	example: "/lancedb/blog",
	parameters: { category: "filter blog post by category, return all posts if not specified" },
	description: void 0,
	categories: ["programming"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["lancedb.com/blog", "lancedb.com/blog/category/:category"],
		target: "/blog/:category"
	}],
	view: 0,
	handler
};
//#endregion
export { handler, route };

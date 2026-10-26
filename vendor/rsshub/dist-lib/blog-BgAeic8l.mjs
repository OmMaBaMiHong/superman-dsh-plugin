import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/tailwindcss/constants.ts
/** The base URL of this route. */
const BASE_URL = new URL("https://tailwindcss.com/");
//#endregion
//#region lib/routes/tailwindcss/utils.ts
/** Fetch the content of a given article. */
const fetchArticleContent = async (url) => {
	return load(await rofetch(url, { responseType: "text" }))("article.prose").html() ?? "";
};
/** Fetch the feed object. */
const fetchFeed = async (limit) => {
	const url = new URL("/feeds/atom.xml", BASE_URL).href;
	const $ = load(await rofetch(url, { responseType: "text" }), { xml: true });
	const items = await Promise.all($("entry").toArray().slice(0, limit).map((entry) => {
		const title = $(entry).find("title").text();
		const id = $(entry).find("id").text();
		const url = $(entry).find("link[href]").attr("href");
		const imageUrl = $(entry).find("link[rel=\"enclosure\"]").attr("href");
		if (url === void 0) throw new Error(`No article URL found for article with id ${id}`);
		return cache_default.tryGet(`tailwindcss:${id}`, async () => ({
			title,
			link: url,
			image: imageUrl,
			description: await fetchArticleContent(url),
			author: $(entry).find("author").toArray().map((el) => ({
				name: $(el).find("name").text(),
				url: $(el).find("url").text()
			})),
			pubDate: $(entry).find("updated").text(),
			guid: $(entry).find("id").text()
		}));
	}));
	return {
		title: $("feed > title").text(),
		item: items,
		author: $("feed > author > name").text(),
		logo: $("feed > logo").text(),
		icon: $("feed > icon").text(),
		description: $("feed > subtitle").text(),
		link: $("feed > link[rel=\"alternate\"]").attr("href")
	};
};
//#endregion
//#region lib/routes/tailwindcss/blog.ts
const handler = (ctx) => {
	return fetchFeed(Number.parseInt(ctx.req.query("limit") || "10"));
};
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/tailwindcss/blog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Blog",
	maintainers: ["goestav"],
	handler
};
//#endregion
export { handler, route };

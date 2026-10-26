import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/railway/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/railway/blog",
	url: "blog.railway.com",
	name: "Blog",
	maintainers: ["jihuayu"],
	handler
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit") || "10");
	return {
		title: "Railway articles",
		link: "https://blog.railway.com",
		item: await fetchArticles(limit)
	};
}
const fetchArticles = async (limit) => {
	const $ = load(await rofetch("https://blog.railway.com/rss.xml", { responseType: "text" }), { xml: true });
	return Promise.all($("item").toArray().slice(0, limit).map((element) => {
		const id = $(element).find("guid").text();
		return cache_default.tryGet(`railway:blogs:${id}`, async () => {
			const title = $(element).find("title").text();
			const pubDate = $(element).find("pubDate").text();
			const link = $(element).find("link").text();
			const { content } = await fetchArticleDetails(link);
			return {
				guid: id,
				title,
				link,
				pubDate: parseDate(pubDate),
				description: content
			};
		});
	}));
};
const fetchArticleDetails = async (url) => {
	return { content: load(await rofetch(url))("article > section ").html() ?? void 0 };
};
//#endregion
export { fetchArticleDetails, fetchArticles, route };

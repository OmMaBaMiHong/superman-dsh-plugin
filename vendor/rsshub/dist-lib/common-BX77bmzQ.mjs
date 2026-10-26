import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/openai/common.tsx
const BASE_URL = new URL("https://openai.com");
/** Fetch the details of an article. */
const fetchArticleDetails = async (url) => {
	const normalizedUrl = url.endsWith("/") ? url : `${url}/`;
	const $ = load(await rofetch(normalizedUrl, { responseType: "text" }));
	const $article = $("#main article");
	const categories = $("h1").prev().find("a[href]").toArray().map((element) => $(element).text());
	const authors = $("[data-testid=\"author-list\"] a").toArray().map((element) => $(element).text());
	$($article.find("h1").parents().get(4)).remove();
	$article.children().last().remove();
	$article.find("#citations").remove();
	return {
		content: $article.html(),
		categories,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: authors.join(", "),
		link: normalizedUrl
	};
};
/** Fetch all articles from OpenAI's RSS feed. */
const fetchArticles = async (limit, category) => {
	const $ = load(await rofetch("https://openai.com/news/rss.xml", {
		responseType: "text",
		headers: { "User-Agent": config.ua }
	}), { xml: true });
	let items = $("item").toArray();
	if (category) items = items.filter((element) => $(element).find("category").text() === category);
	return Promise.all(items.slice(0, limit).map((element) => {
		const id = $(element).find("guid").text();
		return cache_default.tryGet(`openai:news:${id}`, async () => {
			const title = $(element).find("title").text();
			const pubDate = parseDate($(element).find("pubDate").text());
			const link = $(element).find("link").text();
			const { content, categories, author, link: articleLink } = await fetchArticleDetails(link);
			return {
				guid: id,
				title,
				link: articleLink,
				pubDate,
				description: content,
				category: categories,
				author
			};
		});
	}));
};
//#endregion
export { fetchArticles as n, BASE_URL as t };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/meteoblue/weathernews.ts
const route = {
	path: "/weathernews",
	name: "Weather News",
	maintainers: ["tssujt"],
	handler,
	example: "/meteoblue/weathernews",
	categories: ["blog"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: "Weather news and articles from meteoblue"
};
async function handler() {
	const baseUrl = "https://www.meteoblue.com";
	const url = `${baseUrl}/en/blog/article/weathernews`;
	const $ = load(await rofetch(url));
	return {
		title: "meteoblue Weather News",
		link: url,
		description: "Latest weather news and articles from meteoblue",
		item: $("article[itemprop=\"blogPost\"]").toArray().map((element) => {
			const $article = $(element);
			const $link = $article.find("h3[itemprop=\"headline\"] a[itemprop=\"mainEntityOfPage\"]");
			const title = $link.text().trim();
			const link = $link.attr("href");
			if (!title || !link) return null;
			const dateText = $article.find("time[itemprop=\"datePublished\"]").attr("datetime") || "";
			const author = $article.find("meta[itemprop=\"author\"]").attr("content")?.trim() || "meteoblue";
			const description = $article.find("div[itemprop=\"description\"]").text().trim() || title;
			return {
				title,
				link: link.startsWith("http") ? link : `${baseUrl}${link}`,
				pubDate: dateText ? parseDate(dateText) : void 0,
				author,
				description
			};
		}).filter(Boolean),
		allowEmpty: true
	};
}
//#endregion
export { route };

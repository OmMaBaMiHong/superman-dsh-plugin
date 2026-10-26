import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/warhammer-community/news.ts
const route = {
	path: "/news",
	categories: ["game"],
	example: "/warhammer-community/news",
	radar: [{ source: ["www.warhammer-community.com/en-gb/all-news-and-features/", "www.warhammer-community.com/en-gb/"] }],
	name: "News",
	maintainers: ["TonyRL"],
	handler,
	url: "www.warhammer-community.com/en-gb/all-news-and-features/"
};
async function handler(ctx) {
	const baseUrl = "https://www.warhammer-community.com";
	const limit = Number(ctx.req.query("limit") || "16");
	const list = (await rofetch(`${baseUrl}/api/search/news/`, {
		method: "POST",
		body: {
			sortBy: "date_desc",
			category: "",
			collections: ["articles"],
			game_systems: [],
			index: "news",
			locale: "en-gb",
			page: 0,
			perPage: limit,
			topics: []
		}
	})).news.map((item) => ({
		title: item.title,
		link: `${baseUrl}/en-gb${item.uri}/`,
		description: item.excerpt,
		image: `https://assets.warhammer-community.com/${item.image.path}`,
		pubDate: parseDate(item.date),
		category: item.topics.map((topic) => topic.title)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link))(".article-content");
		content.find("button").remove();
		item.description = content.html() || item.description;
		return item;
	})));
	return {
		title: "All News and Features - Warhammer Community",
		link: `${baseUrl}/en-gb/all-news-and-features/`,
		image: `${baseUrl}/images/apple-favicon.png`,
		item: items
	};
}
//#endregion
export { route };

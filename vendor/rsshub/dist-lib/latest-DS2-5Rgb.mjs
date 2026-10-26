import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/vertikal/latest.ts
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/vertikal/latest",
	radar: [{ source: ["vertikal.net/en/news", "vertikal.net"] }],
	name: "News Archive",
	maintainers: ["TonyRL"],
	handler,
	url: "vertikal.net/en/news"
};
const baseUrl = "https://vertikal.net";
async function handler() {
	const response = await rofetch(`${baseUrl}/en/homepage/async-news-loader`, { query: {
		perPage: 24,
		page: 1
	} });
	const $ = cheerio.load(response);
	const list = $(".grid__column").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".news-teaser__title").text(),
			link: `${baseUrl}${$item.find(".news-teaser").attr("href")}`,
			pubDate: parseDate($item.find(".news-teaser__date").text(), "DD.MM.YYYY"),
			description: $item.find(".news-teaser__text").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link);
		const $ = cheerio.load(response);
		const content = $(".newsentry");
		item.category = content.find(".newsentry__tags a").toArray().map((tag) => $(tag).text().trim());
		content.find(".newsentry__date, .newsentry__title, .lazyimage-placeholder, .newsentry__tags, .newsentry__share, .newsentry__comments, .newsentry__write-comment").remove();
		item.description = content.html();
		return item;
	})));
	return {
		title: "News Archive | Vertikal.net",
		link: `${baseUrl}/en/news`,
		image: `${baseUrl}/apple-touch-icon-152x152.png`,
		item: items
	};
}
//#endregion
export { route };

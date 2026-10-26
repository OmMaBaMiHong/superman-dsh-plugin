import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
import "dayjs/locale/fr.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
//#region lib/routes/altotrain/news.ts
dayjs.extend(localizedFormat);
const route = {
	path: "/:language?",
	categories: ["travel"],
	example: "/altotrain/en",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"altotrain.ca/:language",
			"altotrain.ca/:language/news",
			"altotrain.ca/:language/nouvelles"
		],
		target: "/:language"
	}],
	name: "Alto News",
	maintainers: ["elibroftw"],
	handler: async (ctx) => {
		const { language = "en" } = ctx.req.param();
		const link = language === "fr" ? "https://www.altotrain.ca/fr/nouvelles" : "https://www.altotrain.ca/en/news";
		const $ = load(await rofetch(link));
		const featuredPost = $("body > div:first-of-type > main > div:nth-of-type(2) > div:nth-of-type(2) > div > div:first-of-type > div > a").first();
		const featuredItems = featuredPost.length ? (() => {
			return [extractItem(featuredPost, language)];
		})() : [];
		const posts = $(".tw-grid > div.tw-flex.tw-flex-col").toArray().map((el) => {
			return extractItem($(el).find("a").first(), language);
		});
		return {
			title: "Alto News",
			link,
			item: [...featuredItems, ...posts]
		};
	}
};
function extractItem(a, language) {
	const href = a.attr("href");
	const title = a.find("h2, h3").first().text().trim();
	const description = a.find("p").first().text().trim();
	const dateMatch = language === "fr" ? description.match(/(\d{1,2} [a-zéû]+\.? \d{4})/i) : description.match(/([A-Z][a-z]+\.? \d{1,2}, \d{4})/);
	const pubDate = parseDate(dateMatch ? dateMatch[1].trim() : "");
	const src = a.find("img").first().attr("src");
	return {
		title,
		link: href,
		pubDate,
		author: "Alto",
		category: ["News"],
		description,
		id: href,
		image: src ? new URL(src, "https://www.altotrain.ca").href : void 0
	};
}
//#endregion
export { route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/google/jules.ts
const route = {
	path: "/jules/changelog",
	categories: ["program-update"],
	example: "/google/jules/changelog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Jules Changelog",
	url: "jules.google/docs/changelog/",
	maintainers: ["johan456789"],
	handler
};
async function handler() {
	const url = "https://jules.google/docs/changelog/";
	const $ = load(await rofetch(url));
	return {
		title: "Jules Changelog",
		link: url,
		item: $("main article").toArray().map((el) => {
			const article = $(el);
			const h2 = article.find("h2");
			const id = h2.attr("id") || article.attr("id");
			const title = h2.text().trim();
			const anchor = id ? `${url}#${id}` : url;
			const pubDateText = h2.next("span").text().trim();
			const imgSrc = article.find("img").first().attr("src");
			const image = imgSrc ? new URL(imgSrc, url).href : void 0;
			article.find("header").remove();
			article.find(".sr-only").remove();
			return {
				title,
				description: article.html(),
				link: anchor,
				pubDate: pubDateText ? parseDate(pubDateText) : void 0,
				image
			};
		})
	};
}
//#endregion
export { route };

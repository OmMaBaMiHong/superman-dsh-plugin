import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/flashcat/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/flashcat/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["flashcat.cloud/blog"],
		target: "/blog"
	}],
	name: "快猫星云博客",
	maintainers: ["chesha1"],
	handler: handlerRoute
};
async function handlerRoute() {
	const baseUrl = "https://flashcat.cloud";
	const link = `${baseUrl}/blog/`;
	const $ = load(await rofetch(link));
	return {
		title: "Flashcat 快猫星云博客",
		link,
		item: $(".fc-content-card").toArray().map((elem) => {
			const $item = $(elem);
			const [author, date] = $item.find(".fc-content-card-meta").text().split("·").map((s) => s.trim());
			return {
				title: $item.find(".fc-content-card-title").text(),
				description: $item.find(".fc-content-card-summary").text().trim(),
				link: new URL($item.find(".fc-content-card-link").attr("href"), baseUrl).href,
				pubDate: date ? parseDate(date, "YYYY-MM-DD") : void 0,
				author
			};
		})
	};
}
//#endregion
export { route };

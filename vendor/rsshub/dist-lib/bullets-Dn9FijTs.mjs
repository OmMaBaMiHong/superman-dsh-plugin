import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/finology/bullets.ts
const route = {
	path: "/bullets",
	categories: ["finance"],
	view: 5,
	example: "/finology/bullets",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["insider.finology.in/bullets"] }],
	name: "Bullets",
	maintainers: ["Rjnishant530"],
	handler,
	url: "insider.finology.in/bullets"
};
async function handler() {
	const baseUrl = "https://insider.finology.in/bullets";
	const $ = load(await rofetch(baseUrl));
	return {
		title: "Finology Insider Bullets",
		link: baseUrl,
		item: $("body > div.flex.bullettext > div.w80 > div").toArray().map((item) => {
			const $item = $(item);
			const time = $item.find("div.timeline-info span").text().split(", ", 2)[1];
			const a = $item.find("a.timeline-title");
			const description = $item.find("div.bullet-desc").html();
			return {
				title: a.text(),
				link: a.attr("href"),
				pubDate: parseDate(time),
				description
			};
		}),
		description: "Your daily dose of crisp, spicy financial news in 80 words.",
		logo: "https://insider.finology.in/Images/favicon/favicon.ico",
		icon: "https://insider.finology.in/Images/favicon/favicon.ico",
		language: "en-us"
	};
}
//#endregion
export { route };

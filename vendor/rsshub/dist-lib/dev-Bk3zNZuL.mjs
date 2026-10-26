import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/syosetu/dev.ts
const route = {
	path: "/dev",
	categories: ["program-update"],
	example: "/syosetu/dev",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "なろう小説 API の更新履歴",
	url: "dev.syosetu.com",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [{
		title: "なろう小説 API の更新履歴",
		source: ["dev.syosetu.com"],
		target: "/dev"
	}]
};
async function handler() {
	const url = "https://dev.syosetu.com";
	const $ = load(await rofetch(url));
	const logContainer = $(".c-log");
	const dates = logContainer.find("dt").toArray().map((element) => $(element).text().trim());
	const contents = logContainer.find("dd").toArray().map((element) => $(element).text().trim());
	return {
		title: "なろうデベロッパー - なろう小説 API の更新履歴",
		link: url,
		language: "ja",
		item: dates.map((date, index) => ({
			date,
			content: contents[index]?.replaceAll("\n", "<br>") ?? ""
		})).filter((update) => update.content).map((update) => ({
			title: update.date,
			description: update.content,
			pubDate: parseDate(update.date.replace("/", "-")),
			guid: `syosetu:dev:${update.date}`
		}))
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as rootUrl } from "./utils-DUymk-QL.mjs";
import { load } from "cheerio";
//#region lib/routes/gitpod/changelog.ts
const route = {
	path: "/changelog",
	categories: ["programming"],
	example: "/gitpod/changelog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gitpod.io/changelog", "gitpod.io/"] }],
	name: "Changelog",
	maintainers: ["TonyRL"],
	handler,
	url: "gitpod.io/changelog"
};
async function handler() {
	const $ = load((await got_default(rootUrl + "/changelog")).data);
	const items = $("div[class^=changelog-entry]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h2").text(),
			link: rootUrl + item.find("a").attr("href"),
			description: item.find("div[class^=content-docs]").html(),
			pubDate: parseDate(item.find("a[class*=mb-xx-small]").text()),
			author: item.find("span[class^=flex-shrink-0]").eq(0).find("img").toArray().map((e) => $(e).attr("alt").replace("Avatar of ", "")).join(", ")
		};
	});
	return {
		title: $("title").text(),
		link: rootUrl + "/changelog",
		description: $("meta[name=\"description\"]").attr("content"),
		language: "en-US",
		item: items
	};
}
//#endregion
export { route };

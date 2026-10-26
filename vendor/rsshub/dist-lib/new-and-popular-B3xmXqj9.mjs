import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as rootUrl, t as processList } from "./utils-Chd3GrJZ.mjs";
import { load } from "cheerio";
//#region lib/routes/30secondsofcode/new-and-popular.ts
const route = {
	path: "/latest",
	categories: ["programming"],
	example: "/30secondsofcode/latest",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["30secondsofcode.org"],
		target: "/latest"
	}],
	name: "New & Popular Snippets",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	return {
		title: "New & Popular Snippets",
		description: "Discover short code snippets for all your development needs.",
		link: rootUrl,
		item: await processList(load(await rofetch(rootUrl))("section.preview-list > ul > li").toArray())
	};
}
//#endregion
export { route };

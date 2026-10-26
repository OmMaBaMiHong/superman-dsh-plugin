import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zotero/versions.ts
const route = {
	path: "/versions",
	categories: ["program-update"],
	example: "/zotero/versions",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zotero.org/", "zotero.org/support/changelog"] }],
	name: "Version History",
	maintainers: ["jasongzy"],
	handler,
	url: "zotero.org/"
};
async function handler() {
	const url = "https://www.zotero.org/support/changelog";
	const data = (await got_default(url)).data;
	const $ = load(data);
	return {
		title: "Zotero - Version History",
		link: url,
		item: $("h2").toArray().map((item) => {
			item = $(item);
			let date = $(item).text().match(/\((.*)\)/);
			date = Array.isArray(date) ? date[1] : null;
			return {
				title: item.text().trim(),
				description: $("<div/>").append(item.nextUntil("h2").clone()).html(),
				pubDate: date,
				link: "https://www.zotero.org/support/changelog#" + item.attr("id")
			};
		})
	};
}
//#endregion
export { route };

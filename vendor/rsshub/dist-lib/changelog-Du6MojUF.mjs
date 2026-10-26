import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/webcatalog/changelog.ts
const route = {
	path: "/changelog",
	categories: ["program-update"],
	example: "/webcatalog/changelog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["desktop.webcatalog.io/:lang/changelog"] }],
	name: "Changelog",
	maintainers: ["Tsuyumi25"],
	handler,
	url: "desktop.webcatalog.io/en/changelog"
};
async function handler() {
	const url = "https://desktop.webcatalog.io/en/changelog";
	const $ = load(await rofetch(url));
	$(".container article div.mb-20").remove();
	return {
		title: "WebCatalog Changelog",
		link: url,
		item: $(".container article").html()?.split("<hr>")?.map((section) => {
			const $section = load(section);
			const month = $section("h1").remove().text();
			const title = $section("h2").first().remove().text();
			return {
				title: `${month} - ${title}`,
				description: $section.html(),
				link: url,
				pubDate: parseDate(month),
				guid: `webcatalog-${month}-${title}`
			};
		}),
		language: "en"
	};
}
//#endregion
export { route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/gitkraken/release-note.ts
const route = {
	path: "/release-note",
	categories: ["program-update"],
	example: "/gitkraken/release-note",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["help.gitkraken.com/gitkraken-desktop/current/"] }, { source: ["www.gitkraken.com/"] }],
	name: "Release Notes",
	maintainers: ["TonyRL"],
	url: "help.gitkraken.com/gitkraken-desktop/current/",
	handler
};
async function handler() {
	const baseUrl = "https://help.gitkraken.com";
	const link = `${baseUrl}/gitkraken-desktop/current/`;
	const response = await rofetch(`${baseUrl}/wp-json/wp/v2/posts/1964`);
	const $ = load(response.content.rendered, null, false);
	const items = $("h2").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.text(),
			description: $item.next().nextUntil("hr").toArray().map((el) => $.html(el)).join(""),
			link: `${link}#${$item.prev().find("a[id]").attr("id")}`,
			pubDate: parseDate($item.next().find("kbd").text()?.split("day, ", 2)[1].trim(), "MMMM Do, YYYY", "en")
		};
	});
	return {
		title: response.title.rendered,
		description: sanitizeHtml(response.excerpt.rendered, {
			allowedTags: [],
			allowedAttributes: {}
		}),
		link,
		item: items
	};
}
//#endregion
export { route };

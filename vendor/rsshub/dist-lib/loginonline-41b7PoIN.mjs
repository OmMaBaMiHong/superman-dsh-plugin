import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/usenix/loginonline.ts
const route = {
	path: "/loginonline",
	categories: ["journal"],
	example: "/usenix/loginonline",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"usenix.org/publications/loginonline",
		"usenix.org/publications",
		"usenix.org/"
	] }],
	name: ";login:",
	maintainers: ["wu-yufei"],
	handler
};
async function handler() {
	const baseUrl = "https://www.usenix.org";
	const { data: response } = await got_default(`${baseUrl}/publications/loginonline`);
	const $ = load(response);
	const list = $("div.views-row").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".views-field-title").text().trim(),
			link: `${baseUrl}${item.find("a").attr("href")}`,
			pubDate: parseDate(item.find(".views-field-field-lv2-publication-date").text()),
			author: item.find(".views-field-pseudo-author-list").text().trim().replace("Authors: ", "")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)(".group-article-body-wrapper").html();
		return item;
	})));
	return {
		title: "USENIX ;login:",
		link: `${baseUrl}/publications/loginonline`,
		description: "An open access publication driven by the USENIX community",
		item: items
	};
}
//#endregion
export { route };

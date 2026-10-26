import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/diskanalyzer/whats-new.ts
const route = {
	path: "/whats-new",
	categories: ["program-update"],
	example: "/diskanalyzer/whats-new",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["diskanalyzer.com/whats-new", "diskanalyzer.com/"] }],
	name: "What's New",
	maintainers: ["nczitzk"],
	handler,
	url: "diskanalyzer.com/whats-new"
};
async function handler() {
	const currentUrl = `https://diskanalyzer.com/whats-new`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".blog-content h4").toArray().map((item) => {
		item = $(item);
		const title = item.text();
		let description = "";
		item.nextUntil("h4").each((_, el) => {
			description += $(el).html();
		});
		if (description === "") item.parent().nextUntil("h4").each((_, el) => {
			description += $(el).html();
		});
		return {
			title,
			link: currentUrl,
			description,
			pubDate: parseDate(title.match(/\((.*)\)/)[1], ["D MMMM YYYY", "D MMM YYYY"]),
			guid: title
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/kovidgoyal/kitty/changelog.ts
const route = {
	path: "/kitty/changelog",
	categories: ["program-update"],
	example: "/kovidgoyal/kitty/changelog",
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
		source: ["sw.kovidgoyal.net/kitty/changelog/"],
		target: "/kitty/changelog"
	}],
	name: "Changelog",
	maintainers: ["xbot"],
	handler,
	url: "sw.kovidgoyal.net/kitty/changelog/"
};
async function handler() {
	const url = "https://sw.kovidgoyal.net/kitty/changelog/";
	const $ = load(await rofetch(url));
	return {
		title: "Kitty Changelog",
		link: url,
		description: "Changelog for Kitty terminal emulator",
		language: "en",
		item: $("#detailed-list-of-changes").find("section[id^=\"id\"]").toArray().map((section) => {
			const $section = $(section);
			const versionMatch = $section.find("h3").first().text().trim().match(/^([\d.]+)\s*\[([^\]]+)\]/);
			if (!versionMatch) return null;
			const version = versionMatch[1];
			const dateStr = versionMatch[2];
			const changelogItems = $section.find("ul.simple li").toArray().map((li) => $(li).html()).filter(Boolean);
			const description = changelogItems.length > 0 ? "<ul>" + changelogItems.map((item) => `<li>${item}</li>`).join("") + "</ul>" : "No changelog items available.";
			return {
				title: `Kitty ${version}`,
				description,
				link: `${url}#${$section.attr("id")}`,
				pubDate: parseDate(dateStr, "YYYY-MM-DD"),
				guid: `kitty-${version}`
			};
		}).filter(Boolean)
	};
}
//#endregion
export { route };

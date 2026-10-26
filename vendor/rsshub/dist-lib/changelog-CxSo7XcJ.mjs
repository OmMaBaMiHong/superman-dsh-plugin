import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/raycast/changelog.ts
const handler = async () => {
	return {
		title: "Raycast Changelog",
		link: "https://www.raycast.com/changelog",
		language: "en-US",
		item: await cache_default.tryGet("raycast:changelog", async () => {
			return load(await rofetch("https://www.raycast.com/changelog"))("article").toArray().map((item) => {
				const $ = load(item);
				const version = $("span[id]").attr("id");
				const html = $("div.markdown").html() ?? "";
				const date = $("span[class^=ChangelogEntry_changelogDate]").text().trim();
				return {
					title: `Version ${version}`,
					description: html,
					link: `https://www.raycast.com/changelog/${version?.replaceAll(".", "-")}`,
					pubDate: parseDate(date)
				};
			});
		})
	};
};
const route = {
	path: "/changelog",
	name: "Changelog",
	categories: ["program-update"],
	example: "/raycast/changelog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	handler,
	maintainers: ["equt"]
};
//#endregion
export { route };

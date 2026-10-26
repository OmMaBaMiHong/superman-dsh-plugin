import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/greasyfork/versions.ts
const route = {
	path: "/scripts/:script/versions",
	categories: ["program-update"],
	example: "/greasyfork/scripts/431691-bypass-all-shortlinks/versions",
	parameters: { script: "Script id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["greasyfork.org/:language/scripts/:script/versions"] }],
	name: "Script Version History",
	maintainers: ["miles170"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://greasyfork.org/scripts/${ctx.req.param("script")}/versions`;
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=description]").attr("content"),
		item: $(".history_versions li").toArray().map((item) => {
			item = $(item);
			const versionNumberLink = item.find(".version-number a");
			return {
				title: versionNumberLink.text(),
				description: item.find(".version-changelog").text().trim(),
				pubDate: parseDate(item.find("gf-relative-time").attr("datetime")),
				link: versionNumberLink.attr("href")
			};
		})
	};
}
//#endregion
export { route };

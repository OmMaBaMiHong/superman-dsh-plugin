import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/android/platform-tools-releases.ts
const route = {
	path: "/platform-tools-releases",
	categories: ["program-update"],
	example: "/android/platform-tools-releases",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["developer.android.com/studio/releases/platform-tools", "developer.android.com/"] }],
	name: "SDK Platform Tools release notes",
	maintainers: ["nczitzk"],
	handler,
	url: "developer.android.com/studio/releases/platform-tools"
};
async function handler() {
	const currentUrl = `https://developer.android.com/studio/releases/platform-tools`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl,
		headers: { cookie: "signin=autosignin" }
	})).data);
	$(".hide-from-toc").remove();
	$(".devsite-dialog, .devsite-badge-awarder, .devsite-hats-survey").remove();
	const items = $("h4").toArray().map((item) => {
		item = $(item);
		const title = item.attr("data-text");
		let description = "";
		item.nextUntil("h4").each((_, el) => {
			description += $(el).html();
		});
		return {
			title,
			description,
			link: `${currentUrl}#${item.attr("id")}`,
			pubDate: parseDate(title.match(/\((.*)\)/)[1], "MMMM YYYY")
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

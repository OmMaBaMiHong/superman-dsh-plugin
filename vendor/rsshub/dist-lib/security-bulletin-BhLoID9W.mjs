import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/android/security-bulletin.ts
const route = {
	path: "/security-bulletin",
	categories: ["program-update"],
	example: "/android/security-bulletin",
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
		"source.android.com/docs/security/bulletin",
		"source.android.com/docs/security/bulletin/asb-overview",
		"source.android.com/"
	] }],
	name: "Security Bulletins",
	maintainers: ["TonyRL"],
	handler,
	url: "source.android.com/docs/security/bulletin/asb-overview"
};
async function handler() {
	const baseUrl = "https://source.android.com";
	const link = `${baseUrl}/docs/security/bulletin/asb-overview`;
	const $ = load(await rofetch(link, { headers: { Cookie: "signin=autosignin; cookies_accepted=true; django_language=en;" } }));
	const items = $("table tr").slice(1).toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("td:nth-child(1) a");
		return {
			title: `Bulletin ${a.text()}`,
			description: $item.find("td:nth-child(2)").html(),
			link: `${baseUrl}${a.attr("href")}`,
			pubDate: parseDate($item.find("td:nth-child(3)").text())
		};
	});
	return {
		title: $("title").text(),
		link,
		image: $("link[rel=\"apple-touch-icon\"]").attr("href"),
		item: items
	};
}
//#endregion
export { route };

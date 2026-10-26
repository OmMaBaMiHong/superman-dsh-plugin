import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/android/pixel-update-bulletin.ts
const route = {
	path: "/pixel-update-bulletin",
	categories: ["program-update"],
	example: "/android/pixel-update-bulletin",
	radar: [{ source: ["source.android.com/docs/security/bulletin/pixel", "source.android.com"] }],
	name: "Pixel Update Bulletins",
	maintainers: ["TonyRL"],
	handler,
	url: "source.android.com/docs/security/bulletin/pixel"
};
async function handler() {
	const baseUrl = "https://source.android.com";
	const link = `${baseUrl}/docs/security/bulletin/pixel`;
	const $ = load(await rofetch(link, { headers: { Cookie: "signin=autosignin; cookies_accepted=true; django_language=en;" } }));
	const list = $("table tr:has(td:first-child a)").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("td:nth-child(1) a");
		return {
			title: `Pixel Update Bulletin ${a.text()}`,
			description: $item.find("td:nth-child(2)").html()?.trim(),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: parseDate($item.find("td:nth-child(3)").text())
		};
	});
	return {
		title: $("head title").text(),
		link,
		image: $("link[rel=\"apple-touch-icon\"]").attr("href"),
		item: list
	};
}
//#endregion
export { route };

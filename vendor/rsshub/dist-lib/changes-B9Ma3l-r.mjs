import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/lineageos/changes.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://download.lineageos.org";
	const targetUrl = new URL("changes", baseUrl).href;
	const apiUrl = new URL("api/v2/changes", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = (await rofetch(apiUrl)).slice(0, limit).map((item) => {
		const title = item.subject;
		const pubDate = item.submitted;
		const linkUrl = item.url;
		const categories = [
			item.type,
			item.branch,
			item.repository
		];
		const updated = item.updated;
		return {
			title,
			pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
			link: linkUrl,
			category: categories,
			updated: updated ? parseDate(updated, "X") : void 0,
			language
		};
	});
	return {
		title: `${$("title").text()} - Downloads`,
		description: void 0,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: $("title").text(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/changes",
	name: "Changes",
	url: "download.lineageos.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/lineageos/changes",
	parameters: void 0,
	description: void 0,
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["download.lineageos.org/changes"],
		target: "/changes"
	}],
	view: 5
};
//#endregion
export { handler, route };

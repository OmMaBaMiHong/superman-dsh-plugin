import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
//#region lib/routes/notion/release.ts
const handler = async () => {
	const $ = load(await rofetch("https://notion.so/releases", { headers: { "Accept-Language": "en-US" } }));
	const title = $("h2").first().text() ?? "";
	const pubDate = parseDate($("time").first().text());
	const description = $("article.release article").first().html() ?? "";
	const link = `https://notion.so/releases/${dayjs(pubDate).format("YYYY-MM-DD")}`;
	const item = await Promise.all($("div[class^=\"releasePreviewsSection\"] h3 a[href^=\"/releases/\"]").toArray().slice(0, 5).map((item) => {
		const link = `https://notion.so${item.attribs.href}`;
		return cache_default.tryGet(`notion:release:${link}`, async () => {
			const $ = load(await rofetch(link, { headers: { "Accept-Language": "en-US" } }));
			return {
				title: $("h2").first().text() ?? "",
				pubDate: parseDate($("time").first().text()),
				description: $("article.release article").first().html() ?? "",
				link
			};
		});
	}));
	return {
		title: "Notion Releases",
		link: "https://notion.so/releases",
		item: [{
			title,
			description,
			pubDate,
			link
		}, ...item]
	};
};
const route = {
	name: "Release",
	path: "/release",
	url: "notion.so/releases",
	example: "/notion/release",
	categories: ["program-update"],
	maintainers: ["equt"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	handler
};
//#endregion
export { route };

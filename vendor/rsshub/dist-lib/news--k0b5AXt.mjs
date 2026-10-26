import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qbittorrent/news.ts
const route = {
	path: "/news",
	categories: ["program-update"],
	example: "/qbittorrent/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["qbittorrent.org/news.php", "qbittorrent.org/"] }],
	name: "News",
	maintainers: ["TonyRL"],
	handler,
	url: "qbittorrent.org/news.php"
};
async function handler(ctx) {
	const baseUrl = "https://www.qbittorrent.org";
	const $ = load(await cache_default.tryGet(`${baseUrl}/news.php`, async () => (await got_default(`${baseUrl}/news.php`, { headers: { Referer: baseUrl } })).data, config.cache.routeExpire, false));
	const item = $(".stretcher").find("h3").toArray().map((item) => {
		item = $(item);
		const pubDate = item.text().split(" - ", 1)[0].replace(/\w{3,6}day/, "");
		const title = item.text().split(" - ", 2)[1];
		let description = "";
		while (item.next().length && item.next().get(0).tagName !== "h3") {
			item = item.next();
			description += item.html();
		}
		return {
			title,
			description,
			pubDate: parseDate(pubDate, "MMMM D YYYY")
		};
	});
	const ret = {
		title: "qBittorrent News",
		link: `${baseUrl}/news.php`,
		item
	};
	ctx.set("json", ret);
	return ret;
}
//#endregion
export { route };

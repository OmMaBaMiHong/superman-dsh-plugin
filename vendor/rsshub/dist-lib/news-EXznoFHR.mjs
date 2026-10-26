import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/skysports/news.ts
const route = {
	path: "/news/:team",
	categories: ["sport"],
	example: "/skysports/news/ac-milan",
	parameters: { team: "Team id, can be found in URL to the team page" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.skysports.com/${ctx.req.param("team")}-news`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".news-list__headline-link").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content(".roadblock").remove();
		content(".sdc-article-widget, .sdc-site-layout-sticky-region").remove();
		item.description = content(".sdc-article-body, .polaris-tile-group-separator").html();
		item.pubDate = parseDate(detailResponse.data.match(/"datePublished": ?"(.*)","dateModified"/)[1]);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

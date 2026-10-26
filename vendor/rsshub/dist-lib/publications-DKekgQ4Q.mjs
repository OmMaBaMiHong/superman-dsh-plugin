import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/disinfo/publications.ts
const route = {
	path: "/publications",
	categories: ["new-media"],
	example: "/disinfo/publications",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["disinfo.eu/"] }],
	name: "Publications",
	maintainers: ["nczitzk"],
	handler,
	url: "disinfo.eu/"
};
async function handler() {
	const currentUrl = `https://www.disinfo.eu/publications`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".elementor-heading-title a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".wp-block-spacer").remove();
		content(".elementor-widget-container p").eq(0).remove();
		content("img").each((_, el) => {
			content(el).attr("src", content(el).attr("data-lazy-src"));
		});
		item.description = content(".elementor-widget-theme-post-content").html();
		item.pubDate = parseDate(content("meta[property=\"article:modified_time\"]").attr("content"));
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

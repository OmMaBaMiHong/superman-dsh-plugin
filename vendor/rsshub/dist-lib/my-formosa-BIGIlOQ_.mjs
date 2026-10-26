import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/my-formosa/index.ts
const route = {
	path: "/",
	categories: ["new-media"],
	example: "/my-formosa",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["my-formosa.com/"] }],
	name: "首页",
	maintainers: ["dzx-dzx"],
	handler,
	url: "my-formosa.com"
};
async function fetch(url) {
	const raw = await rofetch(url, { responseType: "arrayBuffer" });
	return new TextDecoder("big5").decode(raw);
}
async function handler() {
	const rootUrl = "http://www.my-formosa.com/";
	const $ = load(await fetch(rootUrl));
	const items = await Promise.all($("#featured-news h3 a").toArray().map((item) => {
		item = $(item);
		const title = item.text();
		const link = new URL(item.attr("href"), rootUrl).href;
		return cache_default.tryGet(link, async () => {
			const $ = load(await fetch(link));
			const isTV = new URL(link).pathname.startsWith("/TV");
			return {
				title,
				link,
				author: $(".page-header~#featured-news h4").text(),
				category: $("meta[name='keywords']").attr("content").split(",").filter(Boolean),
				pubDate: timezone(parseDate((isTV ? $(".icon-calendar")[0].next.data : $(".date").text()).trim()), 8),
				description: (isTV ? $(".post-item").html() : $(".body").html()).replaceAll(/\/News.*?\.jpg/g, (match) => `http://my-formosa.com${match}`)
			};
		});
	}));
	return {
		title: $("title").text(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };

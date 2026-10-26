import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/paulgraham/article.ts
const route = {
	path: [
		"/articles",
		"/essays",
		"/"
	],
	categories: ["blog"],
	example: "/paulgraham/articles",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["paulgraham.com/articles.html"] }],
	name: "Essays",
	maintainers: [
		"Maecenas",
		"nczitzk",
		"dvorak0"
	],
	handler,
	url: "paulgraham.com/articles.html"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://paulgraham.com";
	const currentUrl = new URL("articles.html", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("font a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.prop("href"), rootUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		const description = content("font").first();
		item.title = content("title").text();
		item.description = description.html();
		item.pubDate = parseDate(description.contents().first().text(), "MMMM YYYY");
		return item;
	})));
	const author = "Paul Graham";
	const title = $("title").text();
	const icon = $("link[rel=\"shortcut icon\"]").prop("href");
	return {
		item: items,
		title: `${author} - ${title}`,
		link: currentUrl,
		description: title,
		language: "en",
		image: $(`img[alt="${title}"]`).prop("src"),
		icon,
		logo: icon,
		subtitle: title,
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };

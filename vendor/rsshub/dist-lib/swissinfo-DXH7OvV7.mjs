import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/swissinfo/index.ts
const route = {
	path: "/:language?/:category?",
	categories: ["new-media"],
	example: "/swissinfo/eng/latest-news",
	parameters: {
		language: "Language, eng by default",
		category: "Category, Latest News by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["swissinfo.ch/:language/:category", "swissinfo.ch/"] }],
	name: "Category",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "eng";
	const category = ctx.req.param("category") ?? "latest-news";
	const rootUrl = "https://www.swissinfo.ch";
	const currentUrl = `${rootUrl}/${language}/${category}`;
	let $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const title = $("title").text();
	$ = load((await got_default({
		method: "get",
		url: `${rootUrl}${$("main div[data-fragment-placeholder]").attr("data-fragment-placeholder")}`
	})).data);
	let items = $(".si-teaser__link").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20).toArray().map((item) => {
		item = $(item);
		return {
			link: `${rootUrl}${item.attr("href")}`,
			title: item.find(".si-teaser__title").text(),
			pubDate: parseDate(item.find(".si-teaser__date").attr("datetime"))
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content(".si-detail__content .si-grid").remove();
		content(".si-detail__content .si-teaser").remove();
		content(".show-for-sr, time, address, .si-detail__translation").remove();
		content("picture").each((_, el) => {
			content(el).html(`<img src="${content(el).find("source").first().attr("srcset")}">`);
		});
		item.description = content(".si-detail__content").html();
		item.author = content("meta[name=\"author\"]").attr("content");
		item.guid = detailResponse.data.match(/content_id: "(.*)",/)[1];
		return item;
	})));
	return {
		title,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

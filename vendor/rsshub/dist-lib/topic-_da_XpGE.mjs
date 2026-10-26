import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/thehindu/topic.ts
const route = {
	path: "/topic/:topic",
	categories: ["traditional-media"],
	example: "/thehindu/topic/rains",
	parameters: { topic: "Topic slug, can be found in URL." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["thehindu.com/topic/:topic"] }],
	name: "Topic",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.thehindu.com";
	const topic = ctx.req.param("topic");
	const link = `${baseUrl}/topic/${topic}/`;
	const apiLink = `${baseUrl}/topic/${topic}/fragment/showmoreTag`;
	const { data: response } = await got_default(link);
	const { data: apiResponse } = await got_default(apiLink);
	const $ = load(response);
	const $api = load(apiResponse);
	const list = $(".element").toArray().map((item) => {
		item = $api(item);
		const a = item.find(".title a");
		return {
			title: a.text().trim(),
			link: a.attr("href"),
			author: item.find(".author-name").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		$(".position-relative, .articleblock-container, .article-ad, .comments-shares").remove();
		item.description = $(".sub-title").prop("outerHTML") + $("div.article-picture").html() + $("div[itemprop=\"articleBody\"]").html();
		item.pubDate = parseDate($("meta[itemprop=\"datePublished\"]").attr("content"));
		item.updated = parseDate($("meta[itemprop=\"dateModified\"]").attr("content"));
		item.category = $("meta[property=\"article:tag\"]").toArray().map((item) => $(item).attr("content"));
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		link: `${baseUrl}/topic/${topic}/`,
		image: $("meta[property=\"og:image\"]").attr("content"),
		logo: $("link[rel=\"apple-touch-icon\"]").attr("href"),
		icon: $("link[rel=\"icon\"]").attr("href"),
		language: "en",
		item: items
	};
}
//#endregion
export { route };

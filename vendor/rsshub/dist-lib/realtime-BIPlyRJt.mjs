import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ebc/realtime.ts
const route = {
	path: "/realtime/:category?",
	categories: ["traditional-media"],
	example: "/ebc/realtime/politics",
	parameters: { category: "Category from the last segment of the URL of the corresponding site" },
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		requireConfig: false
	},
	name: "即時新聞",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	description: "",
	radar: [{
		source: ["news.ebc.net.tw/realtime/:category"],
		target: "/:category"
	}]
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const $ = load((await got_default("https://news.ebc.net.tw/list/load", {
		method: "POST",
		headers: {
			Accept: "*/*",
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			"X-Requested-With": "XMLHttpRequest"
		},
		body: new URLSearchParams({
			list_type: "realtime",
			cate_code: category,
			page: "1"
		}).toString()
	})).data);
	const feed = $("div.list > a").toArray().map((item) => new URL($(item).attr("href") ?? "", "https://news.ebc.net.tw").href);
	const items = await Promise.all(feed.map((url) => cache_default.tryGet(url, async () => {
		const $ = load((await got_default(url)).data);
		const metadata = $("[type=\"application/ld+json\"]").toArray().flatMap((item) => JSON.parse($(item).text())).find((item) => item["@type"] === "NewsArticle");
		$(".img_box").each((_, elem) => {
			$(elem).children("div.img_caption").replaceWith($(`<figcaption>${$(elem).children("div.img_caption").text()}</figcaption>`));
			$(elem).children("div.img").children().unwrap();
			$(elem).wrapInner($("<figure></figure>"));
		});
		$("[style=\"font-size:16px;\"]").each((_, elem) => {
			$(elem).replaceWith(`<small>${$(elem).text()}</small>`);
		});
		const cover = $("div.article_cover");
		const content = $("div.article_content");
		content.find(".inline_text, .inline_box, .rss_box").remove();
		return {
			title: metadata.headline,
			link: url,
			pubDate: parseDate(metadata.datePublished),
			author: metadata.author.name,
			description: cover.html() + content.html(),
			category: metadata.keywords ? [metadata.articleSection, ...metadata.keywords.split(",")] : [metadata.articleSection]
		};
	})));
	return {
		title: "東森新聞|即時",
		link: category ? `https://news.ebc.net.tw/realtime/${category}` : "https://news.ebc.net.tw/realtime",
		language: "zh-TW",
		item: items
	};
}
//#endregion
export { route };

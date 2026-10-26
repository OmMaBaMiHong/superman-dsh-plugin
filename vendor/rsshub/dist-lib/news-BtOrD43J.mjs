import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/castanet/news.ts
const feeds = {
	"Top Headlines": "topheadlines",
	"Recent Headlines": "mostrecent",
	Kelowna: "page-1",
	"West-Kelowna": "page-101",
	Peachland: "page-86",
	Vernon: "page-2",
	"Salmon-Arm": "page-61",
	Penticton: "page-21",
	"Oliver-Osoyoos": "page-87",
	Kamloops: "page-48",
	Nelson: "page-91",
	BC: "page-3",
	Canada: "page-4",
	World: "page-5",
	Business: "page-6",
	Sports: "page-7",
	ShowBiz: "page-8"
};
const route = {
	path: "/:category?",
	categories: ["traditional-media"],
	example: "/castanet/Kelowna",
	parameters: { category: {
		options: Object.keys(feeds).map((k) => ({
			value: k,
			label: k
		})),
		description: "Category",
		default: "Recent Headlines"
	} },
	radar: [{
		source: ["www.castanet.net/news/:category/"],
		target: "/:category"
	}, {
		source: ["www.castanet.net/"],
		target: "/"
	}],
	name: "News",
	maintainers: ["TonyRL"],
	handler,
	url: "www.castanet.net"
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "Recent Headlines";
	const feedUrl = `https://www.castanet.net/rss/${feeds[category] ?? category}.xml`;
	const feed = await parser.parseURL(feedUrl);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		delete item.content;
		delete item.contentSnippet;
		delete item.isoDate;
		const content = $(".newsstory");
		content.find(".newsheadlinefull, .newsheadline, .byline, .click_gallery").remove();
		if (content.find(".gallery_img1").length) {
			const a = content.find(".gallery_img1 a").toArray();
			content.find(".gallery_img1").next().remove();
			for (const ele of a) {
				const $ele = $(ele);
				const figure = `<figure><img src="${$ele.attr("href")}" alt="${$ele.text().trim()}"><figcaption>${$ele.attr("title")?.trim() ?? ""}</figcaption></figure>`;
				$ele.replaceWith(figure);
			}
		}
		item.description = content.html()?.trim();
		return item;
	})));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		image: feed.image?.url,
		language: feed.language,
		item: items
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/xiaozhuanlan/column.ts
const md = markdownit({ linkify: true });
const baseUrl = "https://xiaozhuanlan.com";
const route = {
	path: "/column/:id",
	categories: ["new-media"],
	example: "/xiaozhuanlan/column/olddriver-selection",
	parameters: { id: "专栏 ID，可在专栏页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xiaozhuanlan.com/:id"] }],
	name: "专栏",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default(`${baseUrl}/${id}`)).data);
	let items = $(".xzl-topic-item").toArray().map((item) => {
		item = $(item);
		item.find(".topic-has-suggested-item").remove();
		return {
			title: item.find("h3").text().trim(),
			link: new URL(item.find(".topic-body-link").attr("href"), baseUrl).href,
			author: item.find(".topic-header .xzl-author-lockup").text().trim(),
			pubDate: parseDate(item.find(".topic-header .timeago").attr("title"))
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.description = md.render($(".hidden_markdown_body").attr("data-summary"));
		if ($(".topic-tags")) item.category = $(".topic-tags label").toArray().map((l) => $(l).text());
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		link: `${baseUrl}/${id}`,
		description: $("meta[name=description]").attr("content"),
		item: items
	};
}
//#endregion
export { route };

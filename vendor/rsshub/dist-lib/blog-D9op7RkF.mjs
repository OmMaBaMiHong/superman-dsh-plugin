import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/cognition/blog.ts
const route = {
	path: "/blog/:category?",
	name: "Blog",
	url: "cognition.ai/blog",
	maintainers: ["Loongphy", "ttttmr"],
	example: "/cognition/blog",
	categories: ["programming"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cognition.ai/blog/1", "cognition.ai/blog/:category/1"],
		target: "/blog/:category?"
	}],
	view: 0,
	handler,
	parameters: { category: "Category name, e.g., Research, Tutorials" }
};
const splitAuthors = (text) => {
	if (!text) return;
	const names = text.split(",").map((name) => name.trim()).filter(Boolean);
	if (names.length === 0) return;
	return names.map((name) => ({ name }));
};
async function handler(ctx) {
	const baseUrl = "https://cognition.ai";
	const { category } = ctx.req.param();
	const listPath = category ? `/blog/${category}/1` : "/blog/1";
	const targetUrl = new URL(listPath, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const items = $("#blog-post-list__list li.blog-post-list__list-item").toArray().map((el) => {
		const linkElement = $(el).find("a.o-blog-preview").first();
		const href = linkElement.attr("href");
		const link = href ? new URL(href, baseUrl).href : void 0;
		if (!link) return;
		const title = linkElement.find("h3.o-blog-preview__title").text().trim();
		if (!title) return;
		const summary = linkElement.find("p.o-blog-preview__intro").text().trim();
		const dateNode = linkElement.find(".o-blog-preview__meta-date").clone();
		dateNode.find(".o-blog-preview__meta").remove();
		const dateText = dateNode.text().trim();
		const authorText = linkElement.find(".o-blog-preview__meta-author").text().trim();
		const dataItem = {
			title,
			link,
			pubDate: parseDate(dateText)
		};
		if (summary) dataItem.description = summary;
		const authors = splitAuthors(authorText);
		if (authors) dataItem.author = authors;
		return dataItem;
	}).filter((item) => item !== void 0);
	const imageAttr = $("meta[property=\"og:image\"]").attr("content");
	const image = imageAttr ? new URL(imageAttr, baseUrl).href : void 0;
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		allowEmpty: true,
		item: items,
		image
	};
}
//#endregion
export { handler, route };

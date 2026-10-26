import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sankei/news.ts
const route = {
	path: "/news/:category",
	categories: ["traditional-media"],
	example: "/sankei/news/flash",
	parameters: { category: "Category name (as it will appear in URLs). For example, for \"Breaking News\" https://www.sankei.com/flash/, the category name would be \"flash\"." },
	radar: [{
		source: ["www.sankei.com/:category"],
		target: "/news/:category"
	}],
	name: "News",
	maintainers: ["yuikisaito"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.sankei.com";
	const { category } = ctx.req.param();
	const url = `${baseUrl}/${category}/`;
	const $ = load((await got_default(url)).body);
	const categoryName = $("header.story-card-header:first-of-type > h1").text();
	const listSelector = $("div.story-card-feed.grid.hide_on_mobile > div > article");
	const items = await Promise.all(listSelector.toArray().map((el) => {
		const item = $(el);
		item.find("p a").remove();
		const title = item.find("div.story-card-flex > h2.headline > a").text();
		const link = baseUrl + (item.find("div.story-card-flex > h2.headline > a").attr("href") || "");
		const pubDate = parseDate(item.find("div.story-card-flex > div > time").attr("datetime") || "");
		return cache_default.tryGet(link, async () => {
			const $ = load((await got_default(link)).body);
			$(".inline-gptAd, .figure_image_sizer").remove();
			const articleHTML = $("div.article-body").html() || "";
			return {
				title,
				link,
				pubDate,
				description: articleHTML
			};
		});
	}));
	return {
		title: "産経ニュース - " + categoryName,
		description: $("meta[name=\"description\"]").attr("content"),
		link: url,
		image: $("meta[property=\"og:image\"]").attr("content"),
		language: "ja",
		item: items
	};
}
//#endregion
export { route };

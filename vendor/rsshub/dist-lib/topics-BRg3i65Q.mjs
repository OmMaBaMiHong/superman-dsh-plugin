import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sankei/topics.ts
const route = {
	path: "/topics/:topic",
	categories: ["traditional-media"],
	example: "/sankei/topics/etc_100",
	parameters: { topic: "Topic name (format included in URL). For example, for \"Expo 2025 Osaka, Kansai, Japan Special Feature\" https://www.sankei.com/tag/topic/etc_100, the value would be etc_100." },
	radar: [{
		source: ["www.sankei.com/tag/topic/:topic"],
		target: "/topics/:topic"
	}],
	name: "Topic",
	maintainers: ["yuikisaito"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.sankei.com";
	const { topic } = ctx.req.param();
	const url = `${baseUrl}/tag/topic/${topic}/`;
	const $ = load((await got_default(url)).body);
	const categoryName = $("li.breadcrumb-list-item:nth-of-type(3) > a").text();
	const listSelector = $("div.story-card-feed.grid.hide_on_mobile > div > article");
	const items = await Promise.all(listSelector.toArray().map((el) => {
		const item = $(el);
		item.find("p a").remove();
		const title = item.find("div.story-card-flex > h3.headline > a").text();
		const link = baseUrl + (item.find("div.story-card-flex > h3.headline > a").attr("href") || "");
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

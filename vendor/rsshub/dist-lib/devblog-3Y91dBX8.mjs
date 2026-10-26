import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/worldofwarships/devblog.ts
const route = {
	path: "/devblog",
	categories: ["game"],
	example: "/worldofwarships/devblog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["blog.worldofwarships.com"],
		target: "/devblog"
	}],
	name: "Development Blog",
	maintainers: ["SinCerely023"],
	handler
};
async function handler() {
	const url = "https://blog.worldofwarships.com/";
	const { data: response } = await got_default(url);
	const $ = load(response);
	const face = $("[rel=apple-touch-icon]").last();
	const list = $("article").toArray().map((item) => {
		item = $(item);
		const time = item.find("div").first().find("time").first();
		const tag = item.find("div").first().find("ul").first().find("li").first();
		const title = item.find("h2").first().find("a").first();
		const content = item.find("h2").first().next();
		return {
			title: title.attr("title"),
			link: title.attr("href"),
			pubDate: timezone(parseDate(time.attr("data-timestamp") * 1e3), 0),
			category: tag.text(),
			author: "Wargaming",
			description: content.html()
		};
	});
	return {
		title: "World of Warships - Development Blog",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			item.description = load(response)(".article__content").first().html();
			return item;
		}))),
		image: "https:" + face.attr("href"),
		language: "en",
		author: "Wargaming"
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fixImage, r as fixVideo, t as baseUrl } from "./utils-BIsp_OQ5.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/pikabu/user.ts
const route = {
	path: "/user/:name",
	categories: ["bbs"],
	example: "/pikabu/user/@bula.dragon",
	parameters: { name: "User name" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["pikabu.ru/:name"] }],
	name: "User",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const link = `${baseUrl}/${ctx.req.param("name")}`;
	const response = await got_default(link, { responseType: "buffer" });
	const charset = response.headers["content-type"].match(/charset=([\w-]+)/)[1];
	const $ = load(iconv.decode(response.data, charset));
	const items = $(".story__main").not(".story__placeholder").toArray().map((story) => {
		story = $(story);
		const a = story.find(".story__title a");
		fixImage(story);
		story.find(".player").each((_, elem) => {
			elem = $(elem);
			fixVideo(elem);
		});
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: parseDate(story.find("time").attr("datetime")),
			description: story.find(".story__content-inner").html(),
			author: story.find(".user__nick").text()
		};
	});
	return {
		title: $("meta[property=\"og:title\"]").attr("content"),
		description: $(".profile__user-about-content").text(),
		image: $("meta[property=\"og:image\"]").attr("content"),
		language: "ru-RU",
		link,
		item: items
	};
}
//#endregion
export { route };

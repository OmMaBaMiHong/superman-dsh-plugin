import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cncf/index.ts
const rootURL = "https://www.cncf.io";
const route = {
	path: "/:cate?",
	categories: ["programming"],
	example: "/cncf",
	parameters: { cate: "blog by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["Fatpandac"],
	handler,
	description: `| Blog | News | Announcements | Reports |
| ---- | ---- | ------------- | ------- |
| blog | news | announcements | reports |`
};
async function handler(ctx) {
	const cate = ctx.req.param("cate") ?? "blog";
	const url = `${rootURL}/${cate}/`;
	const $ = load((await got_default(url)).data);
	const title = $("h1.is-style-page-title").text();
	const list = $("div.post-archive__item").toArray().map((item) => ({
		title: $(item).find("span.post-archive__title").text().trim(),
		link: $(item).find("span.post-archive__title > a").attr("href"),
		pubDate: parseDate($(item).find("span.post-archive__item_date").text().split("|", 1)[0])
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content("div.post-author").remove();
		content("div.social-share").remove();
		item.description = content("article").html();
		return item;
	})));
	return {
		title: `CNCF - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/macfilos/blog.ts
const route = {
	path: "/blog",
	categories: ["new-media"],
	example: "/macfilos/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["macfilos.com/blog", "macfilos.com/"] }],
	name: "Blog",
	maintainers: ["nczitzk"],
	handler,
	url: "macfilos.com/blog"
};
async function handler(ctx) {
	const currentUrl = `https://www.macfilos.com/blog`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".entry-title a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).toArray().map((item) => {
		item = $(item);
		const parent = item.parent().parent();
		return {
			title: item.text(),
			link: item.attr("href"),
			author: parent.find(".td-post-author-name a").text(),
			pubDate: parseDate(parent.find(".td-post-date time").attr("datetime"))
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("hr").nextAll().remove();
		content("hr").remove();
		content("img").each((_, el) => {
			content(el).removeAttr("srcset");
		});
		item.description = content(".td-post-content").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/claude/blog.ts
const baseUrl = "https://claude.com";
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/claude/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["claude.com/blog"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["zhenlohuang"],
	handler,
	url: "claude.com/blog"
};
async function handler(ctx) {
	const link = `${baseUrl}/blog`;
	const $ = load(await rofetch(link));
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	return {
		title: "Claude Blog",
		link,
		description: "Product news and best practices for teams building with Claude.",
		language: "en",
		item: await pMap($(".blog_cms_list article.card_blog_list_wrap").toArray().slice(0, limit).map((el) => {
			const $el = $(el);
			const title = $el.find(".card_blog_list_title").text().trim();
			const href = $el.find("a.clickable_link").attr("href") ?? "";
			const pubDateText = $el.find("[fs-list-fieldtype=\"date\"][fs-list-field=\"date\"]").text().trim();
			const category = $el.find("[fs-list-field=\"category\"]").toArray().map((c) => $(c).text().trim()).filter(Boolean);
			return {
				title,
				link: href.startsWith("http") ? href : `${baseUrl}${href}`,
				pubDate: pubDateText ? parseDate(pubDateText) : void 0,
				category
			};
		}), (item) => cache_default.tryGet(item.link, async () => {
			const content = load(await rofetch(item.link))(".blog_post_content_wrap");
			content.find("style, script").remove();
			item.description = content.html() ?? void 0;
			return item;
		}), { concurrency: 3 })
	};
}
//#endregion
export { route };

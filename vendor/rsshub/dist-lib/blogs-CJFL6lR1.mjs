import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as getRootUrl, r as defaultDomain } from "./utils-BkMEv8_N.mjs";
import { load } from "cheerio";
//#region lib/routes/18comic/blogs.ts
const route = {
	path: "/blogs/:category?",
	categories: ["anime"],
	example: "/18comic/blogs",
	parameters: { category: "分类，见下表，默认为空即全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["jmcomic.group/"] }],
	name: "文庫",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	url: "jmcomic.group/",
	description: `分类

| 全部 | 紳夜食堂 | 遊戲文庫 | JG GAMES | 模型山下 |
| ---- | -------- | -------- | -------- | -------- |
|      | dinner   | raiders  | jg       | figure   |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const { domain = defaultDomain } = ctx.req.query();
	const rootUrl = getRootUrl(domain);
	const currentUrl = `${rootUrl}/blogs${category ? `/${category}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".title").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.parent().attr("href")}`,
			guid: `https://18comic.org${item.parent().attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.guid, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.pubDate = parseDate(content(".date").first().text());
		content(".d-flex").remove();
		item.author = content(".blog_name_id").first().text();
		item.description = content(".blog_content").html();
		item.category = content(".panel-heading dropdown-toggle").toArray().map((c) => $(c).text());
		return item;
	})));
	return {
		title: $("title").text().replace(/最新的/, () => $(".article-nav .active").text()),
		link: currentUrl,
		item: items,
		description: $("meta[property=\"og:description\"]").attr("content")
	};
}
//#endregion
export { route };

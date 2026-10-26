import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as rootUrl, t as renderPostDetail } from "./util-C8fESqOX.mjs";
import { load } from "cheerio";
//#region lib/routes/taoguba/blog.ts
const route = {
	path: "/blog/:id",
	categories: ["finance"],
	example: "/taoguba/blog/252069",
	parameters: { id: "博客 id，可在对应博客页中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tgb.cn/blog/:id", "tgb.cn/"] }],
	name: "用户博客",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const currentUrl = `${rootUrl}/blog/${ctx.req.param("id")}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const author = $("meta[property=\"og:author\"]").attr("content");
	let items = $(".tittle_data").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text().trim(),
			link: `${rootUrl}/${a.attr("href")}`,
			author
		};
	});
	items = await Promise.all(items.map(async (item) => await renderPostDetail(item)));
	return {
		title: `淘股吧 - ${author}`,
		description: $("meta[http-equiv=\"description\"]").attr("content"),
		image: $("meta[property=\"og:image\"]").attr("content"),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

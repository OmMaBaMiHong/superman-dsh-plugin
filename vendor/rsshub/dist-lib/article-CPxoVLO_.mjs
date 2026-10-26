import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/51read/article.ts
const route = {
	path: "/article/:id",
	name: "章节",
	url: "m.51read.org",
	maintainers: ["lazwa34"],
	example: "/51read/article/152685",
	parameters: { id: "小说 id, 可在对应小说页 URL 中找到" },
	categories: ["reading"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["m.51read.org/xiaoshuo/:id"],
		target: "/article/:id"
	}, {
		source: ["51read.org/xiaoshuo/:id"],
		target: "/article/:id"
	}],
	handler
};
async function handler(ctx) {
	const { id } = ctx.req.param();
	const link = `https://m.51read.org/xiaoshuo/${id}`;
	const $book = load(await rofetch(link));
	const chapter = `https://m.51read.org/zhangjiemulu/${id}`;
	const pageLength = load(await rofetch(chapter))(".ml-page select").find("option").toArray().map((option) => option.attribs.value).length;
	const item = await createItem(chapter, pageLength);
	return {
		title: $book("h1").text(),
		description: $book(".bi-cot p").text(),
		link,
		item,
		image: $book(".bi-img img").attr("src"),
		author: $book(".bi-wt a").text(),
		language: "zh-cn"
	};
}
const createItem = async (baseUrl, page) => {
	const $latest = load(await rofetch(`${baseUrl}/${page}`));
	return await Promise.all($latest(".kb-jp li>a").toArray().map((chapter) => buildItem(chapter.attribs.href)).toReversed());
};
const buildItem = (url) => cache_default.tryGet(url, async () => {
	const $ = load(await rofetch(url));
	return {
		title: $("h1").text(),
		description: $(".kb-cot").html() || "",
		link: url
	};
});
//#endregion
export { route };

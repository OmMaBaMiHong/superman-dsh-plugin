import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/camchina/index.ts
const route = {
	path: "/:id?",
	categories: ["study"],
	example: "/camchina",
	parameters: { id: "分类，见下表，默认为 1，即新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cste.org.cn/categories/:id", "cste.org.cn/"] }],
	name: "栏目",
	maintainers: ["nczitzk"],
	handler,
	description: `| 新闻 | 通告栏 |
| ---- | ------ |
| 1    | 2      |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "1";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	const rootUrl = "http://www.camchina.org.cn";
	const currentUrl = `${rootUrl}/categories/${id}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".M-main-l p a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".content").html();
		return item;
	})));
	return {
		title: `中国管理现代化研究会 - ${$(".title_red").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

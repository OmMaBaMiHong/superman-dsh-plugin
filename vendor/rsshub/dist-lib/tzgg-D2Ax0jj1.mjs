import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/tsinghua/lib/tzgg.ts
const route = {
	path: "/lib/tzgg/:category",
	categories: ["university"],
	example: "/tsinghua/lib/tzgg/qtkx",
	parameters: { category: "分类，可在对应分类页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lib.tsinghua.edu.cn/tzgg/:category"] }],
	name: "图书馆通知公告",
	maintainers: ["linsenwang"],
	handler
};
async function handler(ctx) {
	const { category } = ctx.req.param();
	const host = `https://lib.tsinghua.edu.cn/tzgg/${category}.htm`;
	const $ = load(await rofetch(host));
	const feedTitle = $(".tags .on").text();
	const list = $("ul.notice-list li").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").first().text();
		const time = item.find(".notice-date").first().text();
		const a = item.find("a").first().attr("href");
		return {
			title,
			link: new URL(a, host).href,
			pubDate: time
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))(".v_news_content").first().html();
		return item;
	})));
	return {
		allowEmpty: true,
		title: "图书馆通知公告 - " + feedTitle,
		link: host,
		item: items
	};
}
//#endregion
export { route };

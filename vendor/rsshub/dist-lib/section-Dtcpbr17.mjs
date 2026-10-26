import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as rootUrl, t as ProcessFeed } from "./utils-D-Q4_5v9.mjs";
import { load } from "cheerio";
//#region lib/routes/p-articles/section.ts
const route = {
	path: "/section/:section",
	categories: ["reading"],
	example: "/p-articles/section/critics",
	parameters: { section: "版块名称, 可在对应版块 URL 中找到, 子版块链接用`-`连接" },
	name: "版块",
	maintainers: ["Insomnia1437"],
	handler,
	radar: [{ source: ["p-articles.com/:section/"] }]
};
async function handler(ctx) {
	let sectionName = ctx.req.param("section");
	sectionName = sectionName.replace("-", "/");
	sectionName += "/";
	const sectionUrl = new URL(sectionName, rootUrl).href;
	const $ = load(await rofetch(sectionUrl));
	const topInfo = {
		title: $("div.inner_top_title_01 > h1 > a").text(),
		link: new URL($("div.inner_top_title_01 > h1 > a").prop("href"), rootUrl).href
	};
	const list = $("div.contect_box_04 > a").toArray().map((element) => {
		return {
			title: $(element).find("h1").text().trim(),
			link: new URL($(element).attr("href"), rootUrl).href
		};
	});
	list.unshift(topInfo);
	return {
		title: "虚词 p-articles",
		link: sectionUrl,
		item: await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
			return ProcessFeed(info, await rofetch(info.link));
		}))),
		language: "zh-cn"
	};
}
//#endregion
export { route };

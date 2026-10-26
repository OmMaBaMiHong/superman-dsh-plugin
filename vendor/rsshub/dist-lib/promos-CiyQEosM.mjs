import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as renderDescription } from "./description-DHkubAuR.mjs";
import { load } from "cheerio";
//#region lib/routes/openrice/promos.ts
const baseUrl = "https://www.openrice.com";
const route = {
	path: "/:lang/hongkong/promos",
	maintainers: ["after9"],
	handler,
	categories: ["shopping"],
	example: "/openrice/zh/hongkong/promos",
	parameters: { lang: "语言，缺省为 zh" },
	name: "香港餐厅滋讯",
	description: `| 简体  | 繁體 | EN |
| ----- | ---- | -- |
| zh-cn | zh   | en |`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "zh";
	let urlPath;
	switch (lang) {
		case "zh-cn":
			urlPath = "/zh-cn/hongkong/promos";
			break;
		case "en":
			urlPath = "/en/hongkong/promos";
			break;
		default:
			urlPath = "/zh/hongkong/promos";
			break;
	}
	const $ = load(await rofetch(baseUrl + urlPath, {}));
	const title = $("title").text() ?? "Openrice - What's Hot";
	const description = $("meta[name=\"description\"]").attr("content") ?? "What's Hot from Openrice";
	const resultList = $(".article-listing-content-cell-wrapper").toArray().map((item) => {
		const $item = $(item);
		const title = $item.find(".title-name").text() ?? "";
		const link = $item.find("a.sr1-listing-content-cell").attr("href") ?? "";
		const coverImg = $item.find(".cover-photo").attr("style")?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] ?? null;
		return {
			title,
			description: renderDescription({
				description: $item.find(".article-details .desc").text() ?? "",
				image: coverImg
			}),
			link
		};
	});
	return {
		title,
		link: baseUrl + urlPath,
		description,
		item: resultList
	};
}
//#endregion
export { route };

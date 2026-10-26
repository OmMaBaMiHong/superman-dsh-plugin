import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/openrice/chart.tsx
const baseUrl = "https://www.openrice.com";
const route = {
	path: "/:lang/hongkong/explore/chart/:category",
	maintainers: ["after9"],
	handler,
	categories: ["shopping"],
	example: "/openrice/zh/hongkong/explore/chart/most-bookmarked",
	parameters: {
		lang: "语言，缺省为 zh",
		category: "类别，缺省为 most-bookmarked"
	},
	name: "香港餐廳排行榜",
	description: `| 简体  | 繁體 | EN |
| ----- | ---- | -- |
| zh-cn | zh   | en |

| 最多收藏        | 每周最高评分 | 最高浏览     | 最佳甜品餐厅 |
| --------------- | ------------ | ------------ | ------------ |
| most-bookmarked | best-rating  | most-popular | best-dessert |`
};
async function handler(ctx) {
	const urlPath = `/${ctx.req.param("lang") ?? "zh"}/hongkong/explore/chart/${ctx.req.param("category") ?? "most-bookmarked"}`;
	const $ = load(await rofetch(baseUrl + urlPath));
	const title = $("title").text() ?? "Hong Kong Restaurant Chart";
	const description = $("title").text() ?? "Hong Kong Restaurant Chart";
	const resultList = $(".poi-chart-main-grid-item-desktop-wrapper").toArray().map((item) => {
		const $item = $(item);
		const rankNumber = $item.find(".rank-icon").attr("class")?.match(/rank-(\d+)/)?.[1] ?? "";
		const desTagsArray = $item.find(".pcmgidtr-left-section-poi-info-details .pcmgidtrls-poi-info-details-text").toArray().map((tag) => $(tag).text());
		const title = $item.find(".pcmgidtr-left-section-poi-info-name .link").text() ?? "";
		const link = $item.find(".pcmgidtr-left-section-poi-info-name .link").attr("href") ?? "";
		const coverImg = $item.find(".pcmgidtr-left-section-door-photo img").attr("src") ?? null;
		return {
			title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h3", { children: `Rank: ${rankNumber} / ${title}` }),
				/* @__PURE__ */ jsx("p", { children: desTagsArray.join(" ") }),
				coverImg ? /* @__PURE__ */ jsx("img", { src: coverImg }) : null
			] })),
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

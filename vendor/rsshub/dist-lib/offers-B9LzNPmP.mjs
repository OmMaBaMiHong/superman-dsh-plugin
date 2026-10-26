import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as renderDescription } from "./description-DHkubAuR.mjs";
//#region lib/routes/openrice/offers.ts
const baseUrl = "https://www.openrice.com";
const route = {
	path: "/:lang/hongkong/offers",
	maintainers: ["after9"],
	handler,
	categories: ["shopping"],
	example: "/openrice/zh/hongkong/offers",
	parameters: { lang: "语言，缺省为 zh" },
	name: "香港餐廳精選優惠券",
	description: `| 简体  | 繁體 | EN |
| ----- | ---- | -- |
| zh-cn | zh   | en |`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "zh";
	let urlPath;
	switch (lang) {
		case "zh-cn":
			urlPath = "/zh-cn/hongkong/offers";
			break;
		case "en":
			urlPath = "/en/hongkong/offers";
			break;
		default:
			urlPath = "/zh/hongkong/offers";
			break;
	}
	const response = await rofetch("https://www.openrice.com/api/offers", {
		headers: { accept: "application/json" },
		query: {
			uiLang: lang,
			uiCity: "hongkong",
			page: 1,
			sortBy: "PublishTime",
			couponTypeId: 1
		}
	});
	const pageInfo = response.pageInfo;
	const highlightedOffers = response.highlightedOffers;
	const normalOffers = response.searchResult.paginationResult.results;
	const resultList = [...highlightedOffers, ...normalOffers].map((item) => {
		const title = item.title ?? "";
		const link = baseUrl + item.urlUI;
		const coverImg = item.doorPhotoUI.urls.full ?? "";
		return {
			title,
			description: renderDescription({
				description: item.couponType === 0 ? item.poiNameUI : `${item.desc} (${item.startTimeUI} - ${item.expireTimeUI}) [${item.multiplePoiDistrictName}]`,
				image: coverImg
			}),
			link
		};
	});
	return {
		title: pageInfo.seoInfo.title ?? "OpenRice Hong Kong Offers",
		link: baseUrl + urlPath,
		description: pageInfo.seoInfo.metadataDictionary.name.find((item) => item.key === "description")?.value ?? "OpenRice Hong Kong Offers",
		item: resultList
	};
}
//#endregion
export { route };

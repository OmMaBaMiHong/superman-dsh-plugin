import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as generateProductItem } from "./utils-CO-M_Un3.mjs";
//#region lib/routes/ikea/cn/family-offers.ts
const familyPriceProductsRequest = ({ pageIndex = 1 }) => got_default({
	method: "post",
	url: "https://www.ikea.cn/api-host/search/prod/advanced/special",
	headers: { "X-Client-Platform": "PcWeb" },
	json: {
		contentType: "PRODUCT,CONTENT,PLANNER",
		filters: {
			filters: {},
			sortOption: "RELEVANCE"
		},
		pageIndex,
		pageSize: 25,
		pageType: "",
		queryContent: "family_price"
	}
});
const productRequest = async (productIds) => {
	return (await got_default({
		url: "https://www.ikea.cn/api-host/content/products",
		headers: { "X-Client-Platform": "PcWeb" },
		searchParams: new URLSearchParams(productIds)
	})).data;
};
const route = {
	path: "/cn/family_offers",
	categories: ["shopping"],
	example: "/ikea/cn/family_offers",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ikea.cn/cn/zh/offers/family-offers", "ikea.cn/"] }],
	name: "中国 - 会员特惠",
	maintainers: ["jzhangdev"],
	handler,
	url: "ikea.cn/cn/zh/offers/family-offers"
};
async function handler() {
	const familyPriceProductIds = [];
	const productRequests = [];
	const familyPriceProductsLoadMore = async ({ pageIndex }) => {
		const { data: { productPage, products } } = (await familyPriceProductsRequest({ pageIndex })).data;
		for (const { id } of products) familyPriceProductIds.push(["ids", id]);
		if (productPage.end < productPage.total) await familyPriceProductsLoadMore({ pageIndex: pageIndex + 1 });
	};
	await familyPriceProductsLoadMore({ pageIndex: 1 });
	while (familyPriceProductIds.length) productRequests.push(productRequest(familyPriceProductIds.splice(0, 25)));
	return {
		title: "IKEA 宜家 - 会员特惠",
		link: "https://www.ikea.cn/cn/zh/offers/family-offers/",
		description: "会员特惠",
		item: (await Promise.all(productRequests)).flat().map((element) => generateProductItem(element))
	};
}
//#endregion
export { route };

import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as generateRequestHeaders, t as generateProductItem } from "./utils-CO-M_Un3.mjs";
//#region lib/routes/ikea/cn/new.ts
const request = ({ moreToken = "" }) => got_default({
	method: "post",
	url: "https://srv-mp.app.ikea.cn/content/search/products/advanced",
	headers: generateRequestHeaders(),
	searchParams: {
		keyword: "新品",
		moreToken
	},
	json: {}
});
const route = {
	path: "/cn/new",
	categories: ["shopping"],
	example: "/ikea/cn/new",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ikea.cn/cn/zh/new/", "ikea.cn/"] }],
	name: "中国 - 当季新品推荐",
	maintainers: ["jzhangdev"],
	handler,
	url: "ikea.cn/cn/zh/new/"
};
async function handler() {
	const allProductSummaries = [];
	const loadMoreRequest = async ({ moreToken }) => {
		const { data } = await request({ moreToken });
		allProductSummaries.push(data.productSummaries);
		if (data.moreToken) await loadMoreRequest({ moreToken: data.moreToken });
	};
	await loadMoreRequest({});
	return {
		title: "IKEA 宜家 - 当季新品推荐",
		link: "https://www.ikea.cn/cn/zh/new/",
		description: "当季新品推荐",
		item: allProductSummaries.flat().map((element) => generateProductItem(element))
	};
}
//#endregion
export { route };

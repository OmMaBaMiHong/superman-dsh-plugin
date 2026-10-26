import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as fetchSearchItems, i as fetchItemDetail, n as MercariSort, o as formatItemDetail, r as MercariStatus, t as MercariOrder } from "./util-bo4CYB96.mjs";
//#region lib/routes/mercari/search.ts
const route = {
	path: "/search/:query",
	categories: ["shopping"],
	example: "/mercari/search/keyword=シャツ&7bd3eacc-ae45-4d73-bc57-a611c9432014=340258ac-e220-4722-8c35-7f73b7382831",
	parameters: { query: "Search parameters in URL query string format." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search",
	maintainers: ["yana9i", "Tsuyumi25"],
	url: "jp.mercari.com",
	handler,
	description: `::: warning
此路由僅支援 \`jp.mercari.com\`，不支援 \`tw.mercari.com\` 和 \`hk.mercari.com\`。

**注意：** 不同站點的查詢參數格式不同

- 日本: \`keyword=シャツ&order=desc&sort=created_time&status=on_sale\`
- 台灣: \`keyword=シャツ&sort=new&status=in-stock&availability=1\`

:::`
};
function parseSearchQuery(queryString) {
	const params = new URLSearchParams(queryString);
	const keyword = params.get("keyword") || "";
	const sort = MercariSort[params.get("sort")] || MercariSort.default;
	const order = MercariOrder[params.get("order")] || MercariOrder.desc;
	const statusMap = {
		on_sale: "onsale",
		"sold_out|trading": "soldout"
	};
	const statusArray = params.get("status")?.split(",").map((s) => MercariStatus[statusMap[s]]).filter(Boolean) || [];
	const attributeIds = [
		"7bd3eacc-ae45-4d73-bc57-a611c9432014",
		"47295d80-5839-4237-bbfc-deb44b4e7999",
		"f42ae390-04ff-46ea-808b-f5d97cb45db4",
		"d664efe3-ae5a-4824-b729-e789bf93aba9"
	];
	const attributes = [];
	for (const id of attributeIds) {
		const values = params.get(id);
		if (values) attributes.push({
			id,
			values: values.split(",")
		});
	}
	return {
		keyword,
		sort,
		order,
		status: statusArray,
		options: {
			categoryId: params.get("category_id")?.split(",").map(Number),
			brandId: params.get("brand_id")?.split(",").map(Number),
			priceMin: params.get("price_min") ? Number(params.get("price_min")) : void 0,
			priceMax: params.get("price_max") ? Number(params.get("price_max")) : void 0,
			itemConditionId: params.get("item_condition_id")?.split(",").map(Number),
			excludeKeyword: params.get("exclude_keyword") || void 0,
			itemTypes: params.get("item_types")?.split(",").map((type) => type === "mercari" ? "ITEM_TYPE_MERCARI" : type === "beyond" ? "ITEM_TYPE_BEYOND" : type),
			attributes
		}
	};
}
async function handler(ctx) {
	const queryString = ctx.req.param("query");
	const { keyword, sort, order, status, options } = parseSearchQuery(queryString);
	const searchItems = (await fetchSearchItems(sort, order, status, keyword, options)).items;
	const items = await Promise.all(searchItems.map((item) => cache_default.tryGet(`mercari:${item.id}:${item.updated}`, async () => formatItemDetail(await fetchItemDetail(item.id, item.itemType)))));
	return {
		title: `${keyword} の検索結果`,
		link: `https://jp.mercari.com/search?${queryString}`,
		description: `Mercari advanced search results for: ${queryString}`,
		item: items
	};
}
//#endregion
export { route };
